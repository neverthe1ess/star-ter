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
import { Request } from 'express';
import { RealEstateService } from './real_estate.service';
import { CreateRealEstateDto } from './dto/real-estate-create.dto';
import { GetRealEstateQueryDto } from './dto/real-estate-get.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Type } from 'class-transformer'; { AuthenticatedUser } from 'src/auth/types/authenticatedUser';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthenticatedUser } from 'src/auth/types/authenticatedUser';

@Controller('real-estate')
export class RealEstateController {
  constructor(private readonly realEstateService: RealEstateService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @User() user: AuthenticatedUser,
    @Body() createRealEstateDto: CreateRealEstateDto,
  ) {
    return this.realEstateService.create({
      ...createRealEstateDto,
      user_id: user.id,
    });
  }

  @Get()
  getRealEstateInfo(@Query() query: GetRealEstateQueryDto) {
    console.log(
      '[RealEstateController] 🔍 요청 수신:',
      JSON.stringify(query, null, 2),
    );
    return this.realEstateService.getRealEstateInfo(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyRealEstate(@User() user: AuthenticatedUser) {
    return this.realEstateService.getRealEstateByUser(user.id);
  }
}
