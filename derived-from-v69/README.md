# Derived from v69 (experimental — single source of truth)

**Status: experimental, kept alongside `v48/` and `v58/`, not a replacement
yet.** If it keeps validating well, the plan is to eventually retire the
independently-sourced `v48/` and `v58/` in favor of always deriving from
`v69` — see [Next steps](#next-steps).

## The idea

`v48/` and `v58/` are each sourced from a *different* upstream repo, at a
different OSM export vintage, from a different contributor. That means two
files claiming to describe "the same" wilaya boundary can disagree simply
because they were snapshotted at different times, even when both are
individually correct.

`v69/wilaya-boundaries.geojson` is the most detailed, most recent layout.
Both reforms that grew the wilaya count (48→58 in 2019, 58→69 in 2026)
worked by carving each new wilaya out of exactly **one** existing wilaya —
never splitting a new wilaya's territory across two different parents.
That's confirmed by the explicit `mother_wilaya_code` field in
[geoalgeria's `wilayas.json`](https://github.com/yasserstudio/geoalgeria/blob/main/packages/dataset/data/wilayas.json)
(sourced from the Journaux Officiels of Law 19-12 and Law 26-06), not just
inferred from geometry — see [`wilaya-hierarchy.json`](../wilaya-hierarchy.json)
at the repo root.

That single-parent invariant means `v69` can be treated as **one canonical
source**: `v58` and `v48` are just "undo the split" unions, computed
mechanically from `v69` + the hierarchy file. No separate upstream repo, no
separate OSM vintage, no risk of two files disagreeing on a boundary that
didn't actually change.

## Files here

- `v58.geojson` — 58 features. For codes 1-58, this is v69's own polygon; for
  the 11 wilayas added in 2026 (codes 59-69), each is unioned back into its
  `mother_code`.
- `v48.geojson` — 48 features. Every code 49-69 is unioned back through the
  hierarchy chain to its ultimate pre-1984-reform-boundary ancestor in 1-48.

Regenerate both: `node scripts/derive-versions.js` (needs `v69/wilaya-boundaries.geojson`
and `wilaya-hierarchy.json`, plus `@turf/turf`: `npm install`).

## Validation done so far

`node scripts/cross-validate-derived.js` compares these derived files
against the independently-sourced `v48/all-wilayas.geojson` and
`v58/algeria-cities.geojson`, wilaya by wilaya, by area.

- **v48 vs v48 (derived)**: worst discrepancy across all 48 wilayas was
  **0.8%** (Tipaza). Essentially full agreement between two completely
  independent derivation chains (ZSmain 58-set + 2019 merge, vs. geoalgeria
  v69 + 2019-and-2026 double merge) — strong evidence the technique is
  sound.
- **v58 vs v58 (derived)**: 56 of 58 wilayas matched closely; two
  (`Ghardaïa`/`El Meniaa` and `Ouargla`/`Touggourt`) showed a large
  per-wilaya difference (18% and 48%) but their **combined** (parent+child)
  area matched to within 0.1% either way. That means both sources agree on
  the *outer* boundary of the combined territory and only disagree on
  exactly where the newer 2019 internal split line runs — plausible given
  `wilaya-hierarchy.json`'s own metadata notes some post-reform boundaries
  are still mid-transition (`transition_end: 2026-12-31`).

Re-run the check any time with `node scripts/cross-validate-derived.js`.

## Next steps

Before replacing `v48/`/`v58/` with these derived files:

1. Decide how to handle the Ghardaïa/El Meniaa and Ouargla/Touggourt
   internal-line disagreement (most likely: trust geoalgeria's v69 line,
   since it's the more recently maintained, actively-validated-by-CI source
   per its own README).
2. Get a second opinion/eyeball check on a rendered map, not just area
   percentages — a boundary can match on area while still being drawn in
   the wrong place.
3. Once comfortable, `v48/README.md` and `v58` docs can point here instead,
   and the separately-fetched upstream copies can be dropped in favor of
   always regenerating from `v69` + `wilaya-hierarchy.json`.
