/**
 * The AI bill drawn to scale: one slide, every dollar as area.
 *
 * 1 July to 19 August 2026. Every figure is derived in `data/ai-cost-window.js`
 * from the AI cost dataset workbook, the same module behind the table and the
 * card versions, so the three can never disagree.
 *
 * WHY A MOSAIC AND NOT A CHART
 *
 * The question is three questions at once: which team, which application, which
 * provider. A bar chart answers one of them and puts the other two in a legend.
 * A mosaic answers all three in the same rectangle:
 *
 *   column width   = what the team spent
 *   band height    = that application's share of its team
 *   block width    = which provider was paid, inside that application
 *
 * So a block's area is exactly team x application x provider, and the whole
 * rectangle is the whole bill. Nothing has to be looked up, and the sentence
 * the CIO leaves with is the one the picture makes on its own: the widest
 * column on the slide is the one nobody owns.
 *
 * WHAT IS NOT ON IT, AND WHY
 *
 * The 13 remaining teams are $1,461, 1.8% of the bill. At true scale that is a
 * column a fifth of an inch wide, too narrow to label; drawn wide enough to
 * label it would be five times its real size, which is exactly the lie an area
 * chart is not allowed to tell. It stays in the footnote with its figure, and
 * the four columns shown are 98.2% of the bill.
 */

const { COLORS } = require("./lib/theme");
const W = require("./data/ai-cost-window");

const { money, pct, num, sum } = W;

const LISTED = ["insait", "ai-factory", "solugen"];
const TEAM_ACCENT = { insait: COLORS.cyan, "ai-factory": COLORS.ai, solugen: COLORS.warn };

/**
 * Applications get their own band down to this share of their team; below it
 * they are rolled into one band, which keeps its own count so a column never
 * implies a team has four applications when it has forty-seven.
 *
 * Seven percent is where a band stops being tall enough to hold its own label. A
 * named application drawn as an unlabelled stripe is worse than one folded into
 * a line that says how many were folded, so the floor is set at the point the
 * type gives out rather than at a round number.
 */
const BAND_FLOOR = 0.07;

const provider = (a) =>
  W.PROVIDERS.map((p) => ({ color: W.SOURCE_COLOR[p], value: a[p] || 0 }));

function column(name) {
  const all = W.appsFor(name).filter((a) => a.total >= 0.005);
  const total = sum(all.map((a) => a.total));

  // A row with no application name is drawn whatever its size: it is the thing
  // the slide exists to show, and rolling it into "more applications" would
  // hide it behind a label that says the opposite of what it is.
  const keep = new Set(all.filter((a) => a.unnamed || a.total / total >= BAND_FLOOR));
  const head = all.filter((a) => keep.has(a));
  const tail = all.filter((a) => !keep.has(a));

  const rows = head.map((a) => ({
    name: a.app.length > 26 ? a.app.slice(0, 25) + "..." : a.app,
    value: a.total,
    parts: provider(a),
  }));
  if (tail.length) {
    rows.push({
      name: `${tail.length} more applications`,
      value: sum(tail.map((a) => a.total)),
      muted: true,
      parts: W.PROVIDERS.map((p) => ({
        color: W.SOURCE_COLOR[p],
        value: sum(tail.map((a) => a[p] || 0)),
      })),
    });
  }

  const t = W.teams.find((x) => x.name === name);
  const unnamed = sum(all.filter((a) => a.unnamed).map((a) => a.total));
  const share = unnamed / total;

  // The sub-line carries the unnamed figure only when its band is too small to
  // carry its own label, which is the one case where the picture cannot say it.
  const hidden = share > 0.005 && share < BAND_FLOOR;

  return {
    name,
    accent: TEAM_ACCENT[name],
    total,
    sub: hidden
      ? "incl. " + money(unnamed) + " unnamed"
      : num(t.invocations) + " calls, $" + t.perThousand.toFixed(0) + "/1K",
    subColor: hidden ? COLORS.danger : COLORS.muted,
    rows,
  };
}

const columns = [
  ...LISTED.map(column),
  {
    name: "No owner",
    accent: COLORS.danger,
    outline: COLORS.danger,
    total: W.unattributable,
    sub: "no application, no team, no calls reported",
    subColor: COLORS.danger,
    rows: [
      {
        name: "Untagged Bedrock spend",
        value: W.untagged,
        parts: [{ color: W.SOURCE_COLOR.Claude, value: W.untagged }],
      },
      {
        name: "Guardrail fees",
        value: W.guardrails,
        parts: [{ color: W.SOURCE_COLOR.Claude, value: W.guardrails }],
      },
    ],
  },
];

const others = W.teams.filter((t) => !LISTED.includes(t.name) && t.invocations > 0);
const othersTotal = sum(others.map((t) => t.best));
const shown = sum(columns.map((c) => c.total));

