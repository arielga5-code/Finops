#!/usr/bin/env node
/**
 * AI cost by application — the CIO cut of the AI_cost_table workbook.
 *
 *   node build-aicost.js [outfile.pptx]
 */

const path = require("path");
const { buildDeck } = require("./lib/engine");
const content = require("./content-aicost");

const OUT = process.argv[2] || path.join(__dirname, "AI_Cost_by_Application.pptx");

buildDeck(content, OUT, {
  title: "AI cost by application — Harel",
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
