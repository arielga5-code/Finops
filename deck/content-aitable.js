/**
 * One slide for the CIO deck: consumption by team, by application, by provider.
 *
 * 1 July to 19 August 2026. Every figure is derived in `data/ai-cost-window.js`
 * from the AI cost dataset workbook.
 *
 * This is the printed table, put on a slide. It answers three questions at once
 * because they are asked as one: which team, which application, and which
 * provider. Nothing here is a chart, deliberately. A CIO reading a cost table
 * wants to find a line and point at it, and a ranked bar chart cannot be
 * pointed at.
 *
 * WHAT IS ON IT AND WHAT IS ROLLED UP
 *
 * A slide holds about twenty rows at the deck's 12pt floor. There are 79
 * application names, so the three teams that carry the bill get their largest
 * applications listed and everything else is rolled into one line per team,
 * with the count of what was rolled so nobody thinks a team has four
 * applications when it has thirty-six.
 *
 * The two things never rolled up, whatever their size:
 *
 *   Every row named `unknown` or `(unlabeled)` inside a listed team, because
 *   the whole point of the slide is that they are visible.
 *
 *   The untagged Bedrock spend and the guardrail fees, which have no
 *   application row at all and are the largest single item in the bill.
 *
 * The rows add to the grand total exactly. It is a partition, not a selection.
 */

const { COLORS } = require("./lib/theme");
const W = require("./data/ai-cost-window");

const { money, pct, num, sum } = W;

const TEAM_FILL = COLORS.cardHi; // group headers, so they read as headers
const UNNAMED = COLORS.danger;
const ROLLED = COLORS.faint;

/** How many named applications each listed team shows before rolling the rest. */
const PER_TEAM = { insait: 4, "ai-factory": 4, solugen: 2 };
const LISTED = Object.keys(PER_TEAM);

const dash = { text: "-", color: COLORS.faint };
const cash = (v, opts = {}) =>
  v >= 0.5 ? { text: money(v), ...opts } : v > 0 ? { text: "<$1", ...opts } : dash;

/**
 * One team block: a header row carrying the team's own totals, then its largest
 * applications, then one rolled line for the tail.
 *
 * Unnamed rows are pulled into the listed set regardless of where they rank, so
 * the slide can never quietly bury one in the roll-up.
 */
function teamBlock(name) {
  const t = W.teams.find((x) => x.name === name);
  const all = W.appsFor(name);
  const keep = new Set(all.filter((a) => a.unnamed && a.total >= 0.005));
  all.filter((a) => a.total >= 0.005).slice(0, PER_TEAM[name]).forEach((a) => keep.add(a));
  const head = all.filter((a) => keep.has(a));
  const tail = all.filter((a) => !keep.has(a));

  const rows = [
    [
      { text: t.name, bold: true, fill: TEAM_FILL },
      { text: t.apps + " applications", color: COLORS.muted, fill: TEAM_FILL },
      cash(t.claude, { bold: true, fill: TEAM_FILL }),
      cash(t.azure, { bold: true, fill: TEAM_FILL }),
      cash(t.gcp, { bold: true, fill: TEAM_FILL }),
      cash(t.best, { bold: true, fill: TEAM_FILL }),
      { text: num(t.invocations), bold: true, fill: TEAM_FILL },
    ],
    ...head.map((a) => [
      "",
      { text: a.app, bold: false, color: a.unnamed ? UNNAMED : COLORS.text },
      cash(a.Claude),
      cash(a.Azure),
      cash(a.GCP),
      cash(a.total, { bold: true }),
      { text: num(a.invocations) },
    ]),
  ];

  if (tail.length) {
    rows.push([
      "",
      { text: `${tail.length} more applications`, color: ROLLED },
      cash(sum(tail.map((a) => a.Claude)), { color: ROLLED }),
      cash(sum(tail.map((a) => a.Azure)), { color: ROLLED }),
      cash(sum(tail.map((a) => a.GCP)), { color: ROLLED }),
      cash(sum(tail.map((a) => a.total)), { color: ROLLED }),
      { text: num(sum(tail.map((a) => a.invocations))), color: ROLLED },
    ]);
  }
  return rows;
}

const others = W.teams.filter((t) => !LISTED.includes(t.name) && t.invocations > 0);
const otherRow = [
  { text: "Other", bold: true, fill: TEAM_FILL },
  // One line: this cell wrapping is what costs the table its last row.
  { text: others.length + " more teams", color: COLORS.muted, fill: TEAM_FILL },
  cash(sum(others.map((t) => t.claude)), { bold: true, fill: TEAM_FILL }),
  cash(sum(others.map((t) => t.azure)), { bold: true, fill: TEAM_FILL }),
  cash(sum(others.map((t) => t.gcp)), { bold: true, fill: TEAM_FILL }),
  cash(sum(others.map((t) => t.best)), { bold: true, fill: TEAM_FILL }),
  { text: num(sum(others.map((t) => t.invocations))), bold: true, fill: TEAM_FILL },
];

/**
 * The line that belongs to no team and no application.
 *
 * The untagged model spend and the guardrail fees are separate charges and are
 * broken out in the speaker notes, but they are one row here: they are billed
 * on AWS, they carry no application tag, and a slide with twenty rows on it
 * cannot spend two of them making a distinction that changes nothing about who
 * owns the money. Which is nobody.
 */
const noOwnerRow = [
  { text: "No team", bold: true, color: UNNAMED, fill: TEAM_FILL },
  {
    text: "Untagged Bedrock and guardrails",
    color: UNNAMED,
    fill: TEAM_FILL,
  },
  { text: money(W.unattributable), bold: true, color: UNNAMED, fill: TEAM_FILL },
  { text: "-", color: COLORS.faint, fill: TEAM_FILL },
  { text: "-", color: COLORS.faint, fill: TEAM_FILL },
  { text: money(W.unattributable), bold: true, color: UNNAMED, fill: TEAM_FILL },
  { text: "not reported", color: COLORS.faint, fill: TEAM_FILL },
];

