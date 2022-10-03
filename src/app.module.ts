import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PresaleModule } from './marketplace/marketplace.module';
import { TEZOS_COLLECT_NETWORK } from './helpers/constants';
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(
      `${MONGODB_URI}/${TEZOS_COLLECT_NETWORK}?authSource=admin`,
      {
        connectionName: TEZOS_COLLECT_NETWORK,
      },
    ),
    PresaleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
