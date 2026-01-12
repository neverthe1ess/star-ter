import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOnboardingDto {
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

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  industryCode?: string | null;
}
