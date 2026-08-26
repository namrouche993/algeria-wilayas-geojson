#!/usr/bin/env node
// Derives v58- and v48-equivalent boundaries from the single v69 source,
// using wilaya-hierarchy.json (code -> mother_code family tree, sourced
// from geoalgeria/wilayas.json, itself sourced from the Journaux Officiels
// of Law 19-12 (2019) and Law 26-06 (2026)).
//
// Works because every wilaya ever created from an existing one (49-58 in
// 2019, 59-69 in 2026) was carved from exactly ONE mother wilaya, never
// split across two -- confirmed by the explicit mother_wilaya_code field in
// the upstream dataset, not just inferred from geometry. That means v69 can
// serve as a single canonical source: v58 and v48 are just "undo the split"
// unions of v69 features, driven entirely by wilaya-hierarchy.json.
//
// See derived-from-v69/README.md for how this compares to v48/ and v58/,
// which are independently-sourced (different upstream repos/vintages).
"use strict";

const fs = require("fs");
const path = require("path");
const turf = require("@turf/turf");

const REPO_ROOT = path.join(__dirname, "..");

function loadJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, relPath), "utf8"));
}

const hierarchy = loadJSON("wilaya-hierarchy.json");
const v69 = loadJSON("v69/wilaya-boundaries.geojson");

const byCode = new Map(hierarchy.wilayas.map((w) => [w.code, w]));
const featureByCode = new Map(v69.features.map((f) => [f.properties.code, f]));

if (featureByCode.size !== hierarchy.wilayas.length) {
  throw new Error(
    `v69 has ${featureByCode.size} features but hierarchy has ${hierarchy.wilayas.length} entries — they must match 1:1`
  );
}

// direct parent for one generation up (used for the 58-level: 59-69 -> their mother)
function directMother(code) {
  const w = byCode.get(code);
  return w ? w.mother_code : null;
}

// walk the mother_code chain up to the root (used for the 48-level)
function rootAncestor(code) {
  let current = code;
  while (true) {
    const mother = directMother(current);
    if (mother === null || mother === undefined) return current;
    current = mother;
  }
}

function unionFeatures(features) {
  if (features.length === 1) return features[0];
  let merged = features[0];
  for (let i = 1; i < features.length; i++) {
    merged = turf.union(turf.featureCollection([merged, features[i]]));
  }
  return merged;
}

function buildLevel(maxCode, groupFn) {
  const groups = new Map(); // targetCode -> [feature,...]
  for (const [code, feature] of featureByCode.entries()) {
    const target = groupFn(code);
    if (!groups.has(target)) groups.set(target, []);
    groups.get(target).push(feature);
  }

  const outFeatures = [];
  for (let code = 1; code <= maxCode; code++) {
    const parts = groups.get(code);
    if (!parts || parts.length === 0) {
      throw new Error(`No v69 feature maps to target code ${code}`);
    }
    const mergedGeom = unionFeatures(parts).geometry;
    const meta = byCode.get(code);
    const mergedFromCodes = parts
      .map((f) => f.properties.code)
      .filter((c) => c !== code);
    outFeatures.push({
      type: "Feature",
      properties: {
        code,
        name: meta.name_fr,
        name_ar: meta.name_ar,
        ...(mergedFromCodes.length
          ? {
              merged_from_codes: mergedFromCodes,
              merged_from_names: mergedFromCodes.map((c) => byCode.get(c).name_fr),
            }
          : {}),
      },
      geometry: mergedGeom,
    });
  }
  outFeatures.sort((a, b) => a.properties.code - b.properties.code);
  return { type: "FeatureCollection", features: outFeatures };
}

console.log("Deriving v58-equivalent (58 features) from v69...");
const derived58 = buildLevel(58, (code) => (code <= 58 ? code : directMother(code)));
console.log(`  -> ${derived58.features.length} features`);

console.log("Deriving v48-equivalent (48 features) from v69...");
const derived48 = buildLevel(48, (code) => rootAncestor(code));
console.log(`  -> ${derived48.features.length} features`);

const outDir = path.join(REPO_ROOT, "derived-from-v69");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "v58.geojson"), JSON.stringify(derived58));
fs.writeFileSync(path.join(outDir, "v48.geojson"), JSON.stringify(derived48));
console.log(`Wrote ${outDir}/v58.geojson and ${outDir}/v48.geojson`);
