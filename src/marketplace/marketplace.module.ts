import { Module } from '@nestjs/common';
import { PresaleInfoService } from './marketplace.service';
import { PresaleController } from './marketplace.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PresaleInfo, PresaleInfoSchema } from './schema/presaleInfo.schema';
import { Collection, CollectionSchema } from './schema/collection.schema';
import { TEZOS_COLLECT_NETWORK } from 'src/helpers/constants';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { DomainService } from './domain.service';
import { DomainController } from './domain.controller';
import { Domain } from 'domain';
import { DomainSchema } from './schema/domain.schema';

@Module({
  providers: [PresaleInfoService, CollectionService, DomainService],
  controllers: [PresaleController, CollectionController, DomainController],
  imports: [
    MongooseModule.forFeature(
      [
        { name: PresaleInfo.name, schema: PresaleInfoSchema },
        { name: Collection.name, schema: CollectionSchema },
        { name: Domain.name, schema: DomainSchema },
      ],
      TEZOS_COLLECT_NETWORK,
    ),
  ],
})
export class PresaleModule {}
