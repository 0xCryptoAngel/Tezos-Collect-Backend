import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { UpdatePresaleInfoDto } from './dto/update-presaleInfo.dto';
import { PresaleInfoService } from './presale.service';

import { UpdatePartnerDto } from './dto/update-partner.dto';

@Controller('presales')
export class PresaleController {
  constructor(private readonly service: PresaleInfoService) {}

  @Get()
  async index() {
    return await this.service.findAll();
  }
  @Get('upcoming')
  async upcomingPresales() {
    return await this.service.upcomingPresales();
  }

  @Get(':address')
  async find(@Param('address') address: string) {
    return await this.service.findOne(address);
  }

  @Post()
  async create(@Body() createPresaleInfoDto: UpdatePresaleInfoDto) {
    return await this.service.create(createPresaleInfoDto);
  }

  @Put(':address')
  async udpate(
    @Param('address') address: string,
    @Body() updatePresaleInfoDto: UpdatePresaleInfoDto,
  ) {
    return await this.service.update(address, updatePresaleInfoDto);
  }

  @Delete(':address')
  async delete(@Param('address') address: string) {
    return await this.service.delete(address);
  }

  @Get('partners/:address')
  async find_partner(@Param('address') address: string) {
    return await this.service.findOnePartner(address);
  }

  @Post('partners')
  async create_partner(@Body() updatePartnerDto: UpdatePartnerDto) {
    console.log(updatePartnerDto);
    return await this.service.create_partner(updatePartnerDto);
  }

  @Put('partners/:address')
  async udpate_partner(
    @Param('address') address: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ) {
    return await this.service.update_partner(address, updatePartnerDto);
  }

  @Get('owner/:chainId/:owner')
  async presalesByOwner(
    @Param('chainId') chainId: number,
    @Param('owner') owner: string,
  ) {
    return await this.service.presalesByOwner(chainId, owner);
  }

  @Post('like/:address/:wallet')
  async like(
    @Param('address') address: string,
    @Param('wallet') wallet: string,
  ) {
    return await this.service.likeToggle(address, wallet);
  }
}
