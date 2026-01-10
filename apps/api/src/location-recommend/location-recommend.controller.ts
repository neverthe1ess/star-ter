import { Body, Controller, Post } from '@nestjs/common';
import { LocationRecommendService } from './location-recommend.service';
import { RecommendRequestDto } from './dto/recommend-request.dto';
import { RecommendResponseDto } from './dto/recommend-response.dto';

@Controller('location-recommend')
export class LocationRecommendController {
  constructor(
    private readonly locationRecommendService: LocationRecommendService,
  ) {}

  @Post()
  async getRecommendations(
    @Body() dto: RecommendRequestDto,
  ): Promise<RecommendResponseDto> {
    return await this.locationRecommendService.getRecommendations(dto);
  }
}
