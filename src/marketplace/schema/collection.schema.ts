import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CollectionDocument = Collection & Document;

@Schema()
export class Collection {
  @Prop({ unique: true })
  slug: string;

  @Prop({ default: 'A' })
  avatar: string;

  @Prop({ default: '' })
  label: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  discordLink: string;

  @Prop({ default: 0 })
  numberOfItems: number;
  @Prop({ default: 0 })
  numberOfOwners: number;

  @Prop({ default: 0 })
  totalVolume: number;
  @Prop({ default: 0 })
  topSale: number;
  @Prop({ default: 0 })
  floorPrice: number;

  @Prop({ default: 0 })
  volumeDay: number;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
