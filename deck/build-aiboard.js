#!/usr/bin/env node
/**
 * The AI consumption slide for the CIO deck.
 *
 *   node build-aiboard.js [outfile.pptx]
 */

const path = require("path");
const { buildDeck } = require("./lib/engine");
const content = require("./content-aiboard");

const OUT = process.argv[2] || path.join(__dirname, "AI_Consumption_CIO_Slide.pptx");

buildDeck(content, OUT, {
  title: "AI consumption by team and application — Harel",
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
