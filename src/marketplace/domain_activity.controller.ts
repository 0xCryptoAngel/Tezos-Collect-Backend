import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { DomainActivityService } from './domain_activity.service';
import { CreateDomainActivityDto } from './dto/domain_activity.dto';

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
}
