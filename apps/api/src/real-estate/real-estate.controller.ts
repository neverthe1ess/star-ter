import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RealEstateService } from './real-estate.service';
import { CreateRealEstateDto } from './dto/real-estate-create.dto';
import { GetRealEstateQueryDto } from './dto/real-estate-get.dto';

@Controller('real-estate')
export class RealEstateController {
  constructor(private readonly realEstateService: RealEstateService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Req() req, @Body() createRealEstateDto: CreateRealEstateDto) {
    const userId = req.user.userId;
    return this.realEstateService.create({
      ...createRealEstateDto,
      user_id: userId,
    });
  }

  @Get()
  getRealEstateInfo(@Query() query: GetRealEstateQueryDto) {
    return this.realEstateService.getRealEstateInfo(query);
  }
}
