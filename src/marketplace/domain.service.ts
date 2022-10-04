import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UpdateDomainDto } from './dto/domain.dto';
import { Domain, DomainDocument } from './schema/domain.schema';

@Injectable()
export class DomainService {
  constructor(
    @InjectModel(Domain.name)
    private readonly domainModel: Model<DomainDocument>,
  ) {}

  async findAll(): Promise<Domain[]> {
    const all = await this.domainModel.find().exec();

    all.forEach((item) => {
      const isForAuction = Math.random() > 0.5;
      item.isForAuction = isForAuction;
      if (isForAuction) {
        item.topBid = Math.random() * 150;
        item.auctionStartedAt = new Date(
          new Date().getTime() - Math.random() * 87600 * 15 * 1000,
        );
        item.auctionEndsAt = new Date(
          item.auctionStartedAt.getTime() + 87600 * 30 * 1000,
        );
        const isFeatured = Math.random() > 0.9;
        item.isFeatured = isFeatured;
      }
      item.save();
    });
    return all;
  }

  async getDomainsByCollectionId(collectionId: string): Promise<Domain[]> {
    const all = await this.domainModel.find({ collectionId }).exec();
    return all;
  }

  async updateOneByName(
    name: string,
    updateDomainDto: UpdateDomainDto,
  ): Promise<Domain> {
    return await this.domainModel
      .findOneAndUpdate(
        { name },
        { ...updateDomainDto },
        {
          returnDocument: 'after',
          upsert: true,
        },
      )
      .exec();
  }

  async getTopSaleDomains(): Promise<Domain[][]> {
    const durations = [
      {
        seconds: 87600, // 24 hr
      },
      {
        seconds: 87600 * 7, // 7 days
      },
      {
        seconds: 87600 * 30, // 30 days
      },
    ];
    const result: Domain[][] = await Promise.all(
      durations.map((item, index) => {
        return (
          this.domainModel
            .find({
              lastSoldAt: { $gt: new Date().getTime() - item.seconds * 1000 },
            })
            // .sort({ lastSoldAmount: -1 })
            // .limit(10)
            .exec()
        );
      }),
    );
    return result.map((result) =>
      result
        .sort((itemA, itemB) => itemB.lastSoldAmount - itemA.lastSoldAmount)
        .slice(0, 5),
    );
  }
  async getFeaturedAuctions(): Promise<Domain[]> {
    const result: Domain[] = await this.domainModel
      .find({ isFeatured: true, isForAuction: true })
      .limit(5)
      .exec();
    return result;
  }

  async getAuctionedDomains(): Promise<Domain[]> {
    const result: Domain[] = await this.domainModel
      .find({ isForAuction: true })
      .limit(20)
      .exec();
    return result;
  }
  async getDomainsByName(name: string): Promise<Domain> {
    return await this.domainModel.findOne({ name }).exec();
  }
}
