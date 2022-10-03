import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoClient } from 'mongodb';
import {
  BIG_TOKEN_ADDRESSES,
  BUSD_ADDRESS,
  DEX_LIST,
  getRandRpcElseOne,
  RPC_LIST,
  WBNB_ADDRESS,
} from 'src/helpers/constants';
import { Pair, PairDocument } from './schemas/pair.schema';
import { Document } from 'bson';
import * as ABI_UNISWAP_V2_FACTORY from 'src/helpers/abis/ABI_UNISWAP_V2_FACTORY.json';
import * as ABI_UNISWAP_V2_PAIR from 'src/helpers/abis/ABI_UNISWAP_V2_PAIR.json';
import {
  CreationBlock,
  SwapLogsQuery,
  SwapLogsResult,
} from './interfaces/coinPrice.interface';
import { CoinPrice, CoinPriceDocument } from './schemas/coinPrice.schema';

require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;

@Injectable()
export class PairService {
  constructor(
    @InjectModel(Pair.name) private readonly pairModel: Model<PairDocument>,
    @InjectModel(CoinPrice.name)
    private readonly coinPriceModel: Model<CoinPrice>,
  ) {}
}
