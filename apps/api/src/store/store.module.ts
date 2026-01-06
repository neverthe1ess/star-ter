import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { MarketModule } from '../market/market.module';

/**
 * StoreModule
 *
 * 💡 NestJS 의존성 주입 개념:
 *
 * StoreService가 MarketRepository를 사용하려면:
 * 1. MarketModule이 MarketRepository를 exports에 포함해야 함
 * 2. StoreModule이 MarketModule을 imports에 포함해야 함
 *
 * 이렇게 하면 NestJS가 자동으로 MarketRepository를
 * StoreService의 생성자에 주입해줌
 */
@Module({
  imports: [MarketModule], // MarketRepository를 사용하기 위해 MarketModule import
  providers: [StoreService],
  controllers: [StoreController],
})
export class StoreModule {}
