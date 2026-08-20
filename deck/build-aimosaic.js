#!/usr/bin/env node
/**
 * The AI bill drawn to scale, one slide for the CIO deck.
 *
 *   node build-aimosaic.js [outfile.pptx]
 */

const path = require("path");
const { buildDeck } = require("./lib/engine");
const content = require("./content-aimosaic");

const OUT = process.argv[2] || path.join(__dirname, "AI_Consumption_Mosaic.pptx");

buildDeck(content, OUT, {
  title: "AI consumption, drawn to scale — Harel",
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
