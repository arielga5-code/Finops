#!/usr/bin/env node
/**
 * The August AI bill drawn to scale, one slide for the CIO deck.
 *
 *   node build-augmosaic.js [outfile.pptx]
 */

const path = require("path");
const { buildDeck } = require("./lib/engine");
const content = require("./content-augmosaic");

const OUT = process.argv[2] || path.join(__dirname, "AI_Consumption_Mosaic_August.pptx");

buildDeck(content, OUT, {
  title: "AI consumption, August 2026, drawn to scale — Harel",
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
