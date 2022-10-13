import { T_DOMAIN_ACTIVITY_TYPE } from 'src/helpers/interface';

export class BaseDomainActivityDto {
  amount: number;
  from: string; // address
  name: string;
  timestamp: Date;
  to: string; // address
  txHash: string;
  type: T_DOMAIN_ACTIVITY_TYPE;
  uuid: string;
}

export class CreateDomainActivityDto extends BaseDomainActivityDto {
  signature: string;
}
