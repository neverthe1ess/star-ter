# AWS Lightsail 배포 환경 구축 플랜

## Context

기존 AWS ECS + RDS 배포 환경이 전부 종료됨. **AWS Lightsail $10/월 단일 인스턴스**에 Docker Compose로 전체 스택을 재구축. RDS 스냅샷에서 DB 데이터를 복원해야 함. Valkey(캐시)는 초기에는 제외하고 나중에 추가.

## 아키텍처

```
Lightsail Instance (2GB RAM, 1 vCPU, Seoul ap-northeast-2)
├── Caddy (:80/:443) — 리버스 프록시 + 자동 HTTPS
│   └── star-ter.shop → web:3000 (Next.js가 /api/* 를 api:4000으로 프록시)
├── Next.js Web (:3000) — standalone 모드
├── NestJS API (:4000)
└── PostgreSQL 16 + pgvector + PostGIS + pg_trgm (:5432)
    └── pgdata volume (영구 저장)
```

> **라우팅:** Caddy → Next.js(web:3000)로 모든 트래픽 전달. `/api/*` 요청은 `next.config.ts`의 rewrite가 `http://api:4000`으로 프록시 (기존 로직 그대로 활용).

---

## 생성할 파일

### 1. `docker/docker-compose.prod.yml`

프로덕션 Compose 파일 (caddy, web, api, postgres 4개 서비스)

- web: 기존 `apps/web/Dockerfile` 빌드, `NEXT_PUBLIC_API_BASE_URL=http://api:4000` 런타임 환경변수
- api: 기존 `apps/api/Dockerfile` 빌드, `.env.production`에서 환경변수 로드
- postgres: 커스텀 Dockerfile (pgvector + PostGIS), healthcheck, pgdata 볼륨
- caddy: `caddy:2-alpine`, 80/443 포트, Caddyfile 마운트

### 2. `docker/Caddyfile`

```
star-ter.shop {
    reverse_proxy web:3000
}
```

Caddy가 Let's Encrypt 인증서를 자동 발급/갱신.

### 3. `docker/postgres/Dockerfile`

`pgvector/pgvector:0.8.0-pg16` 기반으로 PostGIS 설치. 프로젝트에서 `geometry` 타입과 `st_setsrid`, `st_makepoint` 함수를 사용하므로 PostGIS 필수.

- 관련 파일: `apps/api/prisma/models/polygon.prisma`, `building.prisma`, `real_estate_info.prisma`, `grid_cell.prisma`

### 4. `docker/postgres/init-extensions.sql`

첫 부팅 시 `vector`, `postgis`, `pg_trgm` 확장 활성화 스크립트.

### 5. `docker/.env.production.example`

프로덕션 환경변수 템플릿 (14개 API 시크릿 + DB 설정 + 웹 빌드 arg).

### 6. `.github/workflows/deploy-lightsail.yml`

SSH 기반 배포 워크플로우:

- `appleboy/ssh-action`으로 Lightsail에 SSH 접속
- `git pull` → `docker compose build --parallel` → `docker compose up -d`
- 배포 전 DB 백업, 배포 후 헬스체크
- 기존 `deploy-ecs.yml`은 비활성화 (rename 또는 삭제)

### 7. `scripts/db-restore.sh`

RDS 스냅샷 → Docker PostgreSQL 1회성 마이그레이션 스크립트:

1. 임시 RDS 인스턴스 복원 (db.t3.micro, ~$0.02/hr)
2. `pg_dump` 로 데이터 추출
3. Docker PostgreSQL에 `pg_restore`
4. 임시 RDS 삭제

### 8. `scripts/db-backup.sh`

일일 자동 백업 스크립트 (cron 3AM KST). 7일 로컬 보관.

---

## 수정할 파일

| 파일                               | 변경 내용                                                    |
| ---------------------------------- | ------------------------------------------------------------ |
| `.github/workflows/deploy-ecs.yml` | 비활성화 (파일명 변경 → `deploy-ecs.yml.disabled` 또는 삭제) |

