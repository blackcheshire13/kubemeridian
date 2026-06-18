#!/usr/bin/env bash
# Build and package the unsigned plugin as a zip for in-cluster install.
# Output: starcrown-kubegraf-app.zip (dist/ renamed to the plugin id inside the zip).
set -euo pipefail

cd "$(dirname "$0")/.."

PLUGIN_ID="starcrown-kubegraf-app"
OUT="${PLUGIN_ID}.zip"

npm ci
npm run build

rm -rf "build-pkg" "$OUT"
mkdir -p "build-pkg/${PLUGIN_ID}"
cp -r dist/* "build-pkg/${PLUGIN_ID}/"
( cd build-pkg && zip -qr "../${OUT}" "${PLUGIN_ID}" )
rm -rf build-pkg

echo "Packaged: ${OUT}"
unzip -l "$OUT" | tail -n +2 | head -20
