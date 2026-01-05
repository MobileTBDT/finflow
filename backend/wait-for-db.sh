#!/bin/sh
set -e

: "${DB_HOST:=db}"
: "${DB_PORT:=3306}"

echo "Waiting for database at ${DB_HOST}:${DB_PORT} ..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  echo "$(date) - waiting for db..."
  sleep 1
done

echo "Database is up - starting application"

# If a command is provided, exec it; otherwise just exit.
if [ "$#" -gt 0 ]; then
  exec "$@"
fi

exit 0