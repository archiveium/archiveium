#!/usr/bin/env bash

set -e

# run database migrations
npm run migrate:database
# seed database
npm run seed:database

echo "All set running application!"

exec "$@"