#!/bin/bash

# Set your Supabase project ref and access token
PROJECT_ID="smwtliaoqgscyeppidvz"
ACCESS_TOKEN="sbp_bba4a37fe585bd32d2debede23a7aaf9864e3bc8"

# Register CRON job
curl -X POST \
  https://api.supabase.com/v1/projects/$PROJECT_ID/cron/jobs \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "weekly-export-contact-logs",
    "schedule": "0 8 * * 1",
    "command": "/functions/v1/export-contact-logs",
    "run_on": "supabase"
  }'

echo "✅ CRON job registration attempted. Check Supabase Dashboard > Edge Functions > CRON."
