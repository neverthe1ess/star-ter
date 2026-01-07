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

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('real-estate')
export class RealEstateController {
  constructor(private readonly realEstateService: RealEstateService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createRealEstateDto: CreateRealEstateDto,
  ) {
    const userId = req.user.userId;
    return this.realEstateService.create({
      ...createRealEstateDto,
      user_id: userId,
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

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  getMyRealEstate(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.realEstateService.getRealEstateByUser(userId);
  }
}
