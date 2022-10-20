export class BaseProfileDto {
  address: string;
  reversedName: string;
}

export class UpdateProfileDto extends BaseProfileDto {
  signature: string;
}

export class ProfileDataDto extends BaseProfileDto {
  holding: number;
}

export class UpdateBookedmarkedNamesDto {
  bookmarkedNames: string[];
}

export class UpdateAvatarLinkDto {
  payloadBytes: string;
  avatarLink: string;
  signature: string;
  publicKey: string;
}
