import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DEFAULT_PAGE_SIZE, TEZOS_COLLECT_SECRET } from 'src/helpers/constants';
import { decryptAnyWithAES } from 'src/helpers/text-crypt';
import { CollectionService } from './collection.service';
import { DomainService } from './domain.service';
import {
  CreateDomainActivityDto,
  QueryDomainActivityDto,
} from './dto/domain_activity.dto';
import { ProfileService } from './profile.service';
import { CollectionDocument } from './schema/collection.schema';
import { DomainDocument } from './schema/domain.schema';

import {
  DomainActivity,
  DomainActivityDocument,
} from './schema/domain_activity.schema';
import { Profile, ProfileDocument } from './schema/profile.schema';

@Injectable()
export class DomainActivityService {
  constructor(
    @InjectModel(DomainActivity.name)
    private readonly domainActivityModel: Model<DomainActivityDocument>,
    private readonly domainService: DomainService,
    private readonly collectionService: CollectionService,

    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
  ) {}

  async findAProfile(address: string): Promise<ProfileDocument> {
    const _profile = await this.profileModel.findOne({ address }).exec();

    if (_profile) {
      return _profile;
    }
    return await this.profileModel.create({ address });
  }

  async findAll(): Promise<DomainActivity[]> {
    const all = await this.domainActivityModel
      .find()
      .select({
        _id: 0,
        __v: 0,
        uuid: 0,
      })
      .exec();
    // all.forEach((item) => item.save());
    return all;
  }

  async activityByDomain(name: string): Promise<DomainActivity[]> {
    const all = await this.domainActivityModel
      .find({ name })
      .select({
        _id: 0,
        __v: 0,
        uuid: 0,
      })
      .exec();
    return all;
  }
  async activityByAddress(address: string): Promise<DomainActivity[]> {
    const all = await this.domainActivityModel
      .find({ $or: [{ from: address }, { to: address }] })
      .select({
        _id: 0,
        __v: 0,
        uuid: 0,
      })
      .exec();
    return all;
  }

  async createActivity(
    createDomainActivityDto: CreateDomainActivityDto,
  ): Promise<DomainActivity> {
    if (this.checkSignature(createDomainActivityDto) === false) {
      throw new HttpException(
        'DOMAINACTIVITY_S:INVALID_SIGNATURE',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.updateDomainDetails(createDomainActivityDto);
    return await this.domainActivityModel.create(createDomainActivityDto);
  }

  async updateDomainDetails(createDomainActivityDto: CreateDomainActivityDto) {
    const domain: DomainDocument = await this.domainService.getDomainByName(
      createDomainActivityDto.name,
    );
    const [collection, profileFrom, profileTo]: [
      CollectionDocument,
      ProfileDocument,
      ProfileDocument,
    ] = await Promise.all([
      this.collectionService.findOneById(domain.collectionId),
      this.findAProfile(createDomainActivityDto.from),
      this.findAProfile(createDomainActivityDto.to),
    ]);
    switch (createDomainActivityDto.type) {
      case 'COMPLETE_AUCTION':
      case 'BUY_FROM_SALE':
      case 'SELL_ON_OFFER':
        domain.lastSoldAmount = createDomainActivityDto.amount;
        domain.lastSoldAt = new Date();
        collection.totalVolume += createDomainActivityDto.amount;
        collection.volumeDay += createDomainActivityDto.amount;
        collection.volumeMonth += createDomainActivityDto.amount;
        collection.topSale = Math.max(
          collection.topSale,
          createDomainActivityDto.amount,
        );
        profileTo.totalVolume += createDomainActivityDto.amount;
        profileFrom.totalVolume += createDomainActivityDto.amount;
        profileFrom.save();
        profileTo.save();
        domain.save();
        collection.save();
        break;
      case 'NEW_OFFER':
        domain.topOffer = Math.max(
          domain.topOffer,
          createDomainActivityDto.amount,
        );
        domain.topOfferer = createDomainActivityDto.from;
        domain.save();
      case 'LIST_FOR_AUCTION':
      case 'LIST_FOR_SALE':
        collection.floorPrice = Math.min(
          collection.floorPrice || createDomainActivityDto.amount,
          createDomainActivityDto.amount,
        );
        collection.save();
        break;
      default:
        break;
    }
  }

  checkSignature(createDomainActivityDto: CreateDomainActivityDto): boolean {
    const signature = createDomainActivityDto.signature || '';
    delete createDomainActivityDto.signature;

    return (
      decryptAnyWithAES(signature, TEZOS_COLLECT_SECRET) ===
      JSON.stringify(createDomainActivityDto)
    );
  }

  async queryDomainActivity(
    queryDomainActivityDto: QueryDomainActivityDto,
  ): Promise<{ domainActivities: DomainActivityDocument[]; count: number }> {
    let queryFilter = this.domainActivityModel.find({});

    if (queryDomainActivityDto.searchOptions.type?.length >= 0) {
      queryFilter = queryFilter.find({
        type: queryDomainActivityDto.searchOptions.type,
      });
    }
    if (queryDomainActivityDto.searchOptions.from?.length >= 0) {
      queryFilter = queryFilter.find({
        from: queryDomainActivityDto.searchOptions.from,
      });
    }
    if (queryDomainActivityDto.searchOptions.to?.length >= 0) {
      queryFilter = queryFilter.find({
        to: queryDomainActivityDto.searchOptions.to,
      });
    }

    // collectionId
    if (queryDomainActivityDto.searchOptions.collectionId?.length >= 0) {
      queryFilter = queryFilter.find({
        collectionId: queryDomainActivityDto.searchOptions.collectionId,
      });
    }

    const _copiedQueryObj = queryFilter.clone();
    const count = await _copiedQueryObj.count();

    // searchOptions.offset
    if (queryDomainActivityDto.searchOptions.offset)
      queryFilter = queryFilter.skip(
        queryDomainActivityDto.searchOptions.offset *
          queryDomainActivityDto.searchOptions.pageSize || DEFAULT_PAGE_SIZE,
      );
    // searchOptions.pageSize
    queryFilter = queryFilter.limit(
      queryDomainActivityDto.searchOptions.pageSize || DEFAULT_PAGE_SIZE,
    );

    // sortOption
    switch (queryDomainActivityDto.sortOption) {
      case 'AMOUNT_ASC':
        queryFilter = queryFilter.sort({ amount: 1 });
        break;
      case 'AMOUNT_DESC':
        queryFilter = queryFilter.sort({ amount: -1 });
        break;
      case 'TIMESTAMP_ASC':
        queryFilter = queryFilter.sort({ timestamp: 1 });
        break;
      case 'TIMESTAMP_DESC':
        queryFilter = queryFilter.sort({ timestamp: -1 });
        break;
      default:
        break;
    }

    return {
      count,
      domainActivities: await queryFilter.exec(),
    };
  }
}
