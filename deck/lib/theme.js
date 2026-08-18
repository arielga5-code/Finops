/**
 * Design tokens for the Harel Cloud FinOps deck.
 *
 * Everything visual lives here. Change a value in this file and every slide
 * that uses it follows — that is the whole point of keeping it separate from
 * the slide content in `content.js`.
 *
 * The palette is lifted from the "Harel Cloud Cost — CIO" deck so the two
 * presentations read as one document.
 */

const COLORS = {
  // Canvas
  bg: "070A12", // slide background, near-black navy
  card: "121B2D", // panel / card fill
  cardAlt: "0E1422", // table row fill, slightly darker than card
  cardHi: "1D2D42", // hovered / emphasised panel
  border: "23304A", // hairline borders on cards and tables

  // Type
  text: "F4F7FB", // primary text
  muted: "91A0B7", // secondary text, labels, axis ticks
  faint: "536078", // captions, footnotes, disabled rows

  // Accents — each cloud/provider keeps one colour across the whole deck
  azure: "2F8CFF", // blue
  aws: "FF9F43", // orange
  gcp: "3DDC97", // green
  ai: "B07CFF", // purple — AI / Foundry / model spend
  cyan: "3DD9EB", // secondary highlight
  // Tints of `ai`, for charts that stack more than one vendor's AI spend. AI
  // is always purple across the decks; these keep the vendors apart inside it
  // without breaking that rule.
  aiMid: "8E5FD8",
  aiDeep: "6A46A8",
  danger: "FF6B7A", // increases, overruns
  good: "3DDC97", // savings, decreases
  warn: "E0A030",
};

/** Series colours for charts, in the order they are handed out. */
const SERIES = [
  COLORS.azure,
  COLORS.cyan,
  COLORS.aws,
  COLORS.ai,
  COLORS.gcp,
  COLORS.danger,
  "2AD38C",
  "FFB84D",
  "6C8CFF",
  "8FD8E8",
  "C76B00",
  "7A6BFF",
];

const FONTS = {
  // Calibri ships with Office everywhere and renders true-to-width in QA.
  body: "Calibri",
  head: "Calibri",
};

/**
 * Type scale, sized for a meeting-room flat panel rather than a laptop.
 *
 * Nothing here drops below 12pt. On a 65" screen 12pt is comfortable to about
 * 1.9 m and legible to 2.5 m; 13pt reaches 2.0/2.7 m; titles at 28pt reach
 * 4.4 m. Anything smaller is a document, not a slide — see README.
 */
const SIZE = {
  eyebrow: 13,
  title: 28,
  titleSmall: 23,
  deck: 13, // right-hand deck note under the title
  cardTitle: 15,
  cardSub: 12,
  stat: 28,
  statBig: 42,
  statLabel: 12,
  statNote: 12,
  body: 13,
  table: 12,
  tableHead: 12,
  caption: 12,
  footnote: 12,
};

/** Slide geometry, in inches. 13.333 x 7.5 (LAYOUT_WIDE). */
const GEO = {
  w: 13.333,
  h: 7.5,
  margin: 0.5,
  get contentW() {
    return this.w - this.margin * 2;
  },
  eyebrowY: 0.3,
  titleY: 0.6,
  bodyTop: 1.35,
  footY: 6.95,
};

module.exports = { COLORS, SERIES, FONTS, SIZE, GEO };
