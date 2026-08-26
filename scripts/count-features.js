#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function countFeatures(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  if (data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
    throw new Error(`${filePath}: not a GeoJSON FeatureCollection`);
  }
  return data.features.length;
}

function loadVersions() {
  const manifestPath = path.join(__dirname, "..", "versions.json");
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function main(argv) {
  if (argv.length > 0) {
    const filePath = argv[0];
    const expected = argv[1] ? parseInt(argv[1], 10) : null;
    const count = countFeatures(filePath);
    console.log(`${filePath}: ${count} features`);
    if (expected !== null && count !== expected) {
      console.error(`Expected ${expected}, got ${count}`);
      process.exit(1);
    }
    return;
  }

  const versions = loadVersions();
  let failed = false;

  for (const [key, meta] of Object.entries(versions)) {
    if (!meta.file) {
      console.log(`${key}: skipped (${meta.status}) — ${meta.notes || "no file yet"}`);
      continue;
    }
    const filePath = path.join(__dirname, "..", meta.file);
    if (!fs.existsSync(filePath)) {
      console.error(`${key}: expected file ${meta.file} is missing`);
      failed = true;
      continue;
    }
    try {
      const count = countFeatures(filePath);
      if (count === meta.expectedFeatures) {
        console.log(`${key}: OK (${count} features)`);
      } else {
        console.error(`${key}: FAIL — expected ${meta.expectedFeatures}, got ${count}`);
        failed = true;
      }
    } catch (err) {
      console.error(`${key}: FAIL — ${err.message}`);
      failed = true;
    }
  }

  if (failed) {
    process.exit(1);
  }
}

main(process.argv.slice(2));
