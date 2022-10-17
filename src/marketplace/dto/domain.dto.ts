import {
  I_DOMAIN_SEARCH_VALUE,
  TYPE_MARKET_ADVANCED_FILTER_VALUE,
  TYPE_MARKET_SORT_VALUE,
} from 'src/helpers/interface';

export class BaseDomainDto {
  name: string;
  owner: string;
  tags: string[];
  // registeredAt: Date;
  expiresAt: Date;
  saleStartedAt: Date;
  saleEndsAt: Date;
  lastSoldAt?: Date;
  lastSoldAmount?: number;
  topOffer?: number;
  topOfferer?: string;
  auctionStartedAt: Date;
  auctionEndsAt: Date;
  topBid: number;
  topBidder: string;
  tokenId: number;
  collectionId: string;
  includingOperator: boolean;
  isPalindromes?: boolean;
}

export class UpdateDomainDto extends BaseDomainDto {
  signature: string;
}

export class QueryDomainDto {
  searchOptions: I_DOMAIN_SEARCH_VALUE;
  advancedFilterValues: TYPE_MARKET_ADVANCED_FILTER_VALUE[];
  sortOption: TYPE_MARKET_SORT_VALUE;
}
