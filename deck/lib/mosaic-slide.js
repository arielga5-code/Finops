/**
 * The mosaic slide: one period's whole AI bill drawn so that area is money.
 *
 *   column width   what the team spent
 *   band height    that application's share of its team
 *   block width    which provider was paid, inside that application
 *
 * A block's area is therefore exactly team x application x provider, and the
 * whole rectangle is the whole bill. The question a CIO asks is three questions
 * at once, which is how it gets asked; a bar chart answers one of them and puts
 * the other two in a legend.
 *
 * Built as a function of the data rather than written out per period, so the
 * combined July-to-August window and August on its own produce the same slide
 * from the same rules and cannot drift apart. Everything period-specific, the
 * teams shown, the count of those left out, whether there is an inter-sheet
 * difference to disclose, is derived from the data module passed in.
 *
 * `W` is any module exposing the `data/ai-cost-window.js` interface.
 */

const { COLORS } = require("./theme");

/**
 * Applications get their own band down to this share of their team; below it
 * they are rolled into one band that keeps its own count, so a column never
 * implies a team has four applications when it has forty-seven.
 *
 * Seven percent is where a band stops being tall enough to hold its own label.
 * A named application drawn as an unlabelled stripe is worse than one folded
 * into a line that says how many were folded, so the floor sits at the point
 * the type gives out rather than at a round number.
 */
const BAND_FLOOR = 0.07;

/** How many teams get a column of their own before the rest are left out. */
const COLUMNS = 3;

const ACCENTS = [COLORS.cyan, COLORS.ai, COLORS.warn, COLORS.gcp, COLORS.aws];

/** A footnote reads better with small counts spelled out than set as digits. */
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven",
  "eight", "nine", "ten"];
const spell = (n) => (n < WORDS.length ? WORDS[n] : String(n));

