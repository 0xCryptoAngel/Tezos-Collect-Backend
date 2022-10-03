import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
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
}
