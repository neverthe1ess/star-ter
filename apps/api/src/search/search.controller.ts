import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('area')
  async getAreaByMessage(@Query('message') message: string) {
    return this.searchService.getAreaByMessage(message);
  }
}
