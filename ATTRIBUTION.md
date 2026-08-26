# Attribution

This repository redistributes geographic data produced by third parties. Each
file kept its upstream license; nothing here re-licenses ODbL data as MIT or
vice versa.

| File | Upstream source | Raw URL | License | Author / contact |
|---|---|---|---|---|
| `v58/algeria-cities.geojson` | [samdace/Algeria-Cities-GeoJson](https://github.com/samdace/Algeria-Cities-GeoJson) | https://raw.githubusercontent.com/samdace/Algeria-Cities-GeoJson/main/algeria-cities.json | MIT (see [`v58/LICENSE`](v58/LICENSE)) | [@samdace](https://github.com/samdace) |
| `v69/wilaya-boundaries.geojson` | [yasserstudio/geoalgeria](https://github.com/yasserstudio/geoalgeria) (`packages/dataset/data/geojson/wilaya-boundaries.geojson`) | https://raw.githubusercontent.com/yasserstudio/geoalgeria/main/packages/dataset/data/geojson/wilaya-boundaries.geojson | **ODbL-1.0** — the geoalgeria package itself is MIT-licensed, but its own [`dataset-metadata.json`](https://raw.githubusercontent.com/yasserstudio/geoalgeria/main/packages/dataset/dataset-metadata.json) explicitly flags this specific file as *"ODbL — OpenStreetMap"* because the boundary geometry is derived from OSM. That upstream label governs, not the repo's blanket MIT license. See [ODbL obligations](#odbl-obligations-v69-v48-and-derived-from-v69) below. | [Yasser's Studio](https://yasser.studio) ([@yasserstudio](https://github.com/yasserstudio)) |
| `v69/map-algeria-69-wilayas.svg` (optional vector map) | [chemsallioua/Algeria69WilayaMap](https://github.com/chemsallioua/Algeria69WilayaMap) | https://raw.githubusercontent.com/chemsallioua/Algeria69WilayaMap/main/map-algeria-69-wilayas.svg | MIT (see [`v69/LICENSE-svg`](v69/LICENSE-svg)) | [@chemsallioua](https://github.com/chemsallioua) |
| `v48/all-wilayas.geojson` | [ZSmain/algeria-provinces-geojson](https://github.com/ZSmain/algeria-provinces-geojson) (`data/*.geojson`, 58 files) | https://raw.githubusercontent.com/ZSmain/algeria-provinces-geojson/main/data/ | **ODbL-1.0** — no `LICENSE` file in the ZSmain repo, but every feature carries an `osm_id`, `admin_level: 4`, `boundary: administrative` and `wikipedia` tag: this is OpenStreetMap-derived data, so ODbL applies regardless of whether the redistributing repo declared it. **Derived file**, not a straight copy: the pre-2019 48-wilaya boundaries are reconstructed by unioning each post-2019 wilaya (codes 49-58) back into its pre-2019 parent. Full methodology, parent/child mapping, and regeneration script: [`v48/README.md`](v48/README.md), [`scripts/build-v48.js`](scripts/build-v48.js). | [@ZSmain](https://github.com/ZSmain); underlying geometry © OpenStreetMap contributors |
| `wilaya-hierarchy.json` (repo root) | [yasserstudio/geoalgeria](https://github.com/yasserstudio/geoalgeria) (`packages/dataset/data/wilayas.json`) | https://raw.githubusercontent.com/yasserstudio/geoalgeria/main/packages/dataset/data/wilayas.json | MIT — this file is administrative metadata (names, codes, `mother_wilaya_code`, creation year/law), not OSM-derived geometry, and isn't flagged ODbL in geoalgeria's own `dataset-metadata.json` (only the boundary GeoJSON is). Sourced by geoalgeria from the Journaux Officiels of Law 19-12 (2019) and Law 26-06 (2026), plus ONS. | [Yasser's Studio](https://yasser.studio) |
| `derived-from-v69/v48.geojson`, `derived-from-v69/v58.geojson` (experimental, see [`derived-from-v69/README.md`](derived-from-v69/README.md)) | Derived in this repo from `v69/wilaya-boundaries.geojson` + `wilaya-hierarchy.json` | n/a (generated, see [`scripts/derive-versions.js`](scripts/derive-versions.js)) | ODbL-1.0 (geometry is v69's, which is OSM-derived) | — |

## ODbL obligations (v69, v48, and derived-from-v69)

`v69/wilaya-boundaries.geojson`, `v48/all-wilayas.geojson`, and
`derived-from-v69/*.geojson` all contain data derived from
[OpenStreetMap](https://www.openstreetmap.org/copyright), distributed under
the **Open Database License (ODbL) v1.0**. If you use, modify, or
redistribute any of these files (directly or as part of a produced work),
you must:

1. **Attribute** OpenStreetMap and its contributors, e.g.: *"Contains
   information from OpenStreetMap, licensed under ODbL"* with a link to
   https://opendatacommons.org/licenses/odbl/1-0/.
2. **Share-alike**: if you publish a *derivative database* (not just a
   produced work/image), it must also be offered under ODbL.
3. Keep this notice next to the file, or reference this ATTRIBUTION.md.

Full license text: https://opendatacommons.org/licenses/odbl/1-0/

## Summary by license

- **MIT**: `v58/algeria-cities.geojson`, `v69/map-algeria-69-wilayas.svg` — MIT notice preserved in the same folder. `wilaya-hierarchy.json` is also MIT-sourced (built from geoalgeria's administrative metadata, trimmed to the fields needed here) — attribution is in the table above rather than a copied `LICENSE` file, since it's a derived/trimmed file rather than a straight copy.
- **ODbL-1.0**: `v69/wilaya-boundaries.geojson`, `v48/all-wilayas.geojson`, `derived-from-v69/*.geojson` — attribution + share-alike required, see above.
