# v48 — 48 wilayas (pre-2019 layout)

`all-wilayas.geojson` in this folder is a `FeatureCollection` with **48
features**, one per wilaya as they stood from the 1984 reform until the 2019
reform that added 10 new wilayas (codes 49-58).

## Why this isn't a straight copy of an upstream file

No upstream repo was found that ships the pre-2019 48-wilaya boundaries as a
ready-made file (see the original investigation notes in git history / the
first version of this file — `fr33dz/Algeria-geojson`'s `wilayas/` folder
only has 6 files, and its `all-wilayas.geojson` is actually 58 features, not
48). Instead this file is **derived**:

1. Source: [ZSmain/algeria-provinces-geojson](https://github.com/ZSmain/algeria-provinces-geojson)
   (`data/` folder), which ships all **58** current wilayas as individual
   OSM-derived GeoJSON files (each carries an `osm_id`, `admin_level: 4`,
   `boundary: administrative`, and a `wikipedia` tag — this is OpenStreetMap
   data, ODbL-1.0, regardless of the fact that the ZSmain repo itself has no
   `LICENSE` file).
2. The 2019 reform (Law creating wilayas 49-58) carved 10 new wilayas out of
   8 existing ones, **without renaming or renumbering** the original 01-48
   codes — it only shrank the territory of those 8 parents. So to
   reconstruct the pre-2019 boundary of those 8 wilayas, each child's current
   polygon is unioned back into its parent's current polygon:

   | Parent (code) | Child wilaya(s) merged back in |
   |---|---|
   | Adrar (01) | Timimoune, Bordj Badji Mokhtar |
   | Biskra (07) | Ouled Djellal |
   | Béchar (08) | Béni Abbès |
   | Tamanrasset (11) | In Salah, In Guezzam |
   | Ouargla (30) | Touggourt |
   | Illizi (33) | Djanet |
   | El Oued (39) | El M'Ghair |
   | Ghardaïa (47) | El Meniaa |

   The other 40 wilayas are untouched copies of their current boundary
   (their territory never changed).
3. The union was computed with `@turf/turf` v7 (`turf.union` on adjoining
   polygons — see the merge script referenced below). Sanity-checked: for
   each merge, `area(parent) + area(children) ≈ area(merged)` (no overlap,
   no gap — confirmed to within floating-point rounding for all 8 cases),
   and the full 48-feature set's total area (~2,314,000 km²) is in the
   expected range for Algeria (official figure: 2,381,741 km²; the ~3%
   difference is normal OSM boundary-simplification variance, consistent
   with `v69`, which is derived from the same kind of OSM source data).
4. Names use a static official code→French-name table in the merge script
   rather than the upstream `name`/`name_en` OSM tags directly, because
   those tags are **inconsistently ordered** between French and Kabyle-Latin
   transliteration across features upstream (e.g. Tlemcen's OSM `name` tag
   is literally `"Tilimsen"`, while Bouira's `name` tag correctly reads
   `"Bouira"` — trusting the tag directly would have produced a dataset with
   some wilayas in French and others in Kabyle for no discoverable reason).

## Properties

Each feature has:

- `code` — 2-digit official wilaya code (`"01"`–`"48"`), stable since 1984
- `name` — official French name
- `name_ar` — Arabic name (extracted from upstream's combined multi-script
  tag)
- `osm_ids` — upstream OpenStreetMap relation id(s) that contributed to this
  feature's geometry (more than one when merged, see `merged_from`)
- `merged_from` — present only on the 8 merged wilayas; lists which
  post-2019 wilaya(s) were unioned back in to reconstruct the boundary

## License

**ODbL-1.0** (OpenStreetMap) — same obligations as `v69`. See
[`ATTRIBUTION.md`](../ATTRIBUTION.md#odbl-obligations-v69-and-v48) at the
repo root: attribution + share-alike apply if you redistribute a derivative
database built from this file.

## Regenerating this file

See `scripts/build-v48.js` (downloads the 58 upstream files fresh and
re-runs the merge — use this if ZSmain's source data is updated).
