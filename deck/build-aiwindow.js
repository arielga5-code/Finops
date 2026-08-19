#!/usr/bin/env node
/**
 * The two AI cost slides for the CIO presentation, 1 July to 19 August 2026.
 *
 * Built as a two-slide file rather than a deck: they are meant to be pasted
 * into the CIO presentation, and they carry the same design tokens as the rest
 * of it so they land without touching.
 *
 *   node build-aiwindow.js [outfile.pptx]
 */

const path = require("path");
const { buildDeck } = require("./lib/engine");
const content = require("./content-aiwindow");

const OUT = process.argv[2] || path.join(__dirname, "AI_Cost_Window_Slides.pptx");

buildDeck(content, OUT, {
  title: "AI cost, July to August 2026 — Harel",
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
