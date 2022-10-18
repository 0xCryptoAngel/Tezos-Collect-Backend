import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import axios from 'axios';
import { DomainService } from './domain.service';
import { CollectionService } from './collection.service';
require('dotenv').config();

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly domainService: DomainService,
    private readonly collectionService: CollectionService,
  ) {}
  // refetch new pairs every 5 minutes
  @Cron('*/5 * * * * *')
  async updateCollections() {
    this.collectionService.updateCollections();
    // this.logger.verbose(new Date());
  }
}