const totalRow = [
  { text: "Total", bold: true, fill: TEAM_FILL },
  { text: "the whole AI bill", color: COLORS.muted, fill: TEAM_FILL },
  { text: money(W.bySource.find((s) => s.name === "Claude").total), bold: true, fill: TEAM_FILL },
  { text: money(W.bySource.find((s) => s.name === "Azure").total), bold: true, fill: TEAM_FILL },
  { text: money(W.bySource.find((s) => s.name === "GCP").total), bold: true, fill: TEAM_FILL },
  { text: money(W.grand), bold: true, color: COLORS.cyan, fill: TEAM_FILL },
  { text: num(W.invocations), bold: true, fill: TEAM_FILL },
];

const rows = [
  ...LISTED.flatMap(teamBlock),
  otherRow,
  noOwnerRow,
  totalRow,
];

// The table is the bill, so it has to add up to the bill. If a future edit
// drops or double-counts a block, the build stops here rather than putting a
// table on a screen that does not reconcile.
{
  const listedTotal = sum(LISTED.map((n) => W.teams.find((t) => t.name === n).best));
  const shown = listedTotal + sum(others.map((t) => t.best)) + W.untagged + W.guardrails;
  if (Math.abs(shown - W.grand) > 0.5) {
    throw new Error(
      `ai-cost table: the rows add to ${money(shown)} but the bill is ${money(W.grand)}.`
    );
  }
}

const unnamedInTable = W.unnamedRows.filter((r) => r.best >= 0.5).length;

module.exports = [
  {
    kind: "table",
    eyebrow: "AI consumption, " + W.label,
    accent: COLORS.cyan,
    title: "Every team, every application, every provider",
    note:
      money(W.grand) + " over " + W.days + " days. Rows in red have no application name.",
    tables: [
      {
        fontSize: 12,
        rowH: 0.24,
        cols: [
          { label: "Team", w: 1.55 },
          { label: "Application", w: 3.15 },
          { label: "Claude", w: 1.25, align: "right" },
          { label: "Azure", w: 1.45, align: "right" },
          { label: "GCP", w: 1.1, align: "right" },
          { label: "Total", w: 1.3, align: "right" },
          { label: "Calls", w: 1.35, align: "right" },
        ],
        rows,
      },
    ],
    foot:
      "Cost Explorer actuals where they exist, token estimate where they do not. Untagged Bedrock and " +
      "guardrail fees are billed on AWS with no application tag, so they belong to no team. " +
      money(W.unchargeable) + ", " + pct((W.unchargeable / W.grand) * 100, 0) +
      " of the bill, carries no application name.",
    speakerNotes: [
      "ONE SLIDE, THREE QUESTIONS: which team, which application, which provider.",
      "",
      "  " + money(W.grand) + " over " + W.days + " days, " + num(W.invocations) + " calls.",
      "  " + money(W.attributed) + " attributed to a team, " +
        pct((W.attributed / W.grand) * 100) + ".",
      "",
      "READ IT TOP TO BOTTOM. The three teams at the top are " +
        pct((sum(LISTED.map((n) => W.teams.find((t) => t.name === n).best)) / W.attributed) * 100, 0) +
        " of everything",
      "attributed. Everything below them is small or has no owner.",
      "",
      "THE RED ROWS ARE THE POINT.",
      "  unknown, Claude, insait           " + money(W.unnamedRows[0].best) + "  " +
        num(W.unnamedRows[0].invocations) + " calls",
      "  (unlabeled), Azure, insait        " + money(W.unnamedRows[1].best) + "  " +
        num(W.unnamedRows[1].invocations) + " calls",
      "  (unlabeled), Azure, solugen       " + money(W.unnamedRows[2].best) + "  " +
        num(W.unnamedRows[2].invocations) + " calls",
      "  untagged Bedrock, no team at all  " + money(W.untagged),
      "  guardrail fees, no team at all    " + money(W.guardrails),
      "",
      "Those are not applications. They are the absence of a name on " +
        money(W.unchargeable) + ",",
      pct((W.unchargeable / W.grand) * 100) + " of the bill. At $91 and $97 per thousand calls the two",
      "insait rows are production agent traffic with the label missing, not stray",
      "test scripts.",
      "",
      "THE UNTAGGED LINE IS BIGGER THAN ANY TEAM WE HAVE. " + money(W.untagged) + " against",
      money(W.teams[0].best) + " for insait, our largest. It is the single biggest item on the",
      "slide and it belongs to nobody.",
      "",
      "IF ASKED ABOUT THE PROVIDER COLUMNS: they are where the money went, not who",
      "we buy from. ai-factory is the only team using all three, and each one does",
      "a different job: Azure for claims-copilot, Claude for the developer cli,",
      "GCP for both OCR pipelines.",
      "",
      "IF ASKED WHY SOME TEAMS SHOW A ROLLED LINE: there are 79 application names",
      "and about twenty rows fit on a slide. Every unnamed row is listed whatever",
      "its size; only real, named, small applications are rolled up, and the count",
      "is on the line.",
      "",
      "IF ASKED WHETHER THE NUMBERS ARE SOLID: the report's two tables disagree on",
      "dollars by " + pct((W.sheetGap / W.attributed) * 100) +
        " and agree on call volumes exactly. It does not move",
      "anything on this slide.",
      "",
      "THE ASK: put an application tag on the Bedrock calls. It is gateway",
      "configuration, not a project, and it is what turns this table into a",
      "monthly chargeback.",
    ].join("\n"),
  },
];
