#!/usr/bin/env bash
# Build and package the plugin as a catalog-ready zip.
# Output: <plugin-id>-<version>.zip (dist/ renamed to the plugin id inside the zip),
# following the Grafana catalog naming convention {plugin-id}-{version}.zip.
set -euo pipefail

cd "$(dirname "$0")/.."

PLUGIN_ID="devopstech-kubemeridian-app"
VERSION="$(node -p "require('./package.json').version")"
BASE="${PLUGIN_ID}-${VERSION}"
OUT="${BASE}.zip"

npm ci
npm run build

rm -rf "build-pkg" "$OUT"
mkdir -p "build-pkg/${PLUGIN_ID}"
cp -r dist/* "build-pkg/${PLUGIN_ID}/"
# zip(1) is not always present; use Python's zipfile for portability.
python3 -c "import shutil; shutil.make_archive('${BASE}', 'zip', 'build-pkg', '${PLUGIN_ID}')"
rm -rf build-pkg

echo "Packaged: ${OUT}"
echo "SHA1: $(sha1sum "${OUT}" | cut -d' ' -f1)"
python3 -c "import zipfile; [print(n) for n in zipfile.ZipFile('${OUT}').namelist()[:20]]"
