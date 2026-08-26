#!/usr/bin/env node
// Cross-checks derived-from-v69/{v48,v58}.geojson (built by merging pieces
// of the single v69 source) against v48/all-wilayas.geojson and
// v58/algeria-cities.geojson (independently sourced from different repos
// and OSM export vintages). Large discrepancies would mean the "single
// source of truth" approach doesn't hold up; close agreement is the
// validation needed before v48/ and v58/ could be replaced by these.
"use strict";

const fs = require("fs");
const path = require("path");
const turf = require("@turf/turf");

const REPO_ROOT = path.join(__dirname, "..");
const load = (p) => JSON.parse(fs.readFileSync(path.join(REPO_ROOT, p), "utf8"));

function normalize(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/['’ ]/g, "")
    .toUpperCase();
}

function areaByName(fc, nameProp) {
  const out = new Map();
  for (const f of fc.features) {
    const name = f.properties[nameProp];
    const key = normalize(name);
    out.set(key, { name, area: (out.get(key)?.area || 0) + turf.area(f) / 1e6 });
  }
  return out;
}

function compare(label, derivedFc, referenceFc, refNameProp) {
  console.log(`\n=== ${label} ===`);
  const derived = areaByName(derivedFc, "name");
  const reference = areaByName(referenceFc, refNameProp);

  let worst = 0;
  let worstName = "";
  for (const [key, { name, area: dArea }] of derived.entries()) {
    const ref = reference.get(key);
    const rArea = ref?.area;
    if (rArea === undefined) {
      console.log(`  NO MATCH for "${name}" in reference dataset`);
      continue;
    }
    const pctDiff = (Math.abs(dArea - rArea) / rArea) * 100;
    if (pctDiff > worst) {
      worst = pctDiff;
      worstName = name;
    }
    if (pctDiff > 10) {
      console.log(
        `  ${name}: derived=${Math.round(dArea)}km2 reference=${Math.round(rArea)}km2 diff=${pctDiff.toFixed(1)}%`
      );
    }
  }
  console.log(`  Worst discrepancy: ${worstName} at ${worst.toFixed(1)}%`);
  console.log(`  Matched ${derived.size} wilayas total.`);
}

const derived58 = load("derived-from-v69/v58.geojson");
const derived48 = load("derived-from-v69/v48.geojson");
const v58 = load("v58/algeria-cities.geojson");
const v48 = load("v48/all-wilayas.geojson");

compare("v58 (derived from v69) vs v58/algeria-cities.geojson", derived58, v58, "nam");
compare("v48 (derived from v69) vs v48/all-wilayas.geojson", derived48, v48, "name");
