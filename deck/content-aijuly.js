/**
 * AI cost, July 2026. The baseline month.
 *
 * Every figure is derived in `data/ai-cost-periods.js` from the July workbook's
 * detail sheet. Read that module's header before changing any wording here.
 *
 * This is the first of a pair. July is a complete month and is presented on its
 * own terms, as the reference the August deck measures against, so it does not
 * mention August anywhere: a baseline that keeps pointing forward stops being a
 * baseline. The order is the order a CIO asks in.
 *
 *   1. How much, and to whom?
 *   2. Who owns it?
 *   3. Can I trust the number?      <- the finding
 *   4. What is it buying per call?
 *   5. What do I do about it?
 */

const { COLORS } = require("./lib/theme");
const D = require("./data/ai-cost-periods");

const { money, pct, sum, num } = D;
const P = D.july;

// Reconciled and unreconciled get their own pair, kept clear of the provider
// accents: an application is not "Azure-coloured" and "unreconciled-coloured"
// at the same time on any one chart.
const VERIFIED = COLORS.cyan;
const UNVERIFIED = COLORS.warn;

/** Disambiguate only where a name genuinely appears under two providers. */
const nameCount = P.byApp.reduce((m, r) => m.set(r.app, (m.get(r.app) || 0) + 1), new Map());
const label = (r) => (nameCount.get(r.app) > 1 ? `${r.app} (${r.source})` : r.app);

const top2 = P.byApp.slice(0, 2);
const azure = P.bySource.find((s) => s.name === "Azure");
const claude = P.bySource.find((s) => s.name === "Claude");
const gcp = P.bySource.find((s) => s.name === "GCP");
const check = P.checks[0];
const mirror = P.mirrored[0];

// Unit cost only means something with enough calls behind it: a $0.05 row over
// five invocations gives a per-thousand figure that is arithmetic, not
// economics. 5,000 keeps the nine applications carrying 95% of the month.
const VOL_FLOOR = 5000;
const byUnitCost = P.byApp
  .filter((r) => r.invocations >= VOL_FLOOR)
  .sort((a, b) => b.perThousand - a.perThousand);
const dearest = byUnitCost[0];
const cheapest = byUnitCost[byUnitCost.length - 1];

// Three teams are 96% of the month and every other one is under $500, so the
// tail is rolled into a single row: four bars too short to see would cost the
// three that matter most of their height.
const TEAMS = 3;
const teamRow = (t) => ({
  name: t.name,
  total: t.est,
  a: t.verifiedEst,
  b: t.est - t.verifiedEst,
  badge: `${t.apps} application${t.apps === 1 ? "" : "s"}`,
});
const teamTail = P.byTeam.slice(TEAMS);
const teamRows = [
  ...P.byTeam.slice(0, TEAMS).map(teamRow),
  {
    name: `${teamTail.length} smaller teams`,
    total: sum(teamTail.map((t) => t.est)),
    a: sum(teamTail.map((t) => t.verifiedEst)),
    b: sum(teamTail.map((t) => t.est - t.verifiedEst)),
    badge: `${sum(teamTail.map((t) => t.apps))} applications`,
  },
];

const sensitivity = (P.unverifiedEst * P.understatement) / 100;

