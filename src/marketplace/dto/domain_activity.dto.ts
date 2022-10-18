import {
  I_DOMAIN_ACTIVITY_SEARCH_OPTION,
  TYPE_ACTIVITY_SORT_VALUE,
  T_DOMAIN_ACTIVITY_TYPE,
} from 'src/helpers/interface';

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

export class QueryDomainActivityDto {
  searchOptions: I_DOMAIN_ACTIVITY_SEARCH_OPTION;
  sortOption: TYPE_ACTIVITY_SORT_VALUE;
}
