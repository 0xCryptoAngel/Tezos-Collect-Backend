import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import { T_DOMAIN_ACTIVITY_TYPE } from 'src/helpers/interface';

export type DomainActivityDocument = DomainActivity & Document;

@Schema()
export class DomainActivity {
  @Prop({ index: true, required: true })
  name: string;

  @Prop({ index: true, unique: true, required: true })
  uuid: string;

  @Prop({ required: true })
  type: T_DOMAIN_ACTIVITY_TYPE;

  @Prop()
  timestamp: Date;

  @Prop({ default: 0 })
  amount: number;

  @Prop()
  txHash: string;

  @Prop()
  from: string; // address

  @Prop()
  to: string; // address
}

export const DomainActivitySchema =
  SchemaFactory.createForClass(DomainActivity);
