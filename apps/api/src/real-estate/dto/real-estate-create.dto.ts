import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class CreateRealEstateDto {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  roadaddress?: string;

  @IsNumber()
  centerlatitude: number;

  @IsNumber()
  centerlongitude: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  deposit?: number;

  @IsOptional()
  @IsNumber()
  monthlyrent?: number;

  @IsOptional()
  @IsNumber()
  maintenancefee?: number;

  @IsOptional()
  @IsNumber()
  premium?: number;

  @IsOptional()
  @IsNumber()
  areaprice?: number;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsInt()
  floor?: number;

  @IsOptional()
  @IsInt()
  groundfloor?: number;

  @IsOptional()
  @IsString()
  businesslargecodename?: string;

  @IsOptional()
  @IsString()
  businessmiddlecodename?: string;

  @IsOptional()
  @IsString()
  nearsubwaystation?: string;

  @IsOptional()
  @IsBoolean()
  ismoveindate?: boolean;

  @IsOptional()
  @IsString()
  moveindate?: string;

  @IsOptional()
  @IsString()
  previewphotourl?: string;
}
