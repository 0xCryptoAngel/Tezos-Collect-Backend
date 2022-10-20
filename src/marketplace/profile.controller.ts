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
import { ProfileService } from './profile.service';
import { DomainService } from './domain.service';
import { QueryDomainDto, UpdateDomainDto } from './dto/domain.dto';
import { CollectionDocument } from './schema/collection.schema';
import { UpdateProfileDto } from './dto/profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @Get()
  async index() {
    return await this.service.findAll();
  }

  @Get(':address')
  async getOneByaddress(@Param('address') address: string) {
    return await this.service.getInfoByAddress(address);
  }
  @Put(':address')
  async updateOneByaddress(
    @Param('address') address: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return await this.service.updateOneByAddress(address, updateProfileDto);
  }
}