**변경 불필요:** `apps/web/Dockerfile`, `apps/api/Dockerfile`, `docker/docker.compose.yml` (로컬 개발용 유지)

---

## Lightsail 서버 수동 셋업 (1회)

1. **인스턴스 생성:** Ubuntu 22.04, $10/월 플랜 (2GB RAM), ap-northeast-2
2. **고정 IP 할당** + DNS A 레코드 설정 (`star-ter.shop` → 고정 IP)
3. **방화벽:** TCP 22, 80, 443 오픈
4. **Docker 설치:** `curl -fsSL https://get.docker.com | sh`
5. **Swap 설정 (필수):** 2GB swap 추가 — 빌드 시 메모리 부족 방지
   ```bash
   sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
   sudo mkswap /swapfile && sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```
6. **레포 클론** + `.env.production` 작성
7. **DB 마이그레이션:** `scripts/db-restore.sh` 실행
8. **첫 배포:** `docker compose -f docker-compose.prod.yml up -d --build`

---

## DB 마이그레이션 절차 (RDS 스냅샷 → Docker PostgreSQL)

```
RDS 스냅샷 → 임시 RDS (db.t3.micro) → pg_dump → Lightsail 전송 → pg_restore → 임시 RDS 삭제
```

1. AWS 콘솔에서 RDS 스냅샷 → 임시 인스턴스 복원 (퍼블릭 액세스 활성화)
2. Lightsail에서 `pg_dump -h <임시RDS> -U postgres -d dev_board -F c -f dump.pgdump`
3. Docker postgres 컨테이너에 `pg_restore` (확장은 `init-extensions.sql`로 이미 설치됨)
4. 데이터 확인 후 임시 RDS 즉시 삭제 (비용: ~$0.05 이하)

---

## 주의사항

1. **메모리:** 2GB RAM + 2GB Swap으로 운영. 빌드 시 일시적 부하 발생 가능
2. **NEXT_PUBLIC_API_BASE_URL:** 빌드 arg로는 `https://star-ter.shop` (클라이언트용), 런타임 env로는 `http://api:4000` (서버 rewrite용)
3. **DNS 먼저:** Caddy 첫 부팅 전에 DNS A 레코드가 전파 완료되어야 Let's Encrypt 인증서 발급 성공
4. **`docker compose down -v` 금지:** `-v` 플래그는 pgdata 볼륨 삭제 → 데이터 소실
5. **PostGIS 필수:** 기존 DB가 `geometry` 타입, `st_setsrid`, `st_makepoint` 사용 중

## GitHub Secrets 변경

| 기존 (삭제)                                   | 신규 (추가)                           |
| --------------------------------------------- | ------------------------------------- |
| AWS_ACCOUNT_ID, AWS_ROLE_ARN 등 ECS 관련 전체 | `LIGHTSAIL_HOST` (고정 IP)            |
| ECR_WEB_REPO, ECR_API_REPO                    | `LIGHTSAIL_USER` (`ubuntu`)           |
| ECS_CLUSTER, ECS_WEB_SERVICE 등               | `LIGHTSAIL_SSH_KEY` (SSH 프라이빗 키) |

나머지 시크릿(API 키, OAuth 등)은 Lightsail 서버의 `.env.production` 파일에서 관리.

---

## 검증 방법

1. `curl -I https://star-ter.shop` — 프론트엔드 200 응답 + HTTPS 확인
2. `curl https://star-ter.shop/api/health` — API 헬스체크 (엔드포인트 존재 시)
3. 브라우저에서 지도 로딩, AI 채팅, 상권 검색 기능 테스트
4. `docker exec postgres psql -U postgres -d dev_board -c "SELECT count(*) FROM dim_area;"` — DB 데이터 확인
5. GitHub에 테스트 커밋 push → Actions 워크플로우 자동 배포 확인
