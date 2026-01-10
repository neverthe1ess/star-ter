import { IsString, IsNotEmpty } from 'class-validator';

export class RecommendRequestDto {
  @IsString()
  @IsNotEmpty()
  age: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsString()
  @IsNotEmpty()
  operatingTime: string;

  @IsString()
  @IsNotEmpty()
  capital: string;
}
