/**
 * The AI bill drawn to scale, August 2026 on its own.
 *
 * Same slide, same rules, same builder as the July-to-August version; only the
 * period differs. See `lib/mosaic-slide.js` for the design and
 * `data/ai-cost-august.js` for what this period does and does not contain.
 *
 * THE ONE THING TO SAY OUT LOUD WHEN PRESENTING IT
 *
 * This is 1 to 19 August, nineteen days, not a calendar month. The export does
 * not go further. Every figure on the slide is for those nineteen days and the
 * only monthly number is labelled a run rate.
 */

const { mosaicSlide } = require("./lib/mosaic-slide");
const A = require("./data/ai-cost-august");

module.exports = [
  mosaicSlide(A, {
    teamNotes: [
      "  insait      agent and the copilots, and half of it has no application name",
      "  ai-factory  the only team using all three providers, three different jobs",
      "  solugen     one application, insureGen, and nothing else worth a band",
    ],
  }),
];