function mosaicSlide(W, opts = {}) {
  const { money, pct, num, sum } = W;

  const listed = W.ownedTeams.slice(0, COLUMNS);
  const listedNames = listed.map((t) => t.name);
  // Counted by activity, not by spend: a team that made calls but was billed
  // nothing is still a team this picture does not show, and leaving it out of
  // the count would understate how much is missing from the canvas.
  const others = W.teams.filter(
    (t) => !listedNames.includes(t.name) && t.invocations > 0
  );
  const othersTotal = sum(others.map((t) => t.best));

  const provider = (a) =>
    W.PROVIDERS.map((p) => ({ color: W.SOURCE_COLOR[p], value: a[p] || 0 }));

  function column(team, i) {
    const all = W.appsFor(team.name).filter((a) => a.total >= 0.005);
    const total = sum(all.map((a) => a.total));

    // A row with no application name is drawn whatever its size: it is the
    // thing the slide exists to show, and rolling it into "more applications"
    // would hide it behind a label saying the opposite of what it is.
    const keep = new Set(
      all.filter((a) => a.unnamed || a.total / total >= BAND_FLOOR)
    );
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

    const unnamed = sum(all.filter((a) => a.unnamed).map((a) => a.total));
    const share = total ? unnamed / total : 0;
    // The sub-line carries the unnamed figure only when its band is too small
    // to carry its own label, the one case where the picture cannot say it.
    const hidden = share > 0.005 && share < BAND_FLOOR;

    return {
      name: team.name,
      accent: ACCENTS[i % ACCENTS.length],
      total,
      sub: hidden
        ? "incl. " + money(unnamed) + " unnamed"
        : num(team.invocations) + " calls, $" + team.perThousand.toFixed(0) + "/1K",
      subColor: hidden ? COLORS.danger : COLORS.muted,
      rows,
    };
  }

  const noOwner = {
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
    ].filter((r) => r.value > 0.005),
  };

  const columns = [...listed.map(column), noOwner];
  const shown = sum(columns.map((c) => c.total));
  const residual = W.grand - shown - othersTotal;

  /* Every band has to add to its column and every block to its band, and the
     columns plus what is deliberately left out have to add to the bill. An
     area chart that does not reconcile is a picture, not a figure. */
  for (const c of columns) {
    const bands = sum(c.rows.map((r) => r.value));
    if (Math.abs(bands - c.total) > 0.5) {
      throw new Error(
        `mosaic: ${c.name} bands come to ${money(bands)} against a column of ` +
          `${money(c.total)}.`
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
  if (residual < -0.5 || residual > W.sheetGap + 1) {
    throw new Error(
      `mosaic: ${money(residual)} is unaccounted for beyond the ${money(othersTotal)} ` +
        `of smaller teams, which is more than the ${money(W.sheetGap)} the source ` +
        `itself is out by.`
    );
  }

  const aws = W.bySource.find((s) => s.name === "Claude");
  const awsShare = aws && aws.total ? (aws.unattributable / aws.total) * 100 : 0;

  const footTail =
    (others.length
      ? ` the rest is ${others.length} team${others.length === 1 ? "" : "s"} too small ` +
        `to draw at true scale, ${money(othersTotal)} between them` +
        (residual > 0.5 ? `, and ${money(residual)} of difference between the ` +
          `report's two tables.` : ".")
      : "");

  return {
    kind: "mosaic",
    eyebrow: (opts.eyebrow || "AI consumption") + ", " + W.label,
    accent: COLORS.cyan,
    title: opts.title || "The whole AI bill, drawn to scale",
    note:
      money(W.grand) + " over " + W.days + " days. Every block is money: how much, " +
      "whose, and who was paid.",

    columns,

    strip: {
      title: "Where the money actually went",
      parts: W.bySource.map((s) => ({
        label:
          s.name === "Claude" ? "Claude / Bedrock"
            : s.name === "Azure" ? "Azure OpenAI"
            : "GCP",
        value: s.total,
        color: s.color,
      })),
    },

    foot:
      "Column width is the team, band height is the application, block width is the provider, so " +
      "every area is a dollar figure. Red outline and red type mean no application name. The " +
      spell(columns.length) + " columns are " + pct((shown / W.grand) * 100, 0) +
      " of the bill;" + footTail,

    speakerNotes: [
      "HOW TO READ IT, IN ONE SENTENCE: every block is money. Wide column, big",
      "team. Tall band, big application. The colour is who we paid.",
      "",
      "  " + money(W.grand) + " over " + W.days + " days, " + num(W.invocations) + " calls,",
      "  about " + money(W.perMonth) + " a month at this rate.",
      "",
      "THE COLUMNS",
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
      "this deck, and that is exactly what this money is: " + money(W.untagged) + " of Bedrock",
      "model spend with no application tag, plus " + money(W.guardrails) + " of guardrail fees.",
      pct(awsShare, 0) + " of our Bedrock bill has no application on it.",
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
      ...(opts.teamNotes ? ["IF ASKED ABOUT THE TEAMS", ...opts.teamNotes, ""] : []),
      ...(others.length
        ? [
            "IF ASKED WHY " + others.length + " TEAMS ARE MISSING: they are " +
              money(othersTotal) + " between them, " + pct((othersTotal / W.grand) * 100) + ".",
            "At true scale that column is a fifth of an inch. Drawing it wide enough to",
            "label would make it look five times its real size, and on a chart where",
            "area is money that is not a rounding choice, it is a false statement. The",
            "figure is in the footnote.",
            "",
          ]
        : []),
      "IF ASKED WHETHER IT RECONCILES: the bands add to their column and the",
      "columns add to the bill, and the build fails if they stop doing so.",
      ...(W.sheetGap > 0.5
        ? [
            "The workbook's own two tables differ by " +
              pct((W.sheetGap / W.attributed) * 100) + " on dollars and agree",
            "exactly on calls.",
          ]
        : ["This export has a single table, so there is no inter-sheet difference."]),
      "",
      ...(opts.closing || [
        "THE ASK: put an application tag on the Bedrock calls. Gateway",
        "configuration, not a project. Then the right-hand column disappears into",
        "the teams where it belongs, and this becomes a chargeback.",
      ]),
    ].join("\n"),
  };
}

module.exports = { mosaicSlide, BAND_FLOOR, COLUMNS };
