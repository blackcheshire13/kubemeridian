#!/usr/bin/env bash
# Deploy the design-partner form worker. Needs:
#   PILOT_TO              the verified Email Routing destination that receives applications
#   CLOUDFLARE_API_TOKEN  with Workers Scripts and Workers Routes edit on devopstech.net
#   CLOUDFLARE_ACCOUNT_ID
set -euo pipefail
cd "$(dirname "$0")"
: "${PILOT_TO:?set PILOT_TO to the verified destination address}"
sed "s/__PILOT_TO__/${PILOT_TO}/g" wrangler.toml.template > wrangler.toml
trap 'rm -f wrangler.toml' EXIT
npx -y wrangler@4 deploy "$@"
