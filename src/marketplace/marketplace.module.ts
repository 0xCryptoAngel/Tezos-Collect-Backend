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
import { DomainActivityController } from './domain_activity.controller';
import { DomainActivityService } from './domain_activity.service';
import { Domain } from 'domain';
import { DomainSchema } from './schema/domain.schema';
import {
  DomainActivity,
  DomainActivitySchema,
} from './schema/domain_activity.schema';
import { CronService } from './cron.service';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { Profile, ProfileSchema } from './schema/profile.schema';

@Module({
  providers: [
    PresaleInfoService,
    CollectionService,
    DomainService,
    DomainActivityService,
    CronService,
    ProfileService,
  ],
  controllers: [
    PresaleController,
    CollectionController,
    DomainController,
    DomainActivityController,
    ProfileController,
  ],
  imports: [
    MongooseModule.forFeature(
      [
        { name: PresaleInfo.name, schema: PresaleInfoSchema },
        { name: Collection.name, schema: CollectionSchema },
        { name: Domain.name, schema: DomainSchema },
        { name: DomainActivity.name, schema: DomainActivitySchema },
        { name: Profile.name, schema: ProfileSchema },
      ],
      TEZOS_COLLECT_NETWORK,
    ),
  ],
})
export class PresaleModule {}
