/**
 * The AI bill drawn to scale, 1 July to 19 August 2026.
 *
 * The slide itself is built by `lib/mosaic-slide.js` from the data module,
 * which is what keeps this period and the August-only cut identical in
 * everything except their numbers. Read that file for how the mosaic works and
 * `data/ai-cost-window.js` for what the numbers are.
 */

const { mosaicSlide } = require("./lib/mosaic-slide");
const W = require("./data/ai-cost-window");

module.exports = [
  mosaicSlide(W, {
    teamNotes: [
      "  insait      one application, agent, is two thirds of it",
      "  ai-factory  the only team using all three providers, three different jobs",
      "  solugen     one application, half our call volume, cheapest per call",
    ],
  }),
];
