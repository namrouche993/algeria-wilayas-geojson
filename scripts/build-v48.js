#!/usr/bin/env node
// Rebuilds v48/all-wilayas.geojson (48 pre-2019 wilaya boundaries) from
// ZSmain/algeria-provinces-geojson's 58 current-wilaya files, by unioning
// each post-2019 wilaya back into its pre-2019 parent. See v48/README.md
// for the full methodology and the parent/child mapping rationale.
//
// Requires Node 18+ (global fetch) and @turf/turf:
//   npm install --no-save @turf/turf
//   node scripts/build-v48.js
"use strict";

const fs = require("fs");
const path = require("path");
const turf = require("@turf/turf");

const REPO_ROOT = path.join(__dirname, "..");
const RAW_BASE =
  "https://raw.githubusercontent.com/ZSmain/algeria-provinces-geojson/main/data";

const OFFICIAL_NAME_BY_CODE = {
  "01": "Adrar", "02": "Chlef", "03": "Laghouat", "04": "Oum El Bouaghi",
  "05": "Batna", "06": "Béjaïa", "07": "Biskra", "08": "Béchar",
  "09": "Blida", "10": "Bouira", "11": "Tamanrasset", "12": "Tébessa",
  "13": "Tlemcen", "14": "Tiaret", "15": "Tizi Ouzou", "16": "Alger",
  "17": "Djelfa", "18": "Jijel", "19": "Sétif", "20": "Saïda",
  "21": "Skikda", "22": "Sidi Bel Abbès", "23": "Annaba", "24": "Guelma",
  "25": "Constantine", "26": "Médéa", "27": "Mostaganem", "28": "M'Sila",
  "29": "Mascara", "30": "Ouargla", "31": "Oran", "32": "El Bayadh",
  "33": "Illizi", "34": "Bordj Bou Arréridj", "35": "Boumerdès",
  "36": "El Tarf", "37": "Tindouf", "38": "Tissemsilt", "39": "El Oued",
  "40": "Khenchela", "41": "Souk Ahras", "42": "Tipaza", "43": "Mila",
  "44": "Aïn Defla", "45": "Naâma", "46": "Aïn Témouchent",
  "47": "Ghardaïa", "48": "Relizane",
};

const PARENT_CODE_OF_CHILD = {
  "49_timimoun.geojson": "01",
  "50_bordj_badji_mokhtar.geojson": "01",
  "51_ouled_djellal.geojson": "07",
  "52_beni_abbes.geojson": "08",
  "53_ain_salah.geojson": "11",
  "54_ain_guezzam.geojson": "11",
  "55_touggourt.geojson": "30",
  "56_djanet.geojson": "33",
  "57_el_m_ghair.geojson": "39",
  "58_el_menia.geojson": "47",
};

function codeFromFilename(filename) {
  return filename.split("_")[0].padStart(2, "0");
}

function arabicName(nameCombined) {
  const m = (nameCombined || "").match(/([؀-ۿ][؀-ۿ\s]*)$/u);
  return m ? m[1].trim() : undefined;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

async function fetchFileList() {
  const res = await fetch(
    "https://api.github.com/repos/ZSmain/algeria-provinces-geojson/contents/data",
    { headers: { "User-Agent": "algeria-wilayas-geojson-build-script" } }
  );
  if (!res.ok) throw new Error(`Directory listing failed: HTTP ${res.status}`);
  const entries = await res.json();
  return entries.map((e) => e.name).filter((n) => n.endsWith(".geojson"));
}

async function main() {
  console.log("Listing upstream files...");
  const allFiles = await fetchFileList();
  console.log(`Found ${allFiles.length} files upstream.`);

  console.log("Downloading...");
  const featureByFile = {};
  for (const file of allFiles) {
    const raw = await fetchJson(`${RAW_BASE}/${file}`);
    featureByFile[file] = raw.type === "FeatureCollection" ? raw.features[0] : raw;
  }

  const childFiles = new Set(Object.keys(PARENT_CODE_OF_CHILD));
  const childrenByParentCode = {};
  for (const [child, parentCode] of Object.entries(PARENT_CODE_OF_CHILD)) {
    (childrenByParentCode[parentCode] = childrenByParentCode[parentCode] || []).push(child);
  }

  const outFeatures = [];

  for (const file of allFiles) {
    if (childFiles.has(file)) continue;
    const code = codeFromFilename(file);
    const parentFeature = featureByFile[file];
    const osmIds = [parentFeature.properties.osm_id];
    const mergedFrom = [];

    let geometryFeature = parentFeature;
    const children = childrenByParentCode[code];
    if (children) {
      for (const childFile of children) {
        const childFeature = featureByFile[childFile];
        osmIds.push(childFeature.properties.osm_id);
        mergedFrom.push(childFeature.properties.name_en || childFeature.properties.name);
        geometryFeature = turf.union(
          turf.featureCollection([geometryFeature, childFeature])
        );
      }
    }

    outFeatures.push({
      type: "Feature",
      properties: {
        code,
        name: OFFICIAL_NAME_BY_CODE[code],
        name_ar: arabicName(parentFeature.properties.name_),
        osm_ids: osmIds,
        ...(mergedFrom.length ? { merged_from: mergedFrom } : {}),
      },
      geometry: geometryFeature.geometry,
    });
  }

  outFeatures.sort((a, b) => a.properties.code.localeCompare(b.properties.code));

  if (outFeatures.length !== 48) {
    throw new Error(`Expected 48 features, got ${outFeatures.length} — upstream data may have changed, review the parent/child mapping.`);
  }

  const fc = { type: "FeatureCollection", features: outFeatures };
  const outPath = path.join(REPO_ROOT, "v48", "all-wilayas.geojson");
  fs.writeFileSync(outPath, JSON.stringify(fc));
  console.log(`Wrote ${outFeatures.length} features to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
