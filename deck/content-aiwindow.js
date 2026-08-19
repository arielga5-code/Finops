/**
 * Two slides for the CIO presentation, from the AI cost dataset workbook.
 * The window is 1 July to 19 August 2026.
 *
 * Every figure is derived in `data/ai-cost-window.js`. Read that module's
 * header before changing any wording here.
 *
 * WHY THESE TWO AND NOT SIX
 *
 * The workbook supports a dozen slides. Two get built because two is what a CIO
 * meeting has room for next to everything else in the deck, and because the
 * dataset answers exactly two questions that the existing deck does not:
 *
 *   1. How much is the whole thing, and how much of it has an owner?
 *      Answer: $79,448, and 45% of it cannot be charged to a named
 *      application. That is a governance finding, and it is the one number in
 *      this workbook that changes what anyone does on Monday.
 *
 *   2. Of the part that does have an owner, what actually drives the cost?
 *      Answer: not volume. Half the calls are a quarter of the money, and a
 *      seventh of the calls are nearly half of it. The bill is decided by which
 *      model handles which call, not by how many calls there are.
 *
 * Everything else the workbook shows, the estimator variance, the sheet-to-
 * sheet gap, the name sprawl, is a footnote on one of those two or belongs in
 * the standing monthly pack rather than in front of a CIO.
 */

const { COLORS } = require("./lib/theme");
const W = require("./data/ai-cost-window");

const { money, pct, times, num, sum } = W;

const ATTRIBUTED = COLORS.cyan;
const UNTAGGED = COLORS.danger;
const FEES = COLORS.warn;

// Team colours, local to the second slide. Deliberately not the provider
// accents: a team is not a vendor, and reusing the vendor palette on a team
// chart would suggest insait is "the Claude one".
const TEAM_COLOR = [COLORS.aws, COLORS.ai, COLORS.cyan, COLORS.faint];

const TOP_TEAMS = 3;
const shown = W.ownedTeams.slice(0, TOP_TEAMS);
const rest = W.teams.filter((t) => !shown.includes(t));

const dearest = shown[0];
const cheapest = shown.reduce((a, b) => (a.perThousand < b.perThousand ? a : b));
const spread = dearest.perThousand / cheapest.perThousand;

// One bar per group for the share chart, with everything outside the top three
// gathered so the three that matter keep their width.
const groups = [
  ...shown.map((t, i) => ({
    name: t.name,
    color: TEAM_COLOR[i],
    invocations: t.invocations,
    best: t.best,
  })),
  {
    name: `${rest.length} other teams`,
    color: TEAM_COLOR[3],
    invocations: sum(rest.map((t) => t.invocations)),
    best: sum(rest.map((t) => t.best)),
  },
];

// Percentages are computed here rather than left to PowerPoint's own
// percent-stacked mode, so the data labels show the share instead of the raw
// call count, and the two columns are guaranteed to be the same 100.
const share = (v, total) => (v / total) * 100;
const CATS = ["Share of calls", "Share of attributed cost"];

const untaggedVsTeam = W.untagged / W.teams[0].best;
const aws = W.bySource.find((s) => s.name === "Claude");

