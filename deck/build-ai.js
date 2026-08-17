#!/usr/bin/env node
/**
 * FinOps for AI — CIO briefing.
 *
 *   node build-ai.js [outfile.pptx]
 */

const path = require("path");
const { buildDeck } = require("./lib/engine");
const content = require("./content-ai");

const OUT = process.argv[2] || path.join(__dirname, "FinOps_for_AI_CIO.pptx");

buildDeck(content, OUT, { title: "FinOps for AI — Harel, CIO briefing" }).catch((e) => {
  console.error(e);
  process.exit(1);
});
