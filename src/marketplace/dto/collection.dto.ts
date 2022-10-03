export class BaseCollectionDto {
  slug: string;
  discordLink: string;
  numberOfItems: number;
  numberOfOwners: number;
  totalVolume: number;
  topSale: number;
  floorPrice: number;
  volumeDay: number;
}

export class UpdateCollectionDto extends BaseCollectionDto {
  signature: string;
}
