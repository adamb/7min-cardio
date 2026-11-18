#!/usr/bin/env bash
# One-shot setup + deploy for 7 Minute Cardio.
# First run: creates the D1 database, writes its id into wrangler.toml, creates tables.
# Every run: deploys to Cloudflare Pages on the production branch (main).
set -euo pipefail
cd "$(dirname "$0")"

if grep -q 'PASTE-DATABASE-ID-HERE' wrangler.toml; then
  echo "==> Creating D1 database 7min-cardio"
  out=$(CI=1 npx wrangler d1 create 7min-cardio </dev/null 2>&1 || true)
  echo "$out"
  id=$(echo "$out" | grep -Eo '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)
  if [ -z "$id" ]; then
    # Database may already exist: look it up
    id=$(CI=1 npx wrangler d1 info 7min-cardio --json </dev/null 2>/dev/null | grep -Eo '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)
  fi
  [ -n "$id" ] || { echo "Could not find the database id. Paste it into wrangler.toml by hand."; exit 1; }
  sed -i.bak "s/PASTE-DATABASE-ID-HERE/$id/" wrangler.toml && rm -f wrangler.toml.bak
  echo "==> database_id = $id"
  echo "==> Creating tables"
  npx wrangler d1 execute 7min-cardio --remote --file schema.sql --yes
fi

echo "==> Deploying"
npx wrangler pages deploy --branch main --commit-dirty=true
