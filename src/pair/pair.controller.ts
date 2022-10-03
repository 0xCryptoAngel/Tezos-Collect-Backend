import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  SwapLogsQuery,
  SwapLogsResult,
} from './interfaces/coinPrice.interface';
import { PairService } from './pair.service';
import { Pair } from './schemas/pair.schema';

@Controller('pairs')
export class PairController {
  constructor(private readonly service: PairService) {}

  @Get()
  async index(): Promise<Pair[]> {
    //top 1000
    return [];
  }
}
