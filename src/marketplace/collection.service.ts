import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateCollectionDto } from './dto/collection.dto';
import { Collection, CollectionDocument } from './schema/collection.schema';

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(Collection.name)
    private readonly collectionModel: Model<CollectionDocument>,
  ) {}

  async findAll(): Promise<Collection[]> {
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
  async findOneBySlug(slug: string): Promise<CollectionDocument> {
    return await this.collectionModel.findOne({ slug }).exec();
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
}
