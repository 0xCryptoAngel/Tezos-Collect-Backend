import { verifySignature } from '@taquito/utils';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DomainService } from './domain.service';
import { DomainActivityService } from './domain_activity.service';
import {
  ProfileDataDto,
  UpdateProfileDto,
  UpdateBookedmarkedNamesDto,
  UpdateAvatarLinkDto,
} from './dto/profile.dto';

import { Domain, DomainDocument } from './schema/domain.schema';
import { Profile, ProfileDocument } from './schema/profile.schema';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    private readonly domainService: DomainService,
    private readonly domainActivityService: DomainActivityService,
  ) {}

  async findAll(): Promise<Profile[]> {
    const all = await this.profileModel.find().exec();
    return all;
  }

  async getInfoByAddress(address: string): Promise<ProfileDataDto> {
    const [profile, holding] = await Promise.all([
      this.domainActivityService.findAProfile(address),
      this.domainService.getDomainHoldingByAddress(address),
    ]);

    return { ...profile.toObject(), holding };
  }
  async getOneByAddress(address: string): Promise<ProfileDocument> {
    const profile = await this.profileModel.findOne({ address }).exec();
    return profile;
  }
  async updateOneByAddress(
    address: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    return await this.profileModel
      .findOneAndUpdate(
        { address },
        { ...updateProfileDto },
        {
          returnDocument: 'after',
          upsert: true,
        },
      )
      .exec();
  }

  async updateAvatarByAddress(
    address: string,
    updateAvatarLinkDto: UpdateAvatarLinkDto,
  ): Promise<Profile> {
    if (
      verifySignature(
        updateAvatarLinkDto.payloadBytes,
        updateAvatarLinkDto.publicKey,
        updateAvatarLinkDto.signature,
      ) === false
    ) {
      throw new HttpException(
        'PROFILE_S:INVALID_SIGNATURE',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.profileModel
      .findOneAndUpdate(
        { address },
        { avatarLink: updateAvatarLinkDto.avatarLink },
        {
          returnDocument: 'after',
          upsert: true,
        },
      )
      .exec();
  }
  async updateBookmarkedNamesByAddress(
    address: string,
    updateBookedmarkedNamesDto: UpdateBookedmarkedNamesDto,
  ): Promise<Profile> {
    return await this.profileModel
      .findOneAndUpdate(
        { address },
        {
          address,
          bookmarkedNames: updateBookedmarkedNamesDto.bookmarkedNames,
        },
        {
          returnDocument: 'after',
          upsert: true,
        },
      )
      .exec();
  }
  async getBookmarkedNamesByAddress(address: string): Promise<string[]> {
    const profile = await this.profileModel.findOne({ address }).exec();
    if (profile) return profile.bookmarkedNames;
    else return [];
  }
}
