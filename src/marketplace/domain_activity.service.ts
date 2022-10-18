import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TEZOS_COLLECT_SECRET } from 'src/helpers/constants';
import { decryptAnyWithAES } from 'src/helpers/text-crypt';
import { CollectionService } from './collection.service';
import { DomainService } from './domain.service';
import { CreateDomainActivityDto } from './dto/domain_activity.dto';
import { DomainDocument } from './schema/domain.schema';

import {
  DomainActivity,
  DomainActivityDocument,
} from './schema/domain_activity.schema';

@Injectable()
export class DomainActivityService {
  constructor(
    @InjectModel(DomainActivity.name)
    private readonly domainActivityModel: Model<DomainActivityDocument>,
    private readonly domainService: DomainService,
    private readonly collectionService: CollectionService,
  ) {}

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
    const collection = await this.collectionService.findOneById(
      domain.collectionId,
    );
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
}
