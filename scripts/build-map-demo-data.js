#!/usr/bin/env node
// Preprocessing for the demo page (v2): single source of truth. Everything
// comes from v69/wilaya-boundaries.geojson + wilaya-hierarchy.json — no more
// separately-sourced v48/v58 files. Produces, for each resolution (48/58/69),
// the merged/simplified geometry + summed stats + a mother/child/original
// role computed *relative to that resolution* (see build-map-demo-data.js
// history or derived-from-v69/README.md for the underlying method).
"use strict";

const fs = require("fs");
const path = require("path");
const turf = require("@turf/turf");

const ROOT = path.join(__dirname, "..");
const load = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

const SIMPLIFY_TOLERANCE = 0.008; // degrees, ~800m at this latitude
const COORD_DECIMALS = 4; // ~11m precision, plenty for a country-view map

function roundCoords(geom) {
  const round = (n) => Math.round(n * 10 ** COORD_DECIMALS) / 10 ** COORD_DECIMALS;
  const mapRing = (ring) => ring.map(([x, y]) => [round(x), round(y)]);
  if (geom.type === "Polygon") {
    return { type: "Polygon", coordinates: geom.coordinates.map(mapRing) };
  }
  return { type: "MultiPolygon", coordinates: geom.coordinates.map((poly) => poly.map(mapRing)) };
}

function simplifyFeature(feature) {
  const simplified = turf.simplify(feature, { tolerance: SIMPLIFY_TOLERANCE, highQuality: true, mutate: false });
  return roundCoords(simplified.geometry);
}

const hierarchy = load("wilaya-hierarchy.json");
const hierByCode = new Map(hierarchy.wilayas.map((w) => [w.code, w]));

function directMother(code) {
  return hierByCode.get(code)?.mother_code ?? null;
}
function rootAncestor(code) {
  let current = code;
  while (true) {
    const mother = directMother(current);
    if (mother == null) return current;
    current = mother;
  }
}
// groupFn(res, code): which target code does `code` fold into at resolution `res`?
function groupFn(res, code) {
  if (res === 48) return rootAncestor(code);
  if (res === 58) return code <= 58 ? code : directMother(code);
  return code; // res === 69: nothing folds, every code stands alone
}
// role a *standalone target* plays at a given resolution: does it absorb
// anything here ("mother"), is it itself a reform-born code standing alone
// ("child-2019"/"child-2026"), or untouched ("original")?
function roleAtResolution(res, targetCode) {
  const absorbsAnything = hierarchy.wilayas.some(
    (w) => w.code !== targetCode && groupFn(res, w.code) === targetCode
  );
  if (absorbsAnything) return "mother";
  const w = hierByCode.get(targetCode);
  if (w.mother_code != null) return w.created >= 2025 ? "child-2026" : "child-2019";
  return "original";
}

function buildResolution(rawFeatures, res) {
  const byCode = new Map(rawFeatures.map((f) => [Number(f.properties.code), f]));
  const groups = new Map(); // targetCode -> [rawFeature,...]
  for (const [code, f] of byCode.entries()) {
    const target = groupFn(res, code);
    if (!groups.has(target)) groups.set(target, []);
    groups.get(target).push(f);
  }

  const out = [];
  for (const [targetCode, parts] of groups.entries()) {
    let merged = parts[0];
    for (let i = 1; i < parts.length; i++) {
      merged = turf.union(turf.featureCollection([merged, parts[i]]));
    }
    const geom = simplifyFeature(merged);
    const w = hierByCode.get(targetCode);
    const memberCodes = parts.map((f) => Number(f.properties.code));
    out.push({
      code: targetCode,
      name: w.name_fr,
      name_ar: w.name_ar,
      area_km2: Math.round(turf.area(merged) / 1e6),
      communes_count: memberCodes.reduce((s, c) => s + hierByCode.get(c).communes_count, 0),
      dairas_count: memberCodes.reduce((s, c) => s + hierByCode.get(c).dairas_count, 0),
      role: roleAtResolution(res, targetCode),
      member_codes: memberCodes.length > 1 ? memberCodes : undefined,
      geometry: geom,
    });
  }
  out.sort((a, b) => a.code - b.code);
  return out;
}

const v69raw = load("v69/wilaya-boundaries.geojson").features;

const res48 = buildResolution(v69raw, 48);
const res58 = buildResolution(v69raw, 58);
const res69 = buildResolution(v69raw, 69);
console.log(`48-res: ${res48.length} features, 58-res: ${res58.length} features, 69-res: ${res69.length} features`);

// Lightweight per-code table (all 69 base codes) for the client to compute
// "status at 48 / 58 / 69" live for whichever wilaya is selected, regardless
// of which resolution is currently on the map.
const hierarchyLite = hierarchy.wilayas.map((w) => ({
  code: w.code,
  name_fr: w.name_fr,
  name_ar: w.name_ar,
  mother_code: w.mother_code,
  created: w.created,
  law: w.law,
}));

const bundle = {
  generated: new Date().toISOString().slice(0, 10),
  hierarchy: hierarchyLite,
  res48: { features: res48 },
  res58: { features: res58 },
  res69: { features: res69 },
};

const outPath = path.join(__dirname, "..", "scratch-map-data.json");
fs.writeFileSync(outPath, JSON.stringify(bundle));
console.log(`Wrote ${outPath} — ${(fs.statSync(outPath).size / 1024).toFixed(0)} KB`);
