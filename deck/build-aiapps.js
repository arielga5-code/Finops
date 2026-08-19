#!/usr/bin/env node
/**
 * AI cost by team and application, 1 July to 19 August 2026.
 *
 *   node build-aiapps.js [outfile.pptx]
 */

const path = require("path");
const { buildDeck } = require("./lib/engine");
const content = require("./content-aiapps");

const OUT = process.argv[2] || path.join(__dirname, "AI_Cost_by_Team_and_Application.pptx");

buildDeck(content, OUT, {
  title: "AI cost by team and application — Harel",
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