module.exports = [
  /* ============================== cover ============================== */
  {
    kind: "section",
    kicker: "AI cost, " + P.label,
    title: "A full month of AI spend,\napplication by application",
    sub:
      money(P.total) + " across " + P.apps + " applications and " +
      num(P.invocations) + " calls, " + P.days + " days",
    accent: COLORS.cyan,
    speakerNotes: [
      "This is the July cut, one row per application per provider, from the AI",
      "cost export. It sits alongside the provider view in the main deck rather",
      "than replacing it: that one answers what we pay Azure, AWS and GCP, this",
      "one answers which application spent it and whether the figure holds up.",
      "",
      "  " + money(P.total) + " estimated",
      "  " + num(P.invocations) + " invocations",
      "  " + P.apps + " applications",
      "  " + P.days + " days, a complete month",
      "",
      "TREAT THIS AS THE BASELINE. It is the last full month we have, and every",
      "question about whether August is normal gets answered against it.",
    ].join("\n"),
  },

  /* ========================= 1 / the total =========================== */
  {
    kind: "hero",
    eyebrow: "The month",
    accent: COLORS.cyan,
    title: "Three providers, near enough two halves",
    note: "Estimated cost per application for " + P.label + ", as exported.",
    value: money(P.total),
    valueLabel:
      "estimated AI cost across " + P.apps + " applications and " +
      num(P.invocations) + " invocations",
    delta: money(P.perDay) + " a day across the month",
    deltaColor: COLORS.cyan,
    parts: P.bySource.map((s) => ({
      label: s.name,
      value: money(s.est),
      note: pct((s.est / P.total) * 100) + " of the month",
      accent: s.color,
    })),
    pointsTitle: "What the shape of this tells you",
    points: [
      "Azure and Claude are within " + money(Math.abs(azure.est - claude.est)) +
        " of each other, on completely different volumes: " + num(azure.invocations) +
        " calls against " + num(claude.invocations) + ".",
      "That volume gap is the whole unit-cost story. Azure runs high-volume, low-value calls, Claude runs agent traffic that is expensive per call.",
      "GCP is small and single-purpose, " + gcp.rows + " rows and almost all of it document OCR.",
    ],
    foot:
      P.days + " days, " + P.start + " to " + P.end + ", " + P.dated + ". " +
      "Figures are the estimate column; the reconciliation column is dealt with three slides on.",
    speakerNotes: [
      "BY PROVIDER",
      ...P.bySource.map(
        (s) =>
          `  ${s.name.padEnd(8)} ${money(s.est).padStart(8)}  ${pct((s.est / P.total) * 100).padStart(6)}  ` +
          `${num(s.invocations).padStart(9)} calls  ${s.rows} rows`
      ),
      "",
      "  daily rate  " + money(P.perDay),
      "  per 1,000 calls  $" + P.perThousand.toFixed(2),
      "",
      "THE CONTRAST WORTH DRAWING: Azure and Claude cost the same to within " +
        money(Math.abs(azure.est - claude.est)) + ",",
      "but Azure does it over " + (azure.invocations / claude.invocations).toFixed(1) +
        "x the calls. Nobody in the room will guess that,",
      "and it is the reason the unit-cost slide exists.",
      "",
      "Do not let the room anchor on the total. Two applications are most of it,",
      "and half of it cannot be checked. Both are coming.",
    ].join("\n"),
  },

  /* ==================== 2 / where it concentrates ==================== */
  {
    kind: "chart",
    eyebrow: "Concentration",
    accent: COLORS.cyan,
    title:
      "Two applications are " + pct(P.topShare(2), 0) + " of the month",
    note: "Estimated cost by application, largest first.",
    chartTitle: "Estimated cost by application, top " + Math.min(12, P.byApp.length),
    chart: {
      type: "rank",
      color: COLORS.cyan,
      inline: {
        cats: P.byApp.slice(0, 12).map(label),
        series: P.byApp.slice(0, 12).map((r) => ({ name: label(r), vals: [r.est] })),
      },
    },
    stats: [
      {
        label: "Largest application",
        value: money(P.byApp[0].est),
        note: label(P.byApp[0]) + ", " + pct((P.byApp[0].est / P.total) * 100) + " of the month",
        accent: COLORS.cyan,
      },
      {
        label: "Top six together",
        value: pct(P.topShare(6)),
        note: "of all estimated AI cost",
        accent: COLORS.warn,
      },
      {
        label: "The long tail",
        value: P.byApp.filter((r) => r.est < 500).length + " apps",
        note: "under $500 each, " +
          pct((sum(P.byApp.filter((r) => r.est < 500).map((r) => r.est)) / P.total) * 100) +
          " between them",
        accent: COLORS.muted,
      },
    ],
    foot:
      "Concentration is the good news. " + pct(P.topShare(6), 0) + " of the bill sits in six applications, " +
      "so governing six of them governs the month. The tail is noise by value but not by count, and it " +
      "is where the untagged rows hide.",
    speakerNotes: [
      "TOP APPLICATIONS, " + P.label,
      ...P.byApp.slice(0, 6).map(
        (r) =>
          `  ${label(r).slice(0, 30).padEnd(31)} ${money(r.est).padStart(8)}  ` +
          `${pct((r.est / P.total) * 100).padStart(6)}  ${r.hasCe ? "reconciled" : "estimate only"}`
      ),
      "",
      "  top 1  " + pct(P.topShare(1)),
      "  top 2  " + pct(P.topShare(2)),
      "  top 6  " + pct(P.topShare(6)),
      "",
      "THE POINT: this is a manageable list. Six applications is something a person",
      "can own. We do not need to govern a hundred things.",
      "",
      "The two at the top are different animals. " + label(top2[0]) + " is agent traffic,",
      "expensive per call, on Claude. " + label(top2[1]) + " is high-volume and cheap per",
      "call, on Azure. The same percentage of the bill, nothing else in common.",
    ].join("\n"),
  },

  /* ======================== 3 / ownership ============================ */
  {
    kind: "projectBars",
    eyebrow: "Ownership",
    accent: COLORS.cyan,
    title: "Three teams are the whole month",
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
    rowsTitle: "Estimated cost by team, " + P.label,
    stats: [
      {
        label: "Teams with spend",
        value: String(P.byTeam.length),
        note: "after folding the duplicate capitalisation",
        accent: COLORS.cyan,
      },
      {
        label: "Top three teams",
        value: pct((sum(P.byTeam.slice(0, 3).map((t) => t.est)) / P.total) * 100),
        note: P.byTeam.slice(0, 3).map((t) => t.name).join(", "),
        accent: COLORS.warn,
      },
      {
        label: "Applications per team",
        value: P.byTeam[2].apps + " vs " + P.byTeam[0].apps,
        note: "application rows, " + P.byTeam[2].name + " against " + P.byTeam[0].name,
        accent: COLORS.muted,
      },
    ],
    items: teamRows,
    foot:
      "Team names are the tag as written. The source sheet lists ai-factory under two capitalisations " +
      "and counts it twice, which is why its own team tab does not tie to its provider tab. These " +
      "figures fold the two together.",
    speakerNotes: [
      "BY TEAM, case-folded, reconciled against estimate-only:",
      "",
      ...teamRows.map(
        (t) =>
          `  ${t.name.padEnd(16)} ${money(t.total).padStart(8)}  reconciled ${money(t.a).padStart(8)}  ` +
          `(${Math.round((t.a / t.total) * 100)}%)  ${t.badge}`
      ),
      "",
      "SOLUGEN IS THE ONE TO NAME: " + money(P.byTeam.find((t) => t.name === "solugen").est) +
        ", entirely on Azure, entirely",
      "unreconciled, and almost all of it a single application.",
      "",
      "THE SHAPE CONTRAST: ai-factory has " + P.byTeam.find((t) => t.name === "ai-factory").apps +
        " application rows for " +
        money(P.byTeam.find((t) => t.name === "ai-factory").est) + ",",
      "insait has " + P.byTeam.find((t) => t.name === "insait").apps + " for " +
        money(P.byTeam.find((t) => t.name === "insait").est) +
        ". One is a platform team running many small things,",
      "the other is a product team running a few large ones. They need different",
      "controls, and a single policy applied to both will annoy one and miss the other.",
    ].join("\n"),
  },

  /* ==================== 4 / can we trust it ========================== */
  {
    kind: "splitBars",
    eyebrow: "Confidence",
    accent: UNVERIFIED,
    title: "Just under half the month has nothing to check it against",
    note:
      "The reconciliation column is blank on all " + azure.rows + " " + azure.name + " rows.",
    bands: [
      {
        label: "Reconciled",
        value: P.verifiedEst,
        color: VERIFIED,
        note: "an actual figure exists to compare against",
      },
      {
        label: "Estimate only",
        value: P.unverifiedEst,
        color: UNVERIFIED,
        note: "no actual figure in the source at all",
      },
    ],
    rowsTitle: "The largest applications, and whether each one can be checked",
    items: P.byApp.slice(0, 6).map((r) => ({
      name: label(r),
      value: r.est,
      color: r.hasCe ? VERIFIED : UNVERIFIED,
    })),
    callout: {
      title:
        "Where the estimate can be checked, it is running " + pct(P.understatement) + " low",
      text:
        check.name + " rows carrying both figures: estimate " + money(P.checkedEst) + ", actual " +
        money(P.checkedCe) + ". On the unreconciled half that gap would be about " +
        money(sensitivity) + ".",
    },
    foot:
      mirror.name + " is not a second data point: its estimate equals its actual to the cent on all " +
      mirror.verifiedRows + " rows, so those two columns are one number rather than two measurements. " +
      check.name + " is the only genuine check in the export.",
    speakerNotes: [
      "THE SLIDE THAT MATTERS.",
      "",
      "  Reconciled     " + money(P.verifiedEst).padStart(8) + "  " + pct((P.verifiedEst / P.total) * 100),
      "  Estimate only  " + money(P.unverifiedEst).padStart(8) + "  " + pct((P.unverifiedEst / P.total) * 100),
      "",
      "WHY: the CE actual column is blank on all " + azure.rows + " Azure rows. The export's own",
      "notes say so, and say the deltas only mean anything where it exists.",
      "",
      "THE ONE REAL CHECK WE HAVE",
      "  " + check.name + " rows with both figures: estimate " + money(P.checkedEst) +
        ", actual " + money(P.checkedCe),
      "  the estimate is " + pct(P.understatement) + " low",
      "",
      "GCP LOOKS PERFECT AND IS NOT A CHECK. Estimate equals actual to the cent on",
      "every row, which means one column was copied from the other. Say that plainly",
      "if asked, rather than counting it as confirmation.",
      "",
      "WHAT NOT TO CLAIM: the " + money(sensitivity) + " is a sensitivity, not a finding. It is what",
      "the gap would be if Azure behaves like Claude, and there is no evidence yet",
      "that it does. Offer it as the reason to go and get the data, not as a number",
      "for a budget.",
    ].join("\n"),
  },

  /* ==================== 5 / unit economics =========================== */
  {
    kind: "chart",
    eyebrow: "Unit cost",
    accent: COLORS.ai,
    title:
      "The same call costs $" + cheapest.perThousand.toFixed(0) + " or $" +
      dearest.perThousand.toFixed(0) + " per thousand",
    note:
      "Cost per 1,000 invocations, applications with at least " +
      num(VOL_FLOOR) + " calls in the month.",
    chartTitle: "Estimated cost per 1,000 invocations",
    chart: {
      type: "rank",
      color: COLORS.ai,
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
        label: "Month average",
        value: "$" + P.perThousand.toFixed(0),
        note: "per 1,000 across every call we made",
        accent: COLORS.cyan,
      },
    ],
    foot:
      "Volume and price are not the same problem. " + label(P.byApp[1]) + " is the second largest line " +
      "in the month and among the cheapest per call, so the lever there is whether the calls are needed. " +
      "The expensive rows are agent and OCR workloads, where the lever is model choice.",
    speakerNotes: [
      "COST PER 1,000 INVOCATIONS, applications with at least " + num(VOL_FLOOR) + " calls.",
      "These nine carry " +
        pct((sum(byUnitCost.map((r) => r.est)) / P.total) * 100, 0) + " of the month.",
      "",
      ...byUnitCost.map(
        (r) =>
          `  ${label(r).slice(0, 30).padEnd(31)} $${r.perThousand.toFixed(2).padStart(7)}/1K  ` +
          `${num(r.invocations).padStart(8)} calls  ${money(r.est).padStart(8)}`
      ),
      "",
      "TWO DIFFERENT LEVERS, CONSTANTLY CONFUSED:",
      "  High volume, low unit cost  ->  ask whether the calls are necessary.",
      "  Low volume, high unit cost  ->  ask which model is being called.",
      "",
      "The floor of " + num(VOL_FLOOR) + " calls is deliberate. Below it the per-thousand figure",
      "is arithmetic rather than economics: a five-cent row over five calls would",
      "top this chart and mean nothing.",
    ].join("\n"),
  },

  /* ==================== 6 / what July asks for ======================= */
  {
    kind: "criteria",
    eyebrow: "The ask",
    accent: COLORS.cyan,
    title: "What would make " + P.label + " a number we can defend",
    note: "Four changes to how the data is produced. None of them are engineering projects.",
    items: [
      {
        label: "Turn on the Azure actuals",
        desc:
          "Export the reconciliation figure alongside the estimate, as the other two providers already do.",
        tip: money(P.unverifiedEst) + " of the month currently has nothing behind it.",
      },
      {
        label: "Keep the period on the sheet",
        desc: "Every extract states the range it covers, so two of them can be compared without counting days.",
        tip: "A 19-day export next to a 31-day one is not a comparison until you divide.",
      },
      {
        label: "One capitalisation per team",
        desc: "Fold team names at source so a team cannot appear as two rows and be counted twice.",
        tip: "This is what makes the team tab disagree with the provider tab.",
      },
      {
        label: "No application without a name",
        desc: "A call tagged unknown or unlabeled cannot be charged to anyone, even in principle.",
        tip: money(P.unnamedEst) + " in July, " + pct((P.unnamedEst / P.total) * 100) + ". Small now, and worth keeping that way.",
      },
    ],
    banner: {
      title: "Then the same export answers the same questions every month",
      text:
        "With an actuals column on every provider and a stated period, the export tells us what we " +
        "spent, who spent it, and whether the estimate is holding, without anyone rebuilding the sheet.",
    },
    speakerNotes: [
      "THE ASK IN ONE SENTENCE: give Azure an actuals column and keep the period on",
      "the sheet, and this stops being a one-off table.",
      "",
      "All four are changes to how the data is produced, not to how AI is used.",
      "Nobody has to stop building anything. Say that explicitly, because a cost",
      "slide in a CIO meeting is usually heard as a restriction.",
      "",
      "WHAT IT BUYS: a monthly per-application figure we can defend, which is the",
      "precondition for chargeback and for any quota model at the gateway. Without",
      "it the gateway can enforce budgets it cannot prove.",
      "",
      "WHAT IT COSTS: nothing to buy. Export configuration plus a tagging rule.",
      "",
      "CLOSE ON: July is the baseline. The next deck is what happened to it.",
    ].join("\n"),
  },
];
