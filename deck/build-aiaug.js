#!/usr/bin/env node
/**
 * AI cost, 1 to 19 August 2026. What changed against July.
 *
 *   node build-aiaug.js [outfile.pptx]
 */

const path = require("path");
const { buildDeck } = require("./lib/engine");
const content = require("./content-aiaug");

const OUT = process.argv[2] || path.join(__dirname, "AI_Cost_August_2026_MTD.pptx");

buildDeck(content, OUT, {
  title: "AI cost, August 2026 month to date — Harel",
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
