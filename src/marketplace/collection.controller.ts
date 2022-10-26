import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { UpdateCollectionDto } from './dto/collection.dto';

@Controller('collections')
export class CollectionController {
  constructor(private readonly service: CollectionService) {}

  @Get()
  async index() {
    return await this.service.findAll();
  }

  @Put(':slug')
  async updateOneBySlug(
    @Param('slug') slug: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    return await this.service.updateOneBySlug(slug, updateCollectionDto);
  }

  @Get('holder/:slug')
  async getHolderInformation(@Param('slug') slug: string) {
    return await this.service.getHolderInformation(slug);
  }

  @Get('test')
  async testFunc() {
    this.service.updateCollections();
  }
}
