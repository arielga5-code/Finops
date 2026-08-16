#!/usr/bin/env node
/**
 * Combined CIO briefing — merges the v33 CIO deck with the Jan–Jul operational
 * review, then carries the operational detail as an appendix.
 *
 *   node build-cio.js [outfile.pptx]
 */

const path = require("path");
const { buildDeck } = require("./lib/engine");
const content = require("./content-cio");

const OUT = process.argv[2] || path.join(__dirname, "Harel_Cloud_Cost_CIO_v34.pptx");

buildDeck(content, OUT, { title: "Harel Cloud Cost — CIO briefing, v34" }).catch((e) => {
  console.error(e);
  process.exit(1);
});
