import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateRealEstateDto {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsString()
  address_name: string;

  @IsString()
  address_road_name: string;

  @IsNumber()
  address_x: number;

  @IsNumber()
  address_y: number;

  @IsOptional()
  @IsNumber()
  deposit?: number;

  @IsOptional()
  @IsNumber()
  monthly_rent?: number;

  @IsOptional()
  @IsNumber()
  maintenance_fee?: number;

  @IsOptional()
  @IsNumber()
  premium?: number;

  @IsOptional()
  @IsNumber()
  price_per_pyeong?: number;

  @IsOptional()
  @IsNumber()
  area?: number;

  @IsOptional()
  @IsString()
  floor_info?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;
}
