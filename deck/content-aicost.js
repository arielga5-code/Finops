/**
 * AI cost by application, a CIO cut of the AI_cost_table workbook.
 *
 * Every figure is derived in `data/ai-cost-apps.js` from the workbook's
 * Details sheet, so nothing here is typed in and nothing can drift from the
 * source. Read that module's header before changing any wording on these
 * slides: two properties of the source data shape the whole argument.
 *
 * The deck answers three questions in order, because that is the order a CIO
 * will ask them in:
 *
 *   1. How much is it, and where does it sit?
 *   2. Can I trust the number?          <- the finding
 *   3. What do I do about it?
 *
 * Question 2 comes before the breakdowns deliberately. Half the estimate has
 * nothing to reconcile against, and every slide after that is worth less if
 * the room does not already know it.
 */

const { COLORS } = require("./lib/theme");
const A = require("./data/ai-cost-apps");

const { money, pct, sum } = A;

// Verified and unverified get their own pair, kept clear of the provider
// accents used on the opening slide: an application is not "Azure-coloured"
// and "unverified-coloured" at the same time on any one chart.
const VERIFIED = COLORS.cyan;
const UNVERIFIED = COLORS.warn;

/** Disambiguate only where a name is genuinely ambiguous. */
const nameCount = A.byApp.reduce((m, r) => m.set(r.app, (m.get(r.app) || 0) + 1), new Map());
const label = (r) => (nameCount.get(r.app) > 1 ? `${r.app} (${r.source})` : r.app);

const TOP = 6;
const topApps = A.byApp.slice(0, TOP);
const tail = A.byApp.slice(TOP);

// Unit cost is only meaningful with enough calls behind it: a $0.05 row over
// five invocations produces a per-thousand figure that is arithmetic, not
// economics. 5,000 keeps the thirteen applications that carry 98% of the bill.
const VOL_FLOOR = 5000;
const byUnitCost = A.byApp
  .filter((r) => r.invocations >= VOL_FLOOR)
  .sort((a, b) => b.perThousand - a.perThousand);
const dearest = byUnitCost[0];
const cheapest = byUnitCost[byUnitCost.length - 1];

// Three teams are 98% of the spend and the rest are under $500 each, so the
// tail is rolled into one row: ten separate bars too short to see would cost
// the three that matter most of their height.
const TEAMS = 3;
const teamRow = (t) => {
  const rs = A.rows.filter((r) => (r.team || "unknown").toLowerCase() === t.name);
  const verified = sum(rs.filter((r) => r.ce !== null).map((r) => r.est));
  return {
    name: t.name,
    total: t.est,
    a: verified,
    b: t.est - verified,
    badge: `${t.apps} application${t.apps === 1 ? "" : "s"}`,
  };
};
const teamTail = A.byTeam.slice(TEAMS);
const teamRows = [
  ...A.byTeam.slice(0, TEAMS).map(teamRow),
  {
    name: `${teamTail.length} smaller teams`,
    total: sum(teamTail.map((t) => t.est)),
    a: sum(teamTail.map((t) => t.ce)),
    b: sum(teamTail.map((t) => t.est - t.ce)),
    badge: `${sum(teamTail.map((t) => t.apps))} applications`,
  },
];

const check = A.checks[0];
const mirror = A.mirrored[0];

