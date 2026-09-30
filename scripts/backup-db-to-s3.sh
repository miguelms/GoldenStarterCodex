#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# S3 Database Backup Script for PostgreSQL 18
# Dumps DB container, compresses with gzip, and uploads to S3 bucket.
# ==============================================================================

TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
CONTAINER_NAME="${DB_CONTAINER:-starter_db}"
DB_USER="${POSTGRES_USER:-starter_user}"
DB_NAME="${POSTGRES_DB:-starter_prod}"
S3_BUCKET="${S3_BUCKET:-}"
S3_PREFIX="${S3_PREFIX:-backups/database}"
LOCAL_DUMP_DIR="${BACKUP_DIR:-/tmp/backups}"

mkdir -p "$LOCAL_DUMP_DIR"
DUMP_FILE="${LOCAL_DUMP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "==> Creating PostgreSQL 18 backup from container '${CONTAINER_NAME}'..."
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists --no-owner --no-privileges | gzip -c > "$DUMP_FILE"

FILE_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
echo "==> Backup dump created: ${DUMP_FILE} (${FILE_SIZE})"

if [ -n "$S3_BUCKET" ]; then
  echo "==> Uploading dump to s3://${S3_BUCKET}/${S3_PREFIX}/..."
  aws s3 cp "$DUMP_FILE" "s3://${S3_BUCKET}/${S3_PREFIX}/$(basename "$DUMP_FILE")"
  echo "==> Upload completed successfully."
else
  echo "==> S3_BUCKET not specified; backup kept locally at ${DUMP_FILE}."
fi
