import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetRealEstateQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minx?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  miny?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxx?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxy?: number;
}