module.exports = [
  /* ============ 1 / how much, and how much has an owner ============== */
  {
    kind: "splitBars",
    eyebrow: "AI spend, " + W.label,
    accent: UNTAGGED,
    title:
      "Nearly half the AI bill cannot be charged to an application",
    note:
      money(W.grand) + " across Claude, Azure OpenAI and GCP in " + W.days +
      " days. About " + money(W.perMonth) + " a month at this rate.",
    bands: [
      {
        label: "Has a name on it",
        value: W.namedAttributed,
        color: ATTRIBUTED,
        note: "a team and a named application",
      },
      {
        label: "Has no name on it",
        value: W.unchargeable,
        color: UNTAGGED,
        note: "cannot be charged to anyone",
      },
    ],
    // The four rows are a partition of the grand total, not a selection from
    // it: they add to the bill exactly, so the bar above and the list below
    // are the same money counted two ways.
    rowsTitle: "The whole bill, from the top of the report to the bottom",
    items: [
      { name: "Named and owned by a team", value: W.namedAttributed, color: ATTRIBUTED },
      { name: "Untagged Bedrock spend", value: W.untagged, color: UNTAGGED },
      { name: "Rows named unknown", value: W.unnamedBest, color: FEES },
      { name: "Bedrock guardrail fees", value: W.guardrails, color: FEES },
    ],
    callout: {
      title:
        "The untagged line on its own is bigger than any team we have",
      text:
        money(W.untagged) + " of Bedrock spend carries no application tag, against " +
        money(W.teams[0].best) + " for " + W.teams[0].name + ", our largest team. " +
        pct((aws.unattributable / aws.total) * 100, 0) + " of everything we spend on Bedrock " +
        "has no application on it.",
    },
    foot:
      "Untagged spend and guardrail fees are billed on AWS and carry no application, so they cannot be " +
      "split by team and sit in no team figure. Azure has no reconciliation column at all, so every Azure " +
      "figure here is the token estimate. The report's two tables disagree on dollars by " +
      pct((W.sheetGap / W.attributed) * 100) + " and agree on call volumes exactly.",
    speakerNotes: [
      "THE WHOLE BILL, " + W.label + ", " + W.days + " days.",
      "",
      "  " + money(W.grand).padStart(8) + "  grand total",
      "  " + money(W.attributed).padStart(8) + "  attributed to a team   " +
        pct((W.attributed / W.grand) * 100),
      "  " + money(W.untagged).padStart(8) + "  untagged Bedrock spend",
      "  " + money(W.guardrails).padStart(8) + "  guardrail fees, billed separately",
      "",
      "  " + money(W.perDay) + " a day, about " + money(W.perMonth) + " a month, " +
        money(W.perDay * 365) + " a year at this rate.",
      "",
      "THE LINE TO LAND: the untagged bucket is " + times(untaggedVsTeam) + " our largest team.",
      "We are not looking at a rounding error, we are looking at the single",
      "largest item in the AI bill, and it belongs to nobody.",
      "",
      "SCALE IT ON AWS: " + money(aws.total) + " of Bedrock in the window, of which " +
        money(aws.unattributable),
      "has no application on it. That is " + pct((aws.unattributable / aws.total) * 100, 0) +
        " of one provider.",
      "",
      "AND IT IS WORSE THAN THE BAR SHOWS. Inside the attributed half, " +
        W.unnamedApps.length + " rows",
      "are named 'unknown' or '(unlabeled)', " + money(W.unnamedBest) + ". Together with the",
      "untagged bucket that is " + money(W.unchargeable) + ", " +
        pct((W.unchargeable / W.grand) * 100) + " of everything we spent.",
      "",
      "WHAT IT COSTS US IN PRACTICE: no chargeback, no quota that anyone can be",
      "held to, and no answer to 'whose is this' for nearly half the bill. The fix",
      "is a tag on the Bedrock calls, not a new system.",
      "",
      "IF ASKED WHETHER THE NUMBER IS SOLID: the two sheets in the source disagree",
      "by " + money(W.sheetGap) + ", " + pct((W.sheetGap / W.attributed) * 100) +
        ", because the most recent day is still",
      "estimated rather than billed. Call volumes match exactly. It does not move",
      "anything on this slide.",
    ].join("\n"),
  },

  /* ============ 2 / what actually drives the cost =================== */
  {
    kind: "chart",
    eyebrow: "Where the money goes",
    accent: COLORS.aws,
    title:
      dearest.name + " is " + pct(share(dearest.invocations, W.invocations), 0) +
      " of the calls and " + pct(share(dearest.best, W.attributed), 0) + " of the cost",
    note:
      "Attributed spend only. Volume and cost, as shares of the same " +
      W.days + " day window.",
    chartTitle: "Share of calls against share of cost, by team",
    chart: {
      grouping: "stacked",
      // Both columns are built to sum to 100, so the axis says so.
      axisMax: 100,
      axisMin: 0,
      valFmt: '0"%"',
      dataLabels: '0"%"',
      colors: groups.map((g) => g.color),
      inline: {
        cats: CATS,
        series: groups.map((g) => ({
          name: g.name,
          vals: [share(g.invocations, W.invocations), share(g.best, W.attributed)],
        })),
      },
    },
    stats: [
      {
        label: "Dearest per call",
        value: "$" + dearest.perThousand.toFixed(0),
        note: "per 1,000 calls, " + dearest.name,
        accent: COLORS.aws,
      },
      {
        label: "Cheapest per call",
        value: "$" + cheapest.perThousand.toFixed(0),
        note: "per 1,000 calls, " + cheapest.name,
        accent: COLORS.good,
      },
      {
        label: "The spread",
        value: times(spread),
        note: "between the cheapest and dearest team",
        accent: COLORS.warn,
      },
    ],
    foot:
      "Cost per call is a property of the work, not a score: an agent turn is not a classification call, " +
      "and " + dearest.name + " is not being wasteful for costing more. The point is the size of the lever. " +
      "A " + times(spread) + " spread means the bill is set by which model handles which call, and nobody has a target for that yet.",
    speakerNotes: [
      "BY TEAM, ATTRIBUTED SPEND ONLY",
      ...W.ownedTeams
        .filter((t) => t.best > 1)
        .map(
          (t) =>
            `  ${t.name.padEnd(12)} ${money(t.best).padStart(8)}  ` +
            `${pct(share(t.best, W.attributed)).padStart(6)} of cost  ` +
            `${pct(share(t.invocations, W.invocations)).padStart(6)} of calls  ` +
            `$${t.perThousand.toFixed(2).padStart(6)}/1K`
        ),
      "",
      "THE SHAPE OF THE SLIDE IS THE ARGUMENT. The two columns are the same teams",
      "in almost the opposite order. " + cheapest.name + " makes " +
        pct(share(cheapest.invocations, W.invocations), 0) + " of our calls for " +
        pct(share(cheapest.best, W.attributed), 0) + " of the",
      "money. " + dearest.name + " makes " + pct(share(dearest.invocations, W.invocations), 0) +
        " of them for " + pct(share(dearest.best, W.attributed), 0) + ".",
      "",
      "SO: VOLUME IS NOT THE COST DRIVER. Growth in calls is not what we should be",
      "managing. Which model answers which call is.",
      "",
      "BE FAIR ABOUT THIS, IT MATTERS. " + dearest.name + " runs agent and copilot traffic,",
      "which is genuinely more expensive per turn than a classification call. This",
      "is not a league table and nobody should leave the room thinking a team is",
      "being criticised. What it is, is the largest lever in the dataset: a " +
        times(spread) + " spread",
      "on unit cost, on which we currently set no target at all.",
      "",
      "THE PRACTICAL ASK: a cost-per-call target per workload class, agreed with",
      "the teams, reviewed monthly. Not a cap on usage. Nobody has to stop",
      "building anything.",
      "",
      "IF ASKED ABOUT GCP: it is small, " + money(W.bySource.find((s) => s.name === "GCP").total) +
        ", and the most expensive per call",
      "we run, $" + W.bySource.find((s) => s.name === "GCP").perThousand.toFixed(0) +
        " per thousand, because it is all document OCR. Worth a look on",
      "its own, not worth a slide here.",
      "",
      "IF ASKED WHY THE ESTIMATE CAN BE TRUSTED: across every row we can reconcile,",
      "the estimate is " + pct(W.variance) + " under the billed figure. Accurate in aggregate. Not",
      "per application, though, " + W.largestChecked.app + " alone is " +
        pct(W.largestCheckedVariance) + " under, " + money(W.largestChecked.ce - W.largestChecked.est) + ".",
    ].join("\n"),
  },
];
