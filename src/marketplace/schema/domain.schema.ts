import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Collection } from './collection.schema';
import { SchemaTypes, Document, Types } from 'mongoose';

export type DomainDocument = Domain & Document;

@Schema()
export class Domain {
  @Prop({ unique: true })
  name: string;

  @Prop()
  tokenId: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: Collection.name, default: null })
  collectionId: Types.ObjectId;
}

export const DomainSchema = SchemaFactory.createForClass(Domain);
