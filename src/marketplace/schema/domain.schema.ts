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
  @Prop({ default: new Date(0) })
  lastSoldAt: Date;
  @Prop({ default: 0 })
  lastSoldAmount: number;

  @Prop({ default: false })
  isRegisterd: boolean;
  // @Prop({ default: new Date(0) })
  // registeredAt: Date;
  @Prop({ default: new Date(0) })
  expiresAt: Date;

  @Prop({ default: false })
  isForSale: boolean;
  @Prop({ default: 0 })
  price: number;

  @Prop({ default: new Date(0) })
  saleStartedAt: Date;
  @Prop({ default: new Date(0) })
  saleEndsAt: Date;
  @Prop({ default: 0 })
  topOffer: number;
  @Prop({ default: '' })
  topOfferer: string;

  @Prop({ default: false })
  isForAuction: boolean;
  @Prop({ default: new Date(0) })
  auctionStartedAt: Date;
  @Prop({ default: new Date(0) })
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
  @Prop({ default: false })
  includingOperator: boolean;
}

export const DomainSchema = SchemaFactory.createForClass(Domain);
