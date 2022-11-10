import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Domain } from 'domain';
import { Model } from 'mongoose';
import { MS_PER_DAY } from 'src/helpers/constants';
import { I_COLLECTION_HOLDER } from 'src/helpers/interface';
import { UpdateCollectionDto } from './dto/collection.dto';
import { Collection, CollectionDocument } from './schema/collection.schema';
import { DomainDocument } from './schema/domain.schema';
import {
  DomainActivity,
  DomainActivityDocument,
} from './schema/domain_activity.schema';

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(Collection.name)
    private readonly collectionModel: Model<CollectionDocument>,
    @InjectModel(Domain.name)
    private readonly domainModel: Model<DomainDocument>,
    @InjectModel(DomainActivity.name)
    private readonly domainActivityModel: Model<DomainActivityDocument>,
  ) {}

  async findAll(): Promise<CollectionDocument[]> {
    const all = await this.collectionModel
      .find()
      .select({
        // _id: 0,
        __v: 0,
      })
      .exec();
    // all.forEach((item) => item.save());
    return all;
  }
  async getHolderInformation(slug: string): Promise<I_COLLECTION_HOLDER[]> {
    const collection = await this.findOneBySlug(slug);
    const holders: I_COLLECTION_HOLDER[] = await this.domainModel.aggregate([
      { $match: { collectionId: collection._id, isRegistered: true } },
      {
        $group: { _id: '$owner', count: { $sum: 1 } },
      },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);
    return holders;
  }

  async findOneBySlug(slug: string): Promise<CollectionDocument> {
    return await this.collectionModel.findOne({ slug }).exec();
  }

  async findOneById(id): Promise<CollectionDocument> {
    return await this.collectionModel.findById(id).exec();
  }

  async updateOneBySlug(
    slug: string,
    updateCollectionDto: UpdateCollectionDto,
  ): Promise<Collection> {
    return await this.collectionModel
      .findOneAndUpdate(
        { slug },
        { ...updateCollectionDto },
        {
          returnDocument: 'after',
          upsert: true,
        },
      )
      .exec();
  }

  async updateCollections() {
    const collections = await this.findAll();
    collections.forEach(async (collection) => {
      const [
        numberOfMinted,
        numberOfItems,
        numberOfOwners,
        volumeDay,
        volumeMonth,
        floorPrice,
      ] = await Promise.all([
        this.domainModel
          .find({ collectionId: collection._id, isRegistered: true })
          .count(),
        this.domainModel.find({ collectionId: collection._id }).count(),
        this.domainModel.aggregate([
          {
            $match: {
              collectionId: collection._id,
            },
          },
          {
            $group: { _id: '$owner', owners: { $addToSet: '$owner' } },
          },
          {
            $unwind: '$owners',
          },
          {
            $group: { _id: null, ownerCount: { $sum: 1 } },
          },
        ]),
        this.domainActivityModel.aggregate([
          {
            $match: {
              collectionId: collection._id,
              timestamp: {
                $gte: new Date(new Date().getTime() - MS_PER_DAY),
              },
              type: {
                $in: ['BUY_FROM_SALE', 'COMPLETE_AUCTION', 'SELL_ON_OFFER'],
              },
            },
          },
          { $group: { _id: null, amount: { $sum: '$amount' } } },
        ]),
        this.domainActivityModel.aggregate([
          {
            $match: {
              collectionId: collection._id,
              timestamp: {
                $gte: new Date(new Date().getTime() - MS_PER_DAY * 30),
              },
              type: {
                $in: ['BUY_FROM_SALE', 'COMPLETE_AUCTION', 'SELL_ON_OFFER'],
              },
            },
          },
          { $group: { _id: null, amount: { $sum: '$amount' } } },
        ]),
        this.domainModel
          .findOne({ collectionId: collection._id, price: { $gt: 0 } })
          .sort({ price: 1 })

          .exec(),
      ]);

      collection.numberOfMinted = numberOfMinted;
      collection.numberOfItems = numberOfItems;
      collection.numberOfOwners = numberOfOwners[0]?.ownerCount || 0;
      // console.log(
      //   collection.slug,
      //   numberOfMinted,
      //   numberOfOwners[0].ownerCount,
      // );
      if (volumeDay[0]) {
        const oldVolumeDay =
          collection.volumeDay / (1 + collection.volumeDayChange);
        collection.volumeDay = volumeDay[0].amount;
        collection.volumeDayChange =
          collection.volumeDay / (oldVolumeDay + 0.1) - 1;
      } else collection.volumeDay = 0;

      if (floorPrice) {
        const oldFloorPrice =
          collection.floorPrice / (1 + collection.floorPriceChange);
        collection.floorPrice = floorPrice.price;
        collection.floorPriceChange = collection.floorPrice / oldFloorPrice - 1;
      }

      if (volumeMonth[0]) {
        const oldVolumeMonth =
          collection.volumeMonth / (1 + collection.volumeMonthChange);
        collection.volumeMonth = volumeMonth[0].amount;
        collection.volumeMonthChange =
          collection.volumeMonth / oldVolumeMonth - 1;
      } else collection.volumeMonth = 0;

      let time = new Date().getTime();
      time = time - (time % MS_PER_DAY);
      if (time - collection.volumeLastUpdated.getTime() >= MS_PER_DAY) {
        collection.volumeLastUpdated = new Date(time);
      }

      if (time - collection.volumeMonthLastUpdated.getTime() >= MS_PER_DAY * 30)
        collection.volumeMonthLastUpdated = new Date(time);

      collection.save();
    });
  }
}
