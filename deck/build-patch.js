#!/usr/bin/env node
/**
 * The three rebuilt slides on their own, for `tools/merge-slides.py` to splice
 * into the hand-assembled Final deck.
 *
 *   node build-patch.js [outfile.pptx]
 *
 * Rendering them as a deck of their own also makes them reviewable in
 * isolation — open the output and you see exactly what will land in the deck.
 */

const path = require("path");
const { buildDeck } = require("./lib/engine");
const content = require("./content-patch");

const OUT = process.argv[2] || path.join(__dirname, "patch-slides.pptx");

buildDeck(content, OUT, { title: "Replacement slides — Harel CIO deck" }).catch((e) => {
  console.error(e);
  process.exit(1);
});
