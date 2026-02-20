#!/bin/sh
set -e
DB_HOST="${DATABASE_HOST:-127.0.0.1}"
DB_PORT="${DATABASE_PORT:-5432}"
echo "Waiting for Postgres at $DB_HOST:$DB_PORT..."
until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  sleep 1
done
echo "Postgres is up"
exec uvicorn main:app --host 0.0.0.0 --port 8000
