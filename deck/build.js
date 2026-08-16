#!/usr/bin/env node
/**
 * Operational review deck — the full Jan–Jul 2026 FinOps walkthrough.
 *
 *   node build.js [outfile.pptx]
 *
 * Content lives in `content.js`; layout and renderers in `lib/engine.js`.
 * For the shorter combined CIO briefing, see `build-cio.js`.
 */

const path = require("path");
const { buildDeck } = require("./lib/engine");
const content = require("./content");

const OUT = process.argv[2] || path.join(__dirname, "Cloud_FinOps_Harel_2026.pptx");

buildDeck(content, OUT, { title: "Cloud FinOps — Harel, 2026" }).catch((e) => {
  console.error(e);
  process.exit(1);
});
