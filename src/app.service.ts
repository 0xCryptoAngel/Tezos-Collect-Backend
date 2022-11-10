import { Injectable } from '@nestjs/common';
@Injectable()
export class AppService {
  getHello(): string {
    return `Hello World! - Tezos Collect Backend ${process.env.NODE_ENV}`;
  }
}
