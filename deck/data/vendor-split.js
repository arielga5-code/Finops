/**
 * Vendor × AI split, derived from the extracted chart data.
 *
 * Nothing here is typed in by hand. Every figure is summed out of
 * `charts.json` at build time, so the bars on a slide cannot drift away from
 * the source workbooks the rest of the deck is built from.
 *
 * The basis, stated once and applied everywhere:
 *
 *   Vendor total = that vendor's *consumption*, plus Amazon Bedrock.
 *
 *   Bedrock is billed through AWS Marketplace rather than as AWS consumption,
 *   but it is unambiguously AWS AI spend, so it is pulled in. The rest of
 *   Marketplace — security, database and observability subscriptions, $1.5M
 *   over the period — stays out, matching the source deck's convention that
 *   Marketplace purchases are reported separately from consumption.
 *
 *   AI = the generative-AI service lines listed in AI_SERVICES below.
 *   Other = everything else the vendor billed, Azure Databricks included.
 *
 * Databricks sits in "other" deliberately. It is a data platform, and its
 * 600,000-DBCU pre-purchase was paid up front in April, so its consumption
 * bills at $0 from May onward — folding it into AI would put a fixed data
 * cost inside a line meant to track generative-AI growth.
 */

const CHARTS = require("./charts.json");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

/** Where each vendor's consumption comes from. */
const SOURCE = {
  azure: "chart8",  // Azure consumption by service
  aws: "chart2",    // AWS consumption by service
  gcp: "chart31",   // GCP consumption by service
};

/** Generative-AI service lines, by vendor, as they are named in the source. */
const AI_SERVICES = {
  azure: ["Foundry Models", "Foundry Tools", "GitHub", "Microsoft Copilot Studio"],
  aws: [],                                  // AWS bills its AI through Marketplace
  gcp: ["Vertex AI", "Gemini API"],
};

/** AI billed through a marketplace rather than as consumption. */
const AI_MARKETPLACE = {
  aws: { chart: "chart5", series: ["Amazon Bedrock Edition"] },
};

/* ------------------------------------------------------------------ */

/** Re-index a chart's series onto the full Jan–Jul month axis, zero-filled. */
function align(chartId) {
  const raw = CHARTS[chartId];
  if (!raw) throw new Error(`vendor-split: unknown chart ${chartId}`);
  const at = new Map(raw.cats.map((c, i) => [c, i]));
  const out = new Map();
  for (const s of raw.series) {
    out.set(s.name, MONTHS.map((m) => (at.has(m) ? s.vals[at.get(m)] || 0 : 0)));
  }
  return out;
}

const zeros = () => MONTHS.map(() => 0);
const add = (a, b) => a.map((v, i) => v + b[i]);
const sumRows = (rows) => rows.reduce(add, zeros());

function splitFor(vendor) {
  const rows = align(SOURCE[vendor]);
  const aiNames = new Set(AI_SERVICES[vendor]);

  for (const name of aiNames) {
    if (!rows.has(name)) {
      throw new Error(
        `vendor-split: "${name}" is listed as ${vendor} AI but is not a series ` +
        `in ${SOURCE[vendor]} — the source data changed, update AI_SERVICES.`
      );
    }
  }

  let ai = sumRows([...aiNames].map((n) => rows.get(n)));
  const other = sumRows([...rows].filter(([n]) => !aiNames.has(n)).map(([, v]) => v));

  const mkt = AI_MARKETPLACE[vendor];
  if (mkt) {
    const m = align(mkt.chart);
    ai = add(ai, sumRows(mkt.series.map((n) => {
      if (!m.has(n)) throw new Error(`vendor-split: missing ${n} in ${mkt.chart}`);
      return m.get(n);
    })));
  }

  return { ai, other, total: add(ai, other) };
}

const vendors = {
  azure: splitFor("azure"),
  aws: splitFor("aws"),
  gcp: splitFor("gcp"),
};

const order = ["azure", "aws", "gcp"];

const totals = {
  ai: sumRows(order.map((v) => vendors[v].ai)),
  other: sumRows(order.map((v) => vendors[v].other)),
};
totals.all = add(totals.ai, totals.other);

/** AI as a percentage of that month's bill. */
const aiShare = totals.all.map((t, i) => (t ? (totals.ai[i] / t) * 100 : 0));

const LABEL = { azure: "Azure", aws: "AWS", gcp: "GCP" };

/**
 * Series for the combined chart, stacked bottom-up: every vendor's non-AI
 * spend first, then the AI bands on top, so AI reads as one contiguous block
 * across the top of each column while hue still identifies the vendor.
 */
const combinedSeries = [
  ...order.map((v) => ({ name: `${LABEL[v]} — other`, vals: vendors[v].other })),
  ...[...order].reverse().map((v) => ({ name: `${LABEL[v]} — AI`, vals: vendors[v].ai })),
];

module.exports = {
  MONTHS, LABEL, order, vendors, totals, aiShare, combinedSeries,
  AI_SERVICES, AI_MARKETPLACE, SOURCE,
};
