import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Collection } from './collection.schema';
import { SchemaTypes, Document, Types } from 'mongoose';
import { MORE_COLLECTION_ID } from 'src/helpers/constants';

export type ProfileDocument = Profile & Document;

@Schema()
export class Profile {
  @Prop({ unique: true })
  address: string;

  @Prop({ default: '' })
  avatarLink: string;

  @Prop({ default: '' })
  reversedName: string;

  @Prop({ default: 0 })
  totalVolume: number;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
