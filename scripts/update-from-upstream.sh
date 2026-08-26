#!/usr/bin/env bash
# Re-download the tracked GeoJSON/license files from their upstream sources.
# Usage: scripts/update-from-upstream.sh [v58|v69]   (default: all available versions)
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
target="${1:-all}"

fetch() {
  local url="$1" out="$2"
  echo "Fetching $url -> $out"
  curl -sL --fail --max-time 60 -o "$out" "$url"
}

update_v58() {
  fetch "https://raw.githubusercontent.com/samdace/Algeria-Cities-GeoJson/main/algeria-cities.json" \
    "$repo_root/v58/algeria-cities.geojson"
  fetch "https://raw.githubusercontent.com/samdace/Algeria-Cities-GeoJson/main/LICENSE" \
    "$repo_root/v58/LICENSE"
}

update_v69() {
  fetch "https://raw.githubusercontent.com/yasserstudio/geoalgeria/main/packages/dataset/data/geojson/wilaya-boundaries.geojson" \
    "$repo_root/v69/wilaya-boundaries.geojson"
  fetch "https://raw.githubusercontent.com/chemsallioua/Algeria69WilayaMap/main/map-algeria-69-wilayas.svg" \
    "$repo_root/v69/map-algeria-69-wilayas.svg"
  fetch "https://raw.githubusercontent.com/chemsallioua/Algeria69WilayaMap/main/LICENSE" \
    "$repo_root/v69/LICENSE-svg"
}

case "$target" in
  v58) update_v58 ;;
  v69) update_v69 ;;
  v48)
    echo "v48 is derived, not downloaded directly — run: node scripts/build-v48.js (see v48/README.md)." >&2
    exit 1
    ;;
  all) update_v58; update_v69 ;;
  *)
    echo "Unknown target: $target (expected v58, v69, or all; for v48 run node scripts/build-v48.js)" >&2
    exit 1
    ;;
esac

echo
echo "Validating feature counts..."
node "$repo_root/scripts/count-features.js"

echo
echo "Done. Review the diff, then commit:"
echo "  git add v58 v69"
echo "  git commit -m \"chore: refresh upstream data\""
