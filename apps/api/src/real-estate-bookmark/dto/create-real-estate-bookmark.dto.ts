import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRealEstateBookmarkDto {
  @IsString()
  @IsNotEmpty()
  realEstateId: string;
}
