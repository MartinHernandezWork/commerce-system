#!/bin/sh
set -e

echo "Waiting for database migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec "$@"
