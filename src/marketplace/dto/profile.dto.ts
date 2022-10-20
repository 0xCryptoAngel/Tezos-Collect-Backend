export class BaseProfileDto {
  address: string;
  avatarLink: string;
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
