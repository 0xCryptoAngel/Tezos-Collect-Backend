import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PresaleInfo, PresaleInfoDocument } from './schema/presaleInfo.schema';

@Injectable()
export class PresaleInfoService {
  constructor(
    @InjectModel(PresaleInfo.name)
    private readonly model: Model<PresaleInfoDocument>,
  ) {}

  async findAll(): Promise<PresaleInfo[]> {
    return await this.model.find().exec();
  }

  async findOne(address: string): Promise<PresaleInfo> {
    return await this.model.findOne({
      address: { $regex: `${address}`, $options: 'i' },
    });
  }
  async presalesByOwner(
    chainId: number,
    owner: string,
  ): Promise<PresaleInfo[]> {
    return await this.model.find({ chainId, owner }).exec();
  }
  async likeToggle(address: string, wallet: string): Promise<PresaleInfo> {
    const presale = await this.model.findOne({
      address: { $regex: `${address}`, $options: 'i' },
    });
    if (!presale) {
      return await new this.model({
        address,
        createdAt: new Date(),
        likes: [wallet],
      }).save();
    }
    const indexOfWallet: number = presale.likes.indexOf(wallet);
    if (indexOfWallet >= 0) presale.likes.splice(indexOfWallet, 1);
    else presale.likes.push(wallet);
    await presale.save();
    return presale;
  }

  async delete(address: string): Promise<PresaleInfo> {
    return await this.model
      .findOneAndDelete({ address: { $regex: `${address}`, $options: 'i' } })
      .exec();
  }

  async upcomingPresales(): Promise<PresaleInfo[]> {
    console.log(new Date().getTime() / 1000);
    return await this.model
      .find({ presaleStartTime: { $gt: new Date().getTime() / 1000 } })
      .exec();
  }
}
