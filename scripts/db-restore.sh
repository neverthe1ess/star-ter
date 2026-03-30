#!/bin/bash
# ──────────────────────────────────────────────────────
# RDS 스냅샷 → Docker PostgreSQL 1회성 마이그레이션
#
# 사용법:
#   1. AWS 콘솔에서 RDS 스냅샷 → 임시 인스턴스 복원
#      - 엔진: PostgreSQL 16
#      - 인스턴스: db.t3.micro (최소 비용)
#      - 퍼블릭 액세스: 활성화
#      - 보안 그룹: Lightsail IP에서 5432 허용
#   2. 이 스크립트 실행:
#      ./scripts/db-restore.sh <임시RDS엔드포인트> <RDS비밀번호>
#   3. 완료 후 AWS 콘솔에서 임시 RDS 즉시 삭제
# ──────────────────────────────────────────────────────
set -euo pipefail

RDS_HOST="${1:?사용법: $0 <RDS_HOST> <RDS_PASSWORD>}"
RDS_PASSWORD="${2:?사용법: $0 <RDS_HOST> <RDS_PASSWORD>}"
RDS_USER="postgres"
RDS_DB="dev_board"

DUMP_FILE="/tmp/rds-dump.pgdump"

echo "==> [1/3] RDS에서 pg_dump 중... (${RDS_HOST})"
PGPASSWORD="${RDS_PASSWORD}" pg_dump \
  -h "${RDS_HOST}" \
  -U "${RDS_USER}" \
  -d "${RDS_DB}" \
  -Fc \
  -f "${DUMP_FILE}"

echo "==> [2/3] Docker PostgreSQL에 pg_restore 중..."
docker exec -i postgres pg_restore \
  -U postgres \
  -d dev_board \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  < "${DUMP_FILE}"

echo "==> [3/3] 데이터 확인"
docker exec postgres psql -U postgres -d dev_board \
  -c "SELECT schemaname, COUNT(*) as tables FROM pg_tables WHERE schemaname = 'public' GROUP BY schemaname;"

echo ""
echo "복원 완료! 임시 RDS 인스턴스를 AWS 콘솔에서 삭제하세요."
rm -f "${DUMP_FILE}"
