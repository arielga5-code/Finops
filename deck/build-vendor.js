#!/usr/bin/env node
/**
 * Cloud consumption by vendor — AI against everything else, Jan–Jul 2026.
 *
 *   node build-vendor.js [outfile.pptx]
 */

const path = require("path");
const { buildDeck } = require("./lib/engine");
const content = require("./content-vendor");

const OUT = process.argv[2] || path.join(__dirname, "Cloud_Consumption_by_Vendor.pptx");

buildDeck(content, OUT, { title: "Cloud consumption by vendor — Harel, Jan–Jul 2026" }).catch((e) => {
  console.error(e);
  process.exit(1);
});
