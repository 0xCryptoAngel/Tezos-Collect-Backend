import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ProfileService } from './profile.service';
import {
  UpdateAvatarLinkDto,
  UpdateBookedmarkedNamesDto,
  UpdateProfileDto,
} from './dto/profile.dto';

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
  @Put('favorites/:address')
  async updateBookmarkedNamesByAddress(
    @Param('address') address: string,
    @Body() updateBookedmarkedNamesDto: UpdateBookedmarkedNamesDto,
  ) {
    return await this.service.updateBookmarkedNamesByAddress(
      address,
      updateBookedmarkedNamesDto,
    );
  }
  @Put('avatar/:address')
  async updateAvatarByAddress(
    @Param('address') address: string,
    @Body() updateAvatarLinkDto: UpdateAvatarLinkDto,
  ) {
    return await this.service.updateAvatarByAddress(
      address,
      updateAvatarLinkDto,
    );
  }

  @Get('favorites/:address')
  async getBookmarkedNamesByAddress(@Param('address') address: string) {
    return await this.service.getBookmarkedNamesByAddress(address);
  }
}
