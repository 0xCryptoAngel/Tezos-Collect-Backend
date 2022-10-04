import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { PresaleInfoService } from './marketplace.service';

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

  @Delete(':address')
  async delete(@Param('address') address: string) {
    return await this.service.delete(address);
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
