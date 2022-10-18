import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DomainActivityService } from './domain_activity.service';
import {
  CreateDomainActivityDto,
  QueryDomainActivityDto,
} from './dto/domain_activity.dto';

@Controller('domain-activity')
export class DomainActivityController {
  constructor(private readonly service: DomainActivityService) {}

  @Get()
  async index() {
    return await this.service.findAll();
  }

  @Get(':domain')
  async activityByDomain(@Param('domain') domain: string) {
    return await this.service.activityByDomain(domain);
  }

  @Post()
  async createActivity(
    @Body() createDomainActivityDto: CreateDomainActivityDto,
  ) {
    return await this.service.createActivity(createDomainActivityDto);
  }

  @Post('query')
  async queryDomainActivity(
    @Body() queryDomainActivityDto: QueryDomainActivityDto,
  ) {
    return await this.service.queryDomainActivity(queryDomainActivityDto);
  }
}
