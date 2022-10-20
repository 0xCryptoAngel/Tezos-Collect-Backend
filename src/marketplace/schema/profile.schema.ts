import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

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

  @Prop({ default: [] })
  bookmarkedNames: string[];
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
