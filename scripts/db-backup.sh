#!/bin/bash
# ──────────────────────────────────────────────────────
# Docker PostgreSQL 일일 백업 스크립트
#
# cron 등록 (KST 매일 03:00):
#   0 18 * * * /home/ubuntu/star-ter/scripts/db-backup.sh
#   (UTC 18:00 = KST 03:00)
# ──────────────────────────────────────────────────────
set -euo pipefail

BACKUP_DIR="/home/ubuntu/backups"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/dev_board_${TIMESTAMP}.pgdump"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] 백업 시작..."
docker exec postgres pg_dump \
  -U postgres \
  -d dev_board \
  -Fc \
  -f /tmp/backup.pgdump

docker cp postgres:/tmp/backup.pgdump "${BACKUP_FILE}"
docker exec postgres rm /tmp/backup.pgdump

echo "[$(date)] 백업 완료: ${BACKUP_FILE}"

# 7일 이상 된 백업 삭제
find "${BACKUP_DIR}" -name "*.pgdump" -mtime +${RETENTION_DAYS} -delete
echo "[$(date)] ${RETENTION_DAYS}일 이상 된 백업 정리 완료"
