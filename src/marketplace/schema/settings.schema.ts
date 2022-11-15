import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export type SettingDocument = Setting & Document;

@Schema()
export class Setting {
  @Prop({ default: 0 })
  lastOfferTokenId: number;

  @Prop({ default: 0 })
  lastPk: number;

  @Prop({ default: 0 })
  totalDomains: number;

  @Prop({ default: 0 })
  totalOwners: number;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
