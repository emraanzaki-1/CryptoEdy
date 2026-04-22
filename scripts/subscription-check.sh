#!/usr/bin/env bash
# Calls the subscription-check cron endpoint.
# Deployed to the server and run daily by systemd.
# Logs are captured by journald (systemctl status cryptoedy-subscription-check).

set -euo pipefail

# Load from environment or fall back to /etc/cryptoedy.env
if [ -f /etc/cryptoedy.env ]; then
  # shellcheck source=/dev/null
  source /etc/cryptoedy.env
fi

: "${APP_URL:?APP_URL is not set}"
: "${CRON_SECRET:?CRON_SECRET is not set}"

ENDPOINT="${APP_URL}/api/cron/subscription-check"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Running subscription check: ${ENDPOINT}"

HTTP_STATUS=$(curl -s -o /tmp/subscription-check-response.json -w "%{http_code}" \
  --max-time 30 \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "${ENDPOINT}")

BODY=$(cat /tmp/subscription-check-response.json)

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] HTTP ${HTTP_STATUS} — ${BODY}"

if [ "${HTTP_STATUS}" != "200" ]; then
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] ERROR: endpoint returned ${HTTP_STATUS}" >&2
  exit 1
fi
