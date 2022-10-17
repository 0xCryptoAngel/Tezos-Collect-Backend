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
import { CollectionService } from './collection.service';
import { DomainService } from './domain.service';
import { QueryDomainDto, UpdateDomainDto } from './dto/domain.dto';
import { CollectionDocument } from './schema/collection.schema';

@Controller('domains')
export class DomainController {
  constructor(
    private readonly service: DomainService,
    private readonly collectionService: CollectionService,
  ) {}

  @Get()
  async index() {
    return await this.service.findAll();
  }

  @Get('/collection/:slug')
  async getDomainsBySlug(@Param('slug') slug: string) {
    const collection: CollectionDocument =
      await this.collectionService.findOneBySlug(slug);
    if (!collection) {
      throw new HttpException(
        'DOMAIN_C:DOMAIN_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.service.getDomainsByCollectionId(collection._id);
  }

  @Put(':name')
  async updateOneByName(
    @Param('name') name: string,
    @Body() updateDomainDto: UpdateDomainDto,
  ) {
    return await this.service.updateOneByName(name, updateDomainDto);
  }

  @Get('/top-sales')
  async getTopSales() {
    return await this.service.getTopSaleDomains();
  }

  @Get('/featured-auctions')
  async getFeaturedAuctions() {
    return await this.service.getFeaturedAuctions();
  }

  @Get('/auctions')
  async getAuctionedDomains() {
    return await this.service.getAuctionedDomains();
  }

  @Get('/find/:name')
  async getDomainByName(@Param('name') name: string) {
    return await this.service.getDomainByName(name);
  }
  @Post('/query')
  async queryDomain(@Body() queryDomainDto: QueryDomainDto) {
    return await this.service.queryDomain(queryDomainDto);
  }

  @Get('/test-link')
  async testLink() {
    // 634b6b5273871fad49b322fd
    return await this.service.testFunction();
  }
}