// Every band in a column has to add to that column, and the columns plus what
// is deliberately left out have to add to the bill. An area chart that does not
// reconcile is a picture, not a figure.
for (const c of columns) {
  const bands = sum(c.rows.map((r) => r.value));
  if (Math.abs(bands - c.total) > 0.5) {
    throw new Error(
      `mosaic: ${c.name} bands come to ${money(bands)} against a column of ${money(c.total)}.`
    );
  }
  for (const r of c.rows) {
    const parts = sum(r.parts.map((p) => p.value));
    if (Math.abs(parts - r.value) > 0.5) {
      throw new Error(
        `mosaic: ${c.name} / ${r.name} provider blocks come to ${money(parts)} ` +
          `against a band of ${money(r.value)}.`
      );
    }
  }
}
{
  // The unshown remainder is the 13 small teams plus the reporting gap between
  // the workbook's two sheets, both named in the footnote.
  const missing = W.grand - shown;
  if (missing < 0 || missing > othersTotal + W.sheetGap + 1) {
    throw new Error(
      `mosaic: ${money(missing)} is unaccounted for, which is more than the ` +
        `${money(othersTotal)} of small teams and the ${money(W.sheetGap)} sheet gap.`
    );
  }
}

const insaitCol = columns[0];
const aws = W.bySource.find((s) => s.name === "Claude");

module.exports = [
  {
    kind: "mosaic",
    eyebrow: "AI consumption, " + W.label,
    accent: COLORS.cyan,
    title: "The whole AI bill, drawn to scale",
    note:
      money(W.grand) + " over " + W.days + " days. Every block is money: how much, " +
      "whose, and who was paid.",

    columns,

    strip: {
      title: "Where the money actually went",
      parts: W.bySource.map((s) => ({
        label: s.name === "Claude" ? "Claude / Bedrock" : s.name === "Azure" ? "Azure OpenAI" : "GCP",
        value: s.total,
        color: s.color,
      })),
    },

    foot:
      "Column width is the team, band height is the application, block width is the provider, so every " +
      "area is a dollar figure. Red outline and red type mean no application name. The four columns are " +
      pct((shown / W.grand) * 100, 0) + " of the bill; the rest is 13 teams too small to draw at true " +
      "scale, " + money(othersTotal) + " between them, and " + money(W.grand - shown - othersTotal) +
      " of difference between the report's two tables.",

    speakerNotes: [
      "HOW TO READ IT, IN ONE SENTENCE: every block is money. Wide column, big",
      "team. Tall band, big application. The colour is who we paid.",
      "",
      "  " + money(W.grand) + " over " + W.days + " days, " + num(W.invocations) + " calls,",
      "  about " + money(W.perMonth) + " a month at this rate.",
      "",
      "THE FOUR COLUMNS",
      ...columns.map(
        (c) =>
          `  ${c.name.padEnd(12)} ${money(c.total).padStart(8)}  ` +
          `${pct((c.total / W.grand) * 100).padStart(6)} of the bill`
      ),
      "",
      "DO NOT EXPLAIN THE CHART. Point at the right-hand column and say: that one",
      "is bigger than any team we have, and it belongs to nobody. Everything else",
      "on the slide is there to make that comparison fair.",
      "",
      "THE NO-OWNER COLUMN IS ORANGE FOR A REASON. Orange is Bedrock everywhere in",
      "this deck, and that is exactly what this money is: " + money(W.untagged) +
        " of Bedrock",
      "model spend with no application tag, plus " + money(W.guardrails) + " of guardrail fees.",
      pct((aws.unattributable / aws.total) * 100, 0) +
        " of our Bedrock bill has no application on it.",
      "",
      "THE RED BANDS INSIDE THE TEAMS are the same defect one level down: rows",
      "whose application name is the word 'unknown' or '(unlabeled)'.",
      ...W.unnamedRows
        .filter((r) => r.best >= 1)
        .map(
          (r) =>
            `  ${r.app.padEnd(13)} ${r.source.padEnd(7)} ${r.team.toLowerCase().padEnd(10)} ` +
            `${money(r.best).padStart(8)}  ${num(r.invocations).padStart(8)} calls`
        ),
      "",
      "Together with the untagged column that is " + money(W.unchargeable) + ", " +
        pct((W.unchargeable / W.grand) * 100, 0) + " of the bill with",
      "no application name on it.",
      "",
      "IF ASKED ABOUT THE TEAMS",
      "  insait      one application, agent, is two thirds of it",
      "  ai-factory  the only team using all three providers, three different jobs",
      "  solugen     one application, half our call volume, cheapest per call",
      "",
      "IF ASKED WHY 13 TEAMS ARE MISSING: they are " + money(othersTotal) + " between them, " +
        pct((othersTotal / W.grand) * 100) + ".",
      "At true scale that column is a fifth of an inch. Drawing it wide enough to",
      "label would make it look five times its real size, and on a chart where",
      "area is money that is not a rounding choice, it is a false statement. The",
      "figure is in the footnote.",
      "",
      "IF ASKED WHETHER IT RECONCILES: the bands add to their column and the",
      "columns add to the bill, and the build fails if they stop doing so. The",
      "workbook's own two tables differ by " + pct((W.sheetGap / W.attributed) * 100) +
        " on dollars and agree exactly on calls.",
      "",
      "THE ASK: put an application tag on the Bedrock calls. Gateway",
      "configuration, not a project. Then the right-hand column disappears into",
      "the teams where it belongs, and this becomes a chargeback.",
    ].join("\n"),
  },
];
