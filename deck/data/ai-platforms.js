/**
 * The five platforms the AI bill is actually spent on, January to July 2026.
 *
 * This is the one place the per-platform series lives. Both the "AI went from
 * 4% of the bill to 27%" chart and the platform breakdown that precedes it read
 * from here, so the two slides cannot disagree about what any platform cost.
 *
 * Basis: billed AI, all three clouds, metered consumption Jan-Jul 2026.
 * Excludes the Databricks pre-purchase, which draws down against the April
 * payment and bills at $0, including it would swamp every share on the slide
 * with money that is not being spent again. AWS July is gross of the $16,100
 * MAP credit, on the same footing as the rest of the deck.
 *
 * Order is by period total, largest first, and the colour on each platform is
 * the one its series already carries in the chart.
 */

const { COLORS } = require("../lib/theme");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

const PLATFORMS = [
  {
    name: "Azure AI Foundry",
    color: COLORS.azure,
    vals: [5764, 6875, 7840, 10544, 14913, 21609, 19613],
    desc: "Foundry models, Document Intelligence, AI Search and Defender for AI.",
  },
  {
    name: "GitHub Copilot",
    color: COLORS.cyan,
    vals: [2779, 3618, 4319, 4080, 6467, 16654, 19260],
    desc: "Developer seats plus AI credit overage. Billed in full.",
  },
  {
    name: "AWS Bedrock (Claude)",
    color: COLORS.aws,
    vals: [0, 0, 841, 1609, 3811, 10507, 25288],
    desc: "Claude models via Claude Code. July gross of the MAP credit.",
  },
  {
    name: "Cowork",
    color: COLORS.ai,
    vals: [97, 100, 117, 130, 80, 0, 8920],
    desc: "Pay-as-you-go agent credits, billed through Power Platform.",
  },
  {
    name: "Google Vertex AI",
    color: COLORS.gcp,
    vals: [0, 0, 0, 0, 379, 958, 2359],
    desc: "Gemini prediction tokens on the shared GCP projects.",
  },
];

const sum = (a) => a.reduce((x, y) => x + y, 0);
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");

/**
 * How a platform grew, said in whichever way is honest for its shape.
 *
 * A percentage off a zero or near-zero January is arithmetic theatre, Copilot
 * Studio would read "+9,096%" against $97, so anything that started at nothing
 * gets its first billed month named instead, and the reader is handed the two
 * figures rather than a ratio.
 */
function badgeFor(p) {
  const first = p.vals[0];
  const last = p.vals[p.vals.length - 1];
  const startedAt = p.vals.findIndex((v) => v > 0);
  if (!first) return `First billed in ${MONTHS[startedAt]}`;
  const growth = (last / first - 1) * 100;
  if (growth >= 1000) return `${money(first)} to ${money(last)}`;
  return `${growth >= 0 ? "+" : ""}${growth.toFixed(0)}% Jan to Jul`;
}

/** The shape the `platforms` slide kind wants, derived, never typed in. */
const items = PLATFORMS.map((p) => ({
  name: p.name,
  color: p.color,
  desc: p.desc,
  total: sum(p.vals),
  first: p.vals[0],
  last: p.vals[p.vals.length - 1],
  badge: badgeFor(p),
}));

/** The same numbers as chart series, for the monthly stacked view. */
const series = PLATFORMS.map((p) => ({ name: p.name, vals: p.vals }));

const monthlyTotals = MONTHS.map((_, i) => sum(PLATFORMS.map((p) => p.vals[i])));
const total = sum(monthlyTotals);

/** Look one platform's period total up by name, used by slides that cite one. */
const platform = (name) => {
  const p = items.find((x) => x.name === name);
  if (!p) throw new Error(`ai-platforms: no platform named "${name}"`);
  return p;
};

module.exports = { MONTHS, PLATFORMS, items, series, monthlyTotals, total, platform, money };
