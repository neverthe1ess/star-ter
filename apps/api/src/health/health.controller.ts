import { Controller, Get } from '@nestjs/common';

/* AWS CI/CD 배포 시 상태 확인을 위한 API -> Target Group [/health] 로 설정 */
@Controller('health')
export class HealthController {
  @Get()
  health() {
    return { ok: true };
  }
}