module.exports = [
  /* ============================== cover ============================== */
  {
    kind: "section",
    kicker: "AI cost by application",
    title: "Where the AI money goes,\nand what we can prove",
    sub:
      money(A.total) + " of estimated AI cost across " + A.apps +
      " applications and " + A.invocations.toLocaleString("en-US") + " calls",
    accent: COLORS.cyan,
    speakerNotes: [
      "This is the per-application cut, from the AI cost table. It sits alongside",
      "the provider view in the main deck rather than replacing it: that one",
      "answers what we pay Azure, AWS and GCP; this one answers which application",
      "spent it and whether the figure can be checked.",
      "",
      "  " + money(A.total) + " estimated",
      "  " + A.invocations.toLocaleString("en-US") + " invocations",
      "  " + A.apps + " application rows",
      "",
      "THE ONE CAVEAT TO STATE UP FRONT: the workbook does not record a date",
      "range. Everything here is 'the period in the export'. If anyone asks",
      "whether this is a month, the honest answer is that the source does not say,",
      "and that is the first thing to fix.",
    ].join("\n"),
  },

  /* ========================= 1 / the total =========================== */
  {
    kind: "hero",
    eyebrow: "The total",
    accent: COLORS.cyan,
    title: "Three providers, one bill",
    note: "Estimated cost per application, as supplied in the AI cost table.",
    value: money(A.total),
    valueLabel:
      "estimated AI cost across " + A.apps + " applications and " +
      A.invocations.toLocaleString("en-US") + " invocations",
    delta: A.bySource[0].name + " and " + A.bySource[1].name + " are " +
      pct(((A.bySource[0].est + A.bySource[1].est) / A.total) * 100, 0) + " of it",
    deltaColor: COLORS.cyan,
    parts: A.bySource.map((s) => ({
      label: s.name,
      value: money(s.est),
      note: pct((s.est / A.total) * 100) + " of the estimate",
      accent: s.color,
    })),
    pointsTitle: "What the shape of this tells you",
    points: [
      "Azure carries the most calls by far, " +
        A.bySource.find((s) => s.name === "Azure").invocations.toLocaleString("en-US") +
        " of " + A.invocations.toLocaleString("en-US") + ", at the lowest cost per call.",
      "Claude costs almost as much as Azure on a fifth of the volume, because agent traffic is expensive per call.",
      "GCP is small and entirely OCR, the two document-intelligence applications.",
    ],
    foot:
      "One row per application per provider, " + A.apps + " rows in total. The workbook states no date " +
      "range, so this is the period contained in the export rather than a named month.",
    speakerNotes: [
      "BY PROVIDER",
      ...A.bySource.map(
        (s) =>
          `  ${s.name.padEnd(8)} ${money(s.est).padStart(9)}  ${pct((s.est / A.total) * 100).padStart(6)}  ` +
          `${s.invocations.toLocaleString("en-US").padStart(10)} calls  ${s.rows} rows`
      ),
      "",
      "The interesting contrast is Azure against Claude: nearly the same money,",
      "but Azure does it over " +
        (A.bySource.find((s) => s.name === "Azure").invocations /
          A.bySource.find((s) => s.name === "Claude").invocations).toFixed(1) +
        "x the calls. That is the unit-cost slide later on.",
      "",
      "Do not let the room anchor on the total. The next slide is the one that",
      "matters, because half of this number has nothing behind it yet.",
    ].join("\n"),
  },

  /* ==================== 2 / can we trust it ========================== */
  {
    kind: "splitBars",
    eyebrow: "Confidence",
    accent: UNVERIFIED,
    title: "Half the bill has nothing to check it against",
    note:
      "The workbook's reconciliation column is blank on every " +
      A.bySource.find((s) => s.verifiedRows === 0).name + " row.",
    bands: [
      {
        label: "Reconciled",
        value: A.verifiedEst,
        color: VERIFIED,
        note: "an actual figure exists to compare against",
      },
      {
        label: "Estimate only",
        value: A.unverifiedEst,
        color: UNVERIFIED,
        note: "no actual figure in the source at all",
      },
    ],
    rowsTitle: "The largest applications, and whether each one can be checked",
    items: topApps.map((r) => ({
      name: label(r),
      value: r.est,
      color: r.verified ? VERIFIED : UNVERIFIED,
    })),
    callout: {
      title:
        "Where the estimate can be checked, it is running " +
        pct(A.understatement) + " low",
      text:
        "On the " + check.name + " rows that carry both figures, the estimate says " +
        money(A.checkedEst) + " and the actual says " + money(A.checkedCe) + ". " +
        "Applied to the unreconciled half, that gap would be about " +
        money((A.unverifiedEst * A.understatement) / 100) + ".",
    },
    foot:
      mirror.name + " is not a third data point: its estimate equals its actual to the cent on all " +
      mirror.verifiedRows + " rows, so the two columns are one number rather than two measurements. " +
      check.name + " is the only genuine check in the workbook.",
    speakerNotes: [
      "THE SLIDE THAT MATTERS.",
      "",
      "  Reconciled     " + money(A.verifiedEst).padStart(9) + "  " + pct((A.verifiedEst / A.total) * 100),
      "  Estimate only  " + money(A.unverifiedEst).padStart(9) + "  " + pct((A.unverifiedEst / A.total) * 100),
      "",
      "WHY: the CE actual column is blank on all " +
        A.bySource.find((s) => s.verifiedRows === 0).rows +
        " Azure rows. The workbook's own",
      "Notes sheet says so, and says the deltas only mean anything where it exists.",
      "",
      "THE ONE REAL CHECK WE DO HAVE",
      "  " + check.name + " rows with both figures: estimate " + money(A.checkedEst) +
        ", actual " + money(A.checkedCe),
      "  the estimate is " + pct(A.understatement) + " low",
      "",
      "GCP LOOKS PERFECT AND IS NOT A CHECK. Its estimate equals its actual to the",
      "cent on every row, which means one column was copied from the other. If",
      "asked, say that plainly rather than counting it as a second confirmation.",
      "",
      "WHAT NOT TO CLAIM: the " + money((A.unverifiedEst * A.understatement) / 100) +
        " is a sensitivity, not a finding. It is what",
      "the gap would be if Azure behaves like Claude, and we have no evidence yet",
      "that it does. Offer it as the reason to go and get the data, not as a number",
      "to put in a budget.",
    ].join("\n"),
  },

  /* ================== 3 / where the money sits ======================= */
  {
    kind: "chart",
    eyebrow: "Concentration",
    accent: COLORS.cyan,
    title:
      "Two applications are half of it, " + tail.length + " more are " +
      pct((sum(tail.map((r) => r.est)) / A.total) * 100, 0),
    note: "Estimated cost per application, largest first.",
    chartTitle: "Estimated cost by application, top " + Math.min(12, A.byApp.length),
    chart: {
      type: "rank",
      color: COLORS.cyan,
      inline: {
        cats: A.byApp.slice(0, 12).map(label),
        series: A.byApp.slice(0, 12).map((r) => ({ name: label(r), vals: [r.est] })),
      },
    },
    stats: [
      {
        label: "Largest application",
        value: money(A.byApp[0].est),
        note: label(A.byApp[0]) + ", " + pct((A.byApp[0].est / A.total) * 100) + " of the bill",
        accent: COLORS.cyan,
      },
      {
        label: "Top two together",
        value: pct(A.topShare(2)),
        note: "of all estimated AI cost",
        accent: COLORS.warn,
      },
      {
        label: "The long tail",
        value: String(A.byApp.filter((r) => r.est < 500).length) + " apps",
        note: "under $500 each, " +
          pct((sum(A.byApp.filter((r) => r.est < 500).map((r) => r.est)) / A.total) * 100) +
          " of the bill between them",
        accent: COLORS.muted,
      },
    ],
    foot:
      "Concentration is the good news: " + pct(A.topShare(6), 0) + " of the bill sits in six applications, " +
      "so governing six of them governs most of the spend. The tail is noise by value but not by " +
      "count, and it is where the untagged rows hide.",
    speakerNotes: [
      "TOP APPLICATIONS",
      ...A.byApp.slice(0, 6).map(
        (r) =>
          `  ${label(r).slice(0, 30).padEnd(31)} ${money(r.est).padStart(9)}  ` +
          `${pct((r.est / A.total) * 100).padStart(6)}  ${r.verified ? "reconciled" : "estimate only"}`
      ),
      "",
      "  top 1  " + pct(A.topShare(1)),
      "  top 2  " + pct(A.topShare(2)),
      "  top 6  " + pct(A.topShare(6)),
      "",
      "THE POINT TO MAKE: this is manageable. Six applications is a list a person",
      "can own. We do not need to govern a hundred things, we need to govern six",
      "and put a floor under the rest.",
      "",
      "The largest one, " + label(A.byApp[0]) + ", is also the one we cannot reconcile.",
    ].join("\n"),
  },

  /* ==================== 4 / unit economics =========================== */
  {
    kind: "chart",
    eyebrow: "Unit cost",
    accent: COLORS.ai,
    title:
      "The same call costs $" + cheapest.perThousand.toFixed(0) +
      " or $" + dearest.perThousand.toFixed(0),
    note:
      "Cost per 1,000 invocations. Applications with at least " +
      VOL_FLOOR.toLocaleString("en-US") + " calls.",
    chartTitle: "Estimated cost per 1,000 invocations",
    chart: {
      type: "rank",
      color: COLORS.ai,
      valFmt: '"$"#,##0.00',
      inline: {
        cats: byUnitCost.map(label),
        series: byUnitCost.map((r) => ({ name: label(r), vals: [r.perThousand] })),
      },
    },
    stats: [
      {
        label: "Dearest per call",
        value: "$" + dearest.perThousand.toFixed(0),
        note: "per 1,000, " + label(dearest),
        accent: COLORS.danger,
      },
      {
        label: "Cheapest per call",
        value: "$" + cheapest.perThousand.toFixed(0),
        note: "per 1,000, " + label(cheapest),
        accent: COLORS.good,
      },
      {
        label: "Biggest application",
        value: "$" + A.byApp[0].perThousand.toFixed(0),
        note: "per 1,000, and it is the cheap end",
        accent: COLORS.cyan,
      },
    ],
    foot:
      "Volume and cost are not the same problem. " + label(A.byApp[0]) + " is the largest line in the " +
      "bill and among the cheapest per call, so the lever there is whether the calls are needed. " +
      "The expensive-per-call applications are agent workloads, where the lever is model choice.",
    speakerNotes: [
      "COST PER 1,000 INVOCATIONS, applications with at least " +
        VOL_FLOOR.toLocaleString("en-US") + " calls:",
      "",
      ...byUnitCost.map(
        (r) =>
          `  ${label(r).slice(0, 30).padEnd(31)} $${r.perThousand.toFixed(2).padStart(7)}/1K  ` +
          `${r.invocations.toLocaleString("en-US").padStart(9)} calls  ${money(r.est).padStart(9)}`
      ),
      "",
      "TWO DIFFERENT LEVERS, AND THEY GET CONFUSED CONSTANTLY:",
      "  High volume, low unit cost  ->  ask whether the calls are necessary.",
      "  Low volume, high unit cost  ->  ask which model is being called.",
      "",
      "The floor of " + VOL_FLOOR.toLocaleString("en-US") +
        " calls is deliberate. Below it the per-thousand figure is",
      "arithmetic rather than economics: a $0.05 row over five calls would top this",
      "chart and mean nothing.",
    ].join("\n"),
  },

  /* ======================== 5 / by team ============================== */
  {
    kind: "projectBars",
    eyebrow: "Ownership",
    accent: COLORS.cyan,
    title: "Which teams can answer for their AI bill",
    note: "Estimated cost by team, and how much of each has an actual figure behind it.",
    split: {
      aLabel: "reconciled",
      bLabel: "estimate only",
      aColor: VERIFIED,
      bColor: UNVERIFIED,
    },
    legend: [
      { label: "Reconciled", color: VERIFIED },
      { label: "Estimate only", color: UNVERIFIED },
    ],
    rowsTitle: "Estimated cost by team",
    stats: [
      {
        label: "Teams with spend",
        value: String(A.byTeam.length),
        note: "after folding the duplicate casing in the source",
        accent: COLORS.cyan,
      },
      {
        label: "Top three teams",
        value: pct((sum(A.byTeam.slice(0, 3).map((t) => t.est)) / A.total) * 100),
        note: A.byTeam.slice(0, 3).map((t) => t.name).join(", "),
        accent: COLORS.warn,
      },
      {
        label: "Fully unreconciled",
        value: money(sum(teamRows.filter((t) => t.a === 0).map((t) => t.total))),
        note: teamRows.filter((t) => t.a === 0).map((t) => t.name).join(" and ") +
          ", no actual figure at all",
        accent: UNVERIFIED,
      },
    ],
    items: teamRows,
    foot:
      "Team names are taken from the tag as written. The source sheet lists ai-factory twice, " +
      "once capitalised and once not, and counts it twice, which is why its team totals do not " +
      "match its provider totals. These figures fold the two together.",
    speakerNotes: [
      "BY TEAM, case-folded, reconciled against estimate-only:",
      "",
      ...teamRows.map(
        (t) =>
          `  ${t.name.padEnd(12)} ${money(t.total).padStart(9)}  reconciled ${money(t.a).padStart(9)}  ` +
          `(${Math.round((t.a / t.total) * 100)}%)  ${t.badge}`
      ),
      "",
      "SOLUGEN IS THE ONE TO NAME: " + money(A.byTeam.find((t) => t.name === "solugen").est) +
        ", entirely on Azure, entirely",
      "unreconciled, and almost all of it one application.",
      "",
      "THE SOURCE-DATA TRAP: the workbook's own team sheet lists ai-factory twice,",
      "as 'AI-Factory' and 'ai-factory', each with the full figure. Its team total",
      "comes to $56,501 against the $43,547 on the provider sheet. Every share on",
      "that tab is computed against the inflated number. If someone in the room has",
      "the spreadsheet open, they will see different percentages, and this is why.",
    ].join("\n"),
  },

  /* ==================== 6 / fix the source =========================== */
  {
    kind: "table",
    eyebrow: "Data quality",
    accent: COLORS.warn,
    title: "Four things to fix before this number is quotable",
    note: "None of these change what we spent. They change whether we can prove it.",
    tables: [
      {
        title: "What is wrong, and what it costs us",
        sub: "In the order they should be fixed",
        fontSize: 12,
        cols: [
          { label: "Issue", w: 3.3 },
          { label: "Where", w: 2.6 },
          { label: "Effect", w: 3.5 },
          { label: "At stake", w: 1.6, align: "right" },
        ],
        rows: [
          [
            { text: "No reconciliation figure", bold: true },
            "Every " + A.bySource.find((s) => s.verifiedRows === 0).name + " row",
            "Nothing to check the estimate against",
            { text: money(A.unverifiedEst), bold: true, color: UNVERIFIED },
          ],
          [
            { text: "No date range recorded", bold: true },
            "The workbook as a whole",
            "Cannot annualise, cannot trend, cannot compare",
            { text: "all of it", color: COLORS.faint },
          ],
          [
            { text: "Team listed twice", bold: true },
            "Summary_Team, ai-factory",
            "Team totals overstated by 30% against the provider sheet",
            { text: money(A.byTeam.find((t) => t.name === "ai-factory").est), bold: true, color: UNVERIFIED },
          ],
          [
            { text: "Applications with no name", bold: true },
            String(A.unnamed.length) + " rows, unknown or unlabeled",
            "Cannot be charged to anyone, even in principle",
            { text: money(A.unnamedEst), bold: true, color: UNVERIFIED },
          ],
        ],
      },
    ],
    stats: [
      {
        label: "Unreconciled",
        value: pct((A.unverifiedEst / A.total) * 100),
        note: "of the estimate has no actual behind it",
        accent: UNVERIFIED,
      },
      {
        label: "Unattributable",
        value: money(A.unnamedEst),
        note: pct((A.unnamedEst / A.total) * 100) + " of the bill has no application name",
        accent: COLORS.danger,
      },
      {
        label: "Known understatement",
        value: pct(A.understatement),
        note: "on the only rows we can actually check",
        accent: COLORS.warn,
      },
    ],
    foot:
      "The first two are the ones that matter. Without a reconciliation figure the estimate is " +
      "an assertion, and without a date range it cannot be turned into a run-rate. Both are " +
      "export settings, not engineering work.",
    speakerNotes: [
      "FOUR DEFECTS, IN PRIORITY ORDER.",
      "",
      "1. No CE actual on Azure. " + money(A.unverifiedEst) + ", " +
        pct((A.unverifiedEst / A.total) * 100) + " of the estimate, unverifiable.",
      "   This is an export setting, not a project.",
      "",
      "2. No date range. Everything here is 'the period in the file'. We cannot",
      "   annualise it or compare it to next month without knowing what it covers.",
      "",
      "3. ai-factory counted twice in Summary_Team, once per capitalisation.",
      "   Team sheet totals $56,501, provider sheet totals $43,547.",
      "",
      "4. " + A.unnamed.length + " rows named 'unknown' or '(unlabeled)', " +
        money(A.unnamedEst) + ". That is money",
      "   nobody can be charged for regardless of what the reconciliation says.",
      "",
      "TONE: none of this is anyone's fault and none of it is expensive to fix.",
      "Say it as a to-do list, not as an audit finding.",
    ].join("\n"),
  },

  /* ========================== 7 / the ask ============================ */
  {
    kind: "criteria",
    eyebrow: "The ask",
    accent: COLORS.cyan,
    title: "What would make this number trustworthy",
    note: "Four changes. None of them are engineering projects.",
    items: [
      {
        label: "Turn on the Azure actuals",
        desc: "Export the reconciliation figure with the estimate, as the other providers already do.",
        tip: "It is a column in the export, not a new system.",
      },
      {
        label: "Stamp the period on the export",
        desc: "Every extract states the date range it covers, on the sheet.",
        tip: "Without it, no figure here can become a run-rate.",
      },
      {
        label: "Fix the tag, not the spreadsheet",
        desc: "Case-fold team names at source so a team cannot appear twice.",
        tip: "Same defect that made the team total 30% too high.",
      },
      {
        label: "No unnamed applications",
        desc: "An application without a name cannot be charged back to anyone.",
        tip: money(A.unnamedEst) + " is sitting in unknown and unlabeled today.",
      },
    ],
    banner: {
      title: "Then this becomes a monthly number instead of a one-off table",
      text:
        "With actuals on every provider and a stated period, the same export answers " +
        "what we spent, who spent it, and whether the estimate is holding, every month, " +
        "without anyone rebuilding the sheet.",
    },
    speakerNotes: [
      "THE ASK, in one sentence: give the export a date and give Azure an actuals",
      "column, and this stops being a one-off table.",
      "",
      "All four are changes to how the data is produced, not to how AI is used.",
      "Nobody has to stop building anything. That is worth saying explicitly,",
      "because a cost slide in a CIO meeting is usually heard as a restriction.",
      "",
      "IF ASKED WHAT IT BUYS: a monthly per-application figure we can defend, which",
      "is the precondition for chargeback and for the quota model on the governance",
      "slides. Without it, the gateway can enforce budgets it cannot prove.",
      "",
      "IF ASKED WHAT IT COSTS: nothing to buy. Export configuration plus a tagging",
      "rule.",
    ].join("\n"),
  },
];
