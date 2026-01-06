import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';

import { MarketRepository } from './market.repository';

@Module({
  controllers: [MarketController],
  providers: [MarketService, MarketRepository],
  // MarketRepository도 export해야 다른 모듈에서 사용 가능
  exports: [MarketService, MarketRepository],
})
export class MarketModule {}
