#!/usr/bin/env node
/**
 * AI cost, July 2026. The baseline month.
 *
 *   node build-aijuly.js [outfile.pptx]
 */

const path = require("path");
const { buildDeck } = require("./lib/engine");
const content = require("./content-aijuly");

const OUT = process.argv[2] || path.join(__dirname, "AI_Cost_July_2026.pptx");

buildDeck(content, OUT, {
  title: "AI cost, July 2026 — Harel",
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
