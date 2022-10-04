export class BaseDomainDto {
  name: string;
  owner: string;
  tags: string[];
  registeredAt: Date;
  expiresAt: Date;
  saleStartedAt: Date;
  saleEndsAt: Date;
  topOffer: number;
  topOfferer: string;
  auctionStartedAt: Date;
  auctionEndsAt: Date;
  topBid: number;
  topBidder: string;
  tokenId: number;
  collectionId: string;
}

export class UpdateDomainDto extends BaseDomainDto {
  signature: string;
}
