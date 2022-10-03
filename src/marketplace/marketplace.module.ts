import { Module } from '@nestjs/common';
import { PresaleInfoService } from './marketplace.service';
import { PresaleController } from './marketplace.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PresaleInfo, PresaleInfoSchema } from './schema/presaleInfo.schema';
import { Collection, CollectionSchema } from './schema/collection.schema';

@Module({
  providers: [PresaleInfoService],
  controllers: [PresaleController],
  imports: [
    MongooseModule.forFeature(
      [
        { name: PresaleInfo.name, schema: PresaleInfoSchema },
        { name: Collection.name, schema: CollectionSchema },
      ],
      'ghostnet',
    ),
  ],
})
export class PresaleModule {}
