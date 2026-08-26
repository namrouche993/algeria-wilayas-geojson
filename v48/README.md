# v48 — status: blocked, not shipped yet

The 48-wilaya variant is **not included yet**. This folder documents why, so
nobody re-does the same dead-end research.

## What was checked

The brief's suggested source, [`fr33dz/Algeria-geojson`](https://github.com/fr33dz/Algeria-geojson)
(default branch `master`, not `main`), does not actually provide a usable
48-feature dataset:

- `wilayas/*.geojson` contains only **6 files**, not 48: `06-bejaia`,
  `11-tamanrasset`, `15-tizi_ouzou`, `16-alger`, `35-boumerdes`,
  `37-illizi.geojson`. No `properties` (no names, no codes) on the features
  in those files either.
- The root file `all-wilayas.geojson` — which looked like the obvious
  candidate for a merged 48-wilaya `FeatureCollection` — actually contains
  **58 features** (verified: `Adrar`, `Timimoune`, `Bordj Badji Mokhtar`, …),
  i.e. it's a *58-wilayas* dataset (post-2019 split), not the 48-wilaya
  layout. Shipping it as `v48` would be factually wrong.
- The repo has no `LICENSE` file (`license: null` via the GitHub API) —
  confirmed "upstream license unknown" as the brief anticipated, but that's
  moot until there's actually a 48-feature file to ship.

## What's needed to unblock this

A source with exactly 48 features representing Algeria's wilayas as they
stood **before the 2019 split** (i.e. the historical 48-wilaya layout, in use
1984–2019, before the ten new southern wilayas — Timimoune, Bordj Badji
Mokhtar, Bordj Baji Mokhtar-adjacent splits, In Salah, In Guezzam, Djanet,
etc. — were carved out). Options to pursue:

1. Find another upstream repo/dataset that specifically ships the pre-2019
   48-wilaya boundaries as a single `FeatureCollection`.
2. Derive it programmatically from a 58-wilaya source (e.g. `v58`) by
   merging each of the 10 post-2019 wilayas back into its pre-2019 parent
   and re-dissolving the polygons — doable, but needs a verified
   parent/child mapping table and a geometry-dissolve step (e.g. via
   `mapshaper` or `turf.js`), not just a naive JSON edit.
3. Revisit `fr33dz/Algeria-geojson`'s 6 individual `wilayas/*.geojson` files
   as partial reference data if a full set ever appears upstream.

Once a real 48-feature source is confirmed, add it as
`v48/all-wilayas.geojson`, list it in `versions.json` at the repo root, and
`scripts/count-features.js` / the CI workflow will pick it up automatically —
no other script changes needed.

## Do not

Do not fabricate or hand-merge a 48-feature file just to make the CI count
pass — that would ship geographically wrong boundaries under a "48 wilayas"
label. Leave this folder empty of data until a real source is found.
