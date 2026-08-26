# Attribution

This repository redistributes geographic data produced by third parties. Each
file kept its upstream license; nothing here re-licenses ODbL data as MIT or
vice versa.

| File | Upstream source | Raw URL | License | Author / contact |
|---|---|---|---|---|
| `v58/algeria-cities.geojson` | [samdace/Algeria-Cities-GeoJson](https://github.com/samdace/Algeria-Cities-GeoJson) | https://raw.githubusercontent.com/samdace/Algeria-Cities-GeoJson/main/algeria-cities.json | MIT (see [`v58/LICENSE`](v58/LICENSE)) | [@samdace](https://github.com/samdace) |
| `v69/wilaya-boundaries.geojson` | [yasserstudio/geoalgeria](https://github.com/yasserstudio/geoalgeria) (`packages/dataset/data/geojson/wilaya-boundaries.geojson`) | https://raw.githubusercontent.com/yasserstudio/geoalgeria/main/packages/dataset/data/geojson/wilaya-boundaries.geojson | **ODbL-1.0** — the geoalgeria package itself is MIT-licensed, but its own [`dataset-metadata.json`](https://raw.githubusercontent.com/yasserstudio/geoalgeria/main/packages/dataset/dataset-metadata.json) explicitly flags this specific file as *"ODbL — OpenStreetMap"* because the boundary geometry is derived from OSM. That upstream label governs, not the repo's blanket MIT license. See [ODbL obligations](#odbl-obligations-v69) below. | [Yasser's Studio](https://yasser.studio) ([@yasserstudio](https://github.com/yasserstudio)) |
| `v69/map-algeria-69-wilayas.svg` (optional vector map) | [chemsallioua/Algeria69WilayaMap](https://github.com/chemsallioua/Algeria69WilayaMap) | https://raw.githubusercontent.com/chemsallioua/Algeria69WilayaMap/main/map-algeria-69-wilayas.svg | MIT (see [`v69/LICENSE-svg`](v69/LICENSE-svg)) | [@chemsallioua](https://github.com/chemsallioua) |
| `v48/*` | [fr33dz/Algeria-geojson](https://github.com/fr33dz/Algeria-geojson) | n/a — **not shipped yet, see [`v48/README.md`](v48/README.md)** | License: upstream not declared — check before use (`license: null` on the GitHub repo). Even once a valid 48-wilaya source is found, treat it as "upstream license unknown" unless the author states otherwise. | [@fr33dz](https://github.com/fr33dz) |

## ODbL obligations (v69)

`v69/wilaya-boundaries.geojson` contains data derived from
[OpenStreetMap](https://www.openstreetmap.org/copyright), distributed under
the **Open Database License (ODbL) v1.0**. If you use, modify, or
redistribute this file (directly or as part of a produced work), you must:

1. **Attribute** OpenStreetMap and its contributors, e.g.: *"Contains
   information from OpenStreetMap, licensed under ODbL"* with a link to
   https://opendatacommons.org/licenses/odbl/1-0/.
2. **Share-alike**: if you publish a *derivative database* (not just a
   produced work/image), it must also be offered under ODbL.
3. Keep this notice next to the file, or reference this ATTRIBUTION.md.

Full license text: https://opendatacommons.org/licenses/odbl/1-0/

## Files with no declared upstream license

Anything sourced from a repository with no `LICENSE` file (currently:
`fr33dz/Algeria-geojson` for v48) is marked **"upstream license unknown"**.
Such files are attributed to their author, but you should contact the
upstream author before any commercial use and should not assume you may
relicense or sublicense them.

## Summary by license

- **MIT**: `v58/algeria-cities.geojson`, `v69/map-algeria-69-wilayas.svg` — MIT notice preserved in the same folder.
- **ODbL-1.0**: `v69/wilaya-boundaries.geojson` — attribution + share-alike required, see above.
- **Unknown / not shipped**: v48 data — see [`v48/README.md`](v48/README.md) for why and what's needed.
