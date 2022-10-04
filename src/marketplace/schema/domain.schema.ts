import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Collection } from './collection.schema';
import { SchemaTypes, Document, Types } from 'mongoose';
import { MORE_COLLECTION_ID } from 'src/helpers/constants';

export type DomainDocument = Domain & Document;

@Schema()
export class Domain {
  @Prop({ unique: true })
  name: string;
  @Prop({ default: '' })
  owner: string;
  @Prop({ default: [] })
  tags: string[];
  @Prop({ default: 0 })
  lastSoldAt: Date;
  @Prop({ default: 0 })
  lastSoldAmount: number;

  @Prop({ default: false })
  isRegisterd: boolean;
  @Prop({})
  registeredAt: Date;
  @Prop({})
  expiresAt: Date;

  @Prop({ default: false })
  isForSale: boolean;
  @Prop({ default: 0 })
  price: number;

  @Prop()
  saleStartedAt: Date;
  @Prop()
  saleEndsAt: Date;
  @Prop({ default: 0 })
  topOffer: number;
  @Prop({ default: '' })
  topOfferer: string;

  @Prop({ default: false })
  isForAuction: boolean;
  @Prop()
  auctionStartedAt: Date;
  @Prop()
  auctionEndsAt: Date;
  @Prop({ default: 0 })
  topBid: number;
  @Prop({ default: '' })
  topBidder: string;

  @Prop()
  tokenId: number;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: Collection.name,
    default: MORE_COLLECTION_ID,
  })
  collectionId: Types.ObjectId;

  @Prop({ default: false })
  isFeatured: boolean;
}

export const DomainSchema = SchemaFactory.createForClass(Domain);
