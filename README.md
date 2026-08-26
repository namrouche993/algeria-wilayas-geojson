# algeria-wilayas-geojson

GeoJSON boundaries for Algeria's wilayas (administrative divisions), packaged
in three variants so you can pick the layout that matches your data:

| Version | Wilayas | File | Status | License |
|---|---|---|---|---|
| v48 | 48 (pre-2019 layout) | [`v48/all-wilayas.geojson`](v48/all-wilayas.geojson) | available (derived, see [`v48/README.md`](v48/README.md)) | ODbL-1.0 (OSM-derived) |
| v58 | 58 (post-2019 layout) | [`v58/algeria-cities.geojson`](v58/algeria-cities.geojson) | available | MIT |
| v69 | 69 (2025/2026 reform layout) | [`v69/wilaya-boundaries.geojson`](v69/wilaya-boundaries.geojson) | available | ODbL-1.0 (OSM-derived) |

Full source/license table: see [`ATTRIBUTION.md`](ATTRIBUTION.md). Machine-readable
manifest (used by the scripts and CI): [`versions.json`](versions.json).

**License notice:** these are not one uniform license. `v58` and the optional
`v69` SVG are MIT. `v69` and `v48`'s boundary GeoJSON are derived from
OpenStreetMap under **ODbL-1.0**, which requires attribution and
share-alike on redistributed derivative databases — read
[ATTRIBUTION.md](ATTRIBUTION.md#odbl-obligations-v69-and-v48) before
shipping either in a product. `v48` is not a straight copy of an upstream
file — no repo ships the pre-2019 boundaries directly, so it's
reconstructed from a 58-wilaya source; see
[`v48/README.md`](v48/README.md) for the full methodology.

## Usage

### curl

```bash
curl -L -o wilaya-boundaries.geojson \
  https://raw.githubusercontent.com/namrouche993/algeria-wilayas-geojson/main/v69/wilaya-boundaries.geojson
```

### Node.js (fetch)

```js
const res = await fetch(
  "https://raw.githubusercontent.com/namrouche993/algeria-wilayas-geojson/main/v58/algeria-cities.geojson"
);
const fc = await res.json();
console.log(fc.features.length); // 58
```

### As a GitHub dependency

```bash
npm install github:namrouche993/algeria-wilayas-geojson
```

```js
const fs = require("fs");
const fc = JSON.parse(
  fs.readFileSync(
    require.resolve("algeria-wilayas-geojson/v69/wilaya-boundaries.geojson")
  )
);
```

### Front-end (bundler or static import)

```js
import wilayas from "algeria-wilayas-geojson/v58/algeria-cities.geojson";
map.addSource("wilayas", { type: "geojson", data: wilayas });
```

### Switching versions

Point at a different folder — `v48`, `v58`, or `v69` — nothing else in your
code needs to change, since every file is a standard GeoJSON
`FeatureCollection`. Just make sure the feature count you expect (48 / 58 /
69) matches what's actually available (see the status table above; `v48`
isn't available yet).

## Scripts

- `node scripts/count-features.js` — validates every version listed in
  `versions.json` against its expected feature count. Run standalone against
  one file: `node scripts/count-features.js v58/algeria-cities.geojson 58`.
- `bash scripts/update-from-upstream.sh [v58|v69|all]` — re-downloads the
  tracked v58/v69 files from their upstream sources and re-validates them.
- `node scripts/build-v48.js` — regenerates `v48/all-wilayas.geojson` from
  its upstream 58-wilaya source (requires `npm install` first, since it
  needs `@turf/turf` for the geometry union — see
  [`v48/README.md`](v48/README.md) for why v48 is derived rather than copied).

```bash
npm test     # same as: node scripts/count-features.js
npm run update
```

## CI

`.github/workflows/validate.yml` runs on every push/PR: validates feature
counts against `versions.json`, checks `ATTRIBUTION.md` and upstream
`LICENSE` files are present, and checks every tracked `.geojson` file parses
as valid JSON.

## Contributing / updating data

See [`scripts/update-from-upstream.sh`](scripts/update-from-upstream.sh) to
refresh a version from its source, and [`v48/README.md`](v48/README.md) if
you want to help unblock the 48-wilaya variant.
