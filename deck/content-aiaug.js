/**
 * AI cost, 1 to 19 August 2026. What changed against July.
 *
 * Every figure is derived in `data/ai-cost-periods.js` from the two workbooks'
 * detail sheets. Read that module's header before changing any wording here.
 *
 * THE ONE RULE THIS DECK LIVES BY: 19 days is not comparable to 31. Every
 * number that compares the two periods on these slides is a daily rate, and
 * every number that describes August on its own is a period total. Mixing them
 * is the single easiest way to be wrong in a room that cannot check you, so
 * where a slide shows both, it says which is which.
 *
 * The argument, in order:
 *
 *   1. The daily rate doubled.
 *   2. It is volume, not price.        <- the reassuring half
 *   3. Here is where it landed.
 *   4. And here is what nobody owns.   <- the finding
 *   5. Tagging got worse, not better.
 *   6. What to do before the month closes.
 */

const { COLORS } = require("./lib/theme");
const D = require("./data/ai-cost-periods");

const { money, pct, times, sum, num } = D;
const P = D.august;
const J = D.july;
const C = D.compare;

const VERIFIED = COLORS.cyan;
const UNVERIFIED = COLORS.warn;
const BASE = COLORS.azure; // the July rate, carried forward
const ADDED = COLORS.danger; // what August put on top of it

const nameCount = P.byApp.reduce((m, r) => m.set(r.app, (m.get(r.app) || 0) + 1), new Map());
// A row called "unknown" needs its provider whether or not the name is unique:
// on a slide about untagged spend, the name on its own identifies nothing.
const UNNAMED = /^(unknown|\(unlabeled\)|unlabeled)$/i;
const label = (r) =>
  nameCount.get(r.app) > 1 || UNNAMED.test(r.app) ? `${r.app} (${r.source})` : r.app;
const moveLabel = (m) => label(m);

const azure = P.bySource.find((s) => s.name === "Azure");
const check = P.checks[0];

// The unattributed Bedrock charges, which the source itself keeps outside the
// application rows. The first is actual spend with no application on it; the
// second is a separate fee line.
const untagged = P.unattributed[0];
const guardrail = P.unattributed[1];
const bedrockTagged = P.bySource.find((s) => s.name === "Claude").matchedCe;
const bedrockKnown = bedrockTagged + untagged.amount;

// Movers worth a bar: the ten largest increases in daily rate. Ranking by
// change rather than by size is the point, a big flat line is not news.
const risers = C.appMoves.filter((m) => m.change > 0.5).slice(0, 10);
const fallers = [...C.appMoves].filter((m) => m.change < -0.5).sort((a, b) => a.change - b.change);
const cli = C.appMoves.find((m) => m.key === "cli | Claude");

// Teams, as August's daily rate split into the July rate and what was added.
// Every team in the top three grew, so the split is always a base plus an
// increase. The guard is there because a team that shrank would otherwise draw
// a segment wider than its own bar.
const TEAMS = 3;
const teamRow = (t) => {
  const base = Math.min(t.julyPerDay, t.augustPerDay);
  return {
    name: t.name,
    total: t.augustPerDay,
    a: base,
    b: t.augustPerDay - base,
    badge: t.growth ? times(t.growth) + " the July rate" : "new in August",
  };
};
const teamTail = C.teamMoves.slice(TEAMS);
const tailJuly = sum(teamTail.map((t) => t.julyPerDay));
const tailAugust = sum(teamTail.map((t) => t.augustPerDay));
const teamRows = [
  ...C.teamMoves.slice(0, TEAMS).map(teamRow),
  {
    name: `${teamTail[0].name} and ${teamTail.length - 1} smaller teams`,
    total: tailAugust,
    a: Math.min(tailJuly, tailAugust),
    b: tailAugust - Math.min(tailJuly, tailAugust),
    badge: tailJuly ? times(tailAugust / tailJuly) + " the July rate" : "new in August",
  },
];

// Name sprawl: one workload spread across many near-identical rows.
const addedPerDay = P.perDay - J.perDay;
const twoBiggest = C.teamMoves.slice(0, 2);
const twoBiggestShare = sum(twoBiggest.map((t) => t.change)) / addedPerDay;

const ivr = P.rows.filter((r) => /^ivr/i.test(r.app));
const pension = P.rows.filter((r) => /jeff|pension/i.test(r.app));
const encoded = P.rows.filter((r) => /%[0-9A-F]{2}/i.test(r.app));

module.exports = [
  /* ============================== cover ============================== */
  {
    kind: "section",
    kicker: "AI cost, " + P.label,
    title: "The AI bill doubled,\nand it is not the price",
    sub:
      money(P.perDay) + " a day so far, against " + money(J.perDay) +
      " a day across " + J.label,
    accent: COLORS.danger,
    speakerNotes: [
      "Month to date, " + P.start + " to " + P.end + ", " + P.days + " days.",
      "",
      "  " + money(P.total) + " estimated so far",
      "  " + num(P.invocations) + " invocations",
      "  " + P.apps + " applications, against " + J.apps + " in July",
      "",
      "SAY THE COMPARISON PROPERLY, ONCE, AT THE TOP: this is 19 days against a",
      "31-day month. The totals are " + money(P.total) + " and " + money(J.total) + ", which looks like",
      "27% growth and is not. Per day it is " + money(P.perDay) + " against " + money(J.perDay) + ", which is",
      times(C.costGrowth) + ". Everything comparative in this deck is per day for that reason.",
      "",
      "The good news is on the second slide and it is real: almost all of the",
      "increase is more calls, not a worse price. Lead with the number, then give",
      "them that, then give them the part nobody owns.",
    ].join("\n"),
  },

  /* ==================== 1 / the daily rate =========================== */
  {
    kind: "hero",
    eyebrow: "Run rate",
    accent: COLORS.danger,
    title: "The daily rate has doubled since July",
    note:
      P.days + " days against a full month, so the comparison is per day rather than per period.",
    value: money(P.perDay),
    valueLabel:
      "a day so far in August, against " + money(J.perDay) + " a day across July",
    delta: times(C.costGrowth) + " the July rate",
    deltaColor: COLORS.danger,
    parts: C.sourceMoves.map((s) => ({
      label: s.name,
      value: money(s.augustPerDay) + "/day",
      note: s.growth ? times(s.growth) + " July" : "new in August",
      accent: s.color,
    })),
    pointsTitle: "What this does and does not mean",
    points: [
      "At this rate a full August lands near " + money(C.projected) +
        ", against " + money(J.total) + " for July.",
      "Azure and Claude both roughly doubled. GCP went the other way, down to " +
        money(C.sourceMoves.find((s) => s.name === "GCP").augustPerDay) +
        " a day, as one OCR pipeline stopped.",
      "The projection assumes the rest of the month looks like the first " + P.days +
        " days. It is a run-rate, not a forecast.",
    ],
    foot:
      "August figures are month to date, " + P.start + " to " + P.end + ". The final day of the " +
      "export may be partial, which would make the daily rate here slightly conservative.",
    speakerNotes: [
      "PER DAY, WHICH IS THE ONLY HONEST COMPARISON",
      "  July    " + money(J.perDay).padStart(7) + "/day over " + J.days + " days",
      "  August  " + money(P.perDay).padStart(7) + "/day over " + P.days + " days",
      "  " + times(C.costGrowth),
      "",
      "BY PROVIDER, PER DAY",
      ...C.sourceMoves.map(
        (s) =>
          `  ${s.name.padEnd(8)} ${money(s.julyPerDay).padStart(6)} -> ${money(s.augustPerDay).padStart(6)}  ` +
          (s.growth ? times(s.growth) : "new")
      ),
      "",
      "IF ASKED FOR A FULL-MONTH NUMBER: about " + money(C.projected) + ". Give it as a run-rate",
      "and say what it assumes. Nineteen days into a month is early, the last day",
      "in the export may be partial, and a single new workload can move it.",
      "",
      "DO NOT LET THIS LAND AS ALARM. The next slide is why it is happening, and",
      "the answer is adoption rather than waste. Getting that order wrong turns a",
      "growth story into a cost incident.",
    ].join("\n"),
  },

  /* ================= 2 / volume, not price =========================== */
  {
    kind: "bigStat",
    eyebrow: "Why",
    accent: COLORS.good,
    title: "Almost all of it is more calls, not a worse price",
    note: "Daily cost is calls per day times cost per call, so the growth splits cleanly between the two.",
    stats: [
      {
        label: "Cost per day",
        value: times(C.costGrowth),
        note: money(J.perDay) + " to " + money(P.perDay),
        accent: COLORS.danger,
      },
      {
        label: "Calls per day",
        value: times(C.volumeGrowth),
        note: num(J.callsPerDay) + " to " + num(P.callsPerDay),
        accent: COLORS.warn,
      },
      {
        label: "Price per 1,000 calls",
        value: times(C.priceGrowth, 2),
        note: "$" + J.perThousand.toFixed(2) + " to $" + P.perThousand.toFixed(2),
        accent: COLORS.good,
      },
    ],
    value: pct((C.priceGrowth - 1) * 100),
    text:
      "is all the blended price moved. The rest of the increase is volume: we are making " +
      times(C.volumeGrowth) + " the calls we made in July, at very nearly the same cost each.",
    pointsTitle: "What that changes about the response",
    points: [
      "This is an adoption curve, not a pricing problem. Renegotiating rates or switching models would " +
        "address the " + pct((C.priceGrowth - 1) * 100) + ", not the " + times(C.costGrowth) + ".",
      "The question to put to each team is whether the extra calls are worth making, which is a product " +
        "question rather than a procurement one.",
      "The blended price is flat because the mix stayed similar. Inside it, individual applications moved a " +
        "lot: " + label(P.byApp.find((r) => r.key === "agent | Claude")) + " went from $" +
        J.byApp.find((r) => r.key === "agent | Claude").perThousand.toFixed(0) + " to $" +
        P.byApp.find((r) => r.key === "agent | Claude").perThousand.toFixed(0) + " per thousand.",
    ],
    foot:
      "Growth in cost is growth in volume multiplied by growth in unit price: " +
      C.volumeGrowth.toFixed(2) + " times " + C.priceGrowth.toFixed(2) + " is " +
      C.costGrowth.toFixed(2) + ". All three are derived from the same rows, so the split closes exactly.",
    speakerNotes: [
      "THE DECOMPOSITION, AND IT IS EXACT",
      "  calls per day     " + num(J.callsPerDay) + " -> " + num(P.callsPerDay) + "   " + times(C.volumeGrowth),
      "  cost per 1,000    $" + J.perThousand.toFixed(2) + " -> $" + P.perThousand.toFixed(2) +
        "     " + times(C.priceGrowth, 2),
      "  cost per day      " + money(J.perDay) + " -> " + money(P.perDay) + "   " + times(C.costGrowth),
      "",
      "THIS IS THE REASSURING SLIDE AND IT IS HONESTLY REASSURING. We are not being",
      "charged more for the same thing. We are doing more of it.",
      "",
      "THE HONEST CAVEAT, IF SOMEONE PRESSES: a flat blended price is a mix result,",
      "not a promise that nothing moved. The agent workload on Claude doubled its",
      "cost per call. It is offset in the blend by cheaper high-volume traffic",
      "growing faster. Both facts are true and the second does not cancel the first.",
      "",
      "WHERE THIS LEADS: if the calls are worth making, the bill is fine and we",
      "budget for it. If they are not, the fix is at the application, not the",
      "contract. That is the decision this deck is asking for.",
    ].join("\n"),
  },

  /* ==================== 3 / where it landed ========================== */
  {
    kind: "projectBars",
    eyebrow: "Where",
    accent: COLORS.danger,
    title:
      twoBiggest[0].name + " and " + twoBiggest[1].name + " are " +
      pct(twoBiggestShare * 100, 0) + " of the increase",
    note: "Daily rate in August, split into the July rate and what was added on top.",
    split: {
      aLabel: "the July rate",
      bLabel: "added in August",
      aColor: BASE,
      bColor: ADDED,
    },
    legend: [
      { label: "July rate", color: BASE },
      { label: "Added in August", color: ADDED },
    ],
    rowsTitle: "Cost per day by team, August against July",
    stats: [
      {
        label: "Fastest growing team",
        value: times(C.teamMoves[1].growth),
        note: C.teamMoves[1].name + ", " + money(C.teamMoves[1].julyPerDay) + " to " +
          money(C.teamMoves[1].augustPerDay) + " a day",
        accent: ADDED,
      },
      {
        label: "Largest team",
        value: money(C.teamMoves[0].augustPerDay) + "/day",
        note: C.teamMoves[0].name + ", " + pct((P.byTeam[0].est / P.total) * 100) + " of August so far",
        accent: COLORS.warn,
      },
      {
        label: "Added per day",
        value: money(addedPerDay),
        note: "across all teams, against the July rate",
        accent: COLORS.cyan,
      },
    ],
    items: teamRows,
    foot:
      "Bars are dollars per day, not period totals, so the two months can sit on the same scale. " +
      "Team names are folded to one capitalisation, as they are throughout.",
    speakerNotes: [
      "PER DAY BY TEAM",
      ...C.teamMoves
        .filter((t) => t.augustPerDay > 0.5 || t.julyPerDay > 0.5)
        .map(
          (t) =>
            `  ${t.name.padEnd(12)} ${money(t.julyPerDay).padStart(6)} -> ${money(t.augustPerDay).padStart(6)}  ` +
            (t.growth ? times(t.growth) : "new")
        ),
      "",
      "THE SINGLE BIGGEST MOVER IS ONE APPLICATION, NOT ONE TEAM:",
      "  " + moveLabel(cli) + " went " + money(cli.julyPerDay) + " to " + money(cli.augustPerDay) +
        " a day, " + times(cli.growth) + ".",
      "  That is " + money(cli.change) + " a day of the " + money(addedPerDay) +
        " total increase, on its own.",
      "  It is developer tooling inside ai-factory, which is worth knowing before",
      "  anyone treats the growth as customer-facing demand.",
      "",
      "SOLUGEN IS FLAT IN CHARACTER: one application, high volume, cheap per call,",
      "growing steadily. It needs no intervention, it needs a budget line.",
      "",
      "IF ASKED WHY apim DISAPPEARED: its one row, bedrock-session, is not in the",
      "August export at all. Either the workload stopped or the tag moved. Worth",
      "checking, but it was " + money(J.byTeam.find((t) => t.name === "apim").est) +
        " in July, so it is not what moved the number.",
    ].join("\n"),
  },

  /* ==================== 4 / the movers =============================== */
  {
    kind: "chart",
    eyebrow: "Movers",
    accent: ADDED,
    title:
      moveLabel(cli) + " alone is " + pct((cli.change / addedPerDay) * 100, 0) +
      " of the increase",
    note: "Change in cost per day, August against July. Largest increases only.",
    chartTitle: "Increase in cost per day, by application",
    chart: {
      type: "rank",
      color: ADDED,
      inline: {
        cats: risers.map(moveLabel),
        series: risers.map((m) => ({ name: moveLabel(m), vals: [m.change] })),
      },
    },
    stats: [
      {
        label: "Biggest single mover",
        value: "+" + money(cli.change) + "/day",
        note: moveLabel(cli) + ", " + times(cli.growth) + " its July rate",
        accent: ADDED,
      },
      {
        label: "New applications",
        value: String(C.newApps.length),
        note: "not present in July at all, " +
          money(sum(C.newApps.map((m) => m.augustPerDay))) + " a day between them",
        accent: COLORS.warn,
      },
      {
        label: "Applications that stopped",
        value: String(C.goneApps.length),
        note: "gone from the export, " + money(sum(C.goneApps.map((m) => m.julyPerDay))) +
          " a day of July spend",
        accent: COLORS.good,
      },
    ],
    foot:
      "cli is the AI Factory's developer command line, so the largest single increase in the bill is " +
      "internal engineering usage. Two of the other top increases are untagged rows rather than named " +
      "applications, which is why the tagging slide follows this one.",
    speakerNotes: [
      "LARGEST INCREASES IN DAILY RATE",
      ...risers.map(
        (m) =>
          `  ${moveLabel(m).slice(0, 30).padEnd(31)} ${money(m.julyPerDay).padStart(6)} -> ` +
          `${money(m.augustPerDay).padStart(6)}  +${money(m.change).padStart(6)}/day  ` +
          (m.isNew ? "new" : times(m.growth))
      ),
      "",
      "LARGEST DECREASES",
      ...fallers
        .slice(0, 4)
        .map(
          (m) =>
            `  ${moveLabel(m).slice(0, 30).padEnd(31)} ${money(m.julyPerDay).padStart(6)} -> ` +
            `${money(m.augustPerDay).padStart(6)}  ` + (m.isGone ? "gone" : times(m.growth))
        ),
      "",
      "THE ONE TO EXPLAIN: " + moveLabel(cli) + " is the AI Factory's developer CLI. It went",
      "from " + money(cli.julyPerDay) + " to " + money(cli.augustPerDay) + " a day. That is internal engineering usage,",
      "and it is the largest single change in the bill. It is not obviously wrong,",
      "but it is the one line nobody has budgeted for, and it deserves an owner.",
      "",
      "TWO OF THE TOP FIVE INCREASES ARE UNTAGGED. That is the next slide, and it",
      "is the reason this list is less useful than it should be.",
      "",
      "WHAT ALSO CHANGED, QUIETLY: the whole idp-ocr-hybrid pipeline on GCP dropped",
      "out. If that was deliberate, good. If nobody knows, that is a finding too.",
    ].join("\n"),
  },

  /* ============= 5 / the charges that belong to nobody =============== */
  {
    kind: "splitBars",
    eyebrow: "Unattributed",
    accent: COLORS.danger,
    title: money(P.unattributedTotal) + " of real spend sits on no application at all",
    note:
      "The August export lists these separately, outside every application row and every team total.",
    bands: [
      {
        label: "Attributed to an application",
        value: bedrockTagged,
        color: VERIFIED,
        note: "Bedrock actual spend carried on named rows",
      },
      {
        label: "Attributed to nothing",
        value: untagged.amount,
        color: COLORS.danger,
        note: "Bedrock actual spend with no application on it",
      },
    ],
    rowsTitle: "August, from the top of the export to the bottom",
    items: [
      { name: "Application rows, estimated", value: P.total, color: COLORS.cyan },
      { name: "Untagged Bedrock actual", value: untagged.amount, color: COLORS.danger },
      { name: "Bedrock guardrail fees", value: guardrail.amount, color: COLORS.warn },
    ],
    callout: {
      title:
        "The month to date is " + money(P.total + P.unattributedTotal) + ", not " + money(P.total),
      text:
        "The two lines the export keeps outside the application rows add " +
        money(P.unattributedTotal) + ", which is " +
        pct((P.unattributedTotal / (P.total + P.unattributedTotal)) * 100, 0) +
        " of everything we know we spent on AI this month.",
    },
    foot:
      "July's export names no bucket like this, which is not the same as there not having been one. " +
      "Nothing here claims the charges are new; what is new is that we can see them.",
    speakerNotes: [
      "THE FINDING.",
      "",
      "  " + money(untagged.amount).padStart(8) + "  Bedrock actual spend, no application tag",
      "  " + money(guardrail.amount).padStart(8) + "  Bedrock guardrail fees, a separate charge line",
      "  " + money(P.unattributedTotal).padStart(8) + "  together",
      "",
      "SCALE IT FOR THEM: Bedrock actual we can attribute is " + money(bedrockTagged) + ". Bedrock",
      "actual we cannot is " + money(untagged.amount) + ". So " +
        pct((untagged.amount / bedrockKnown) * 100, 0) + " of our Bedrock spend has no",
      "application on it. That is not a rounding issue, it is most of a provider.",
      "",
      "WHY IT MATTERS MORE THAN THE NUMBER: every chargeback conversation, every",
      "quota, every 'which team is this' question runs off the tagged rows. A",
      "" + pct((untagged.amount / bedrockKnown) * 100, 0) + " blind spot makes all of them arguable.",
      "",
      "BE CAREFUL WHAT YOU CLAIM: July's file does not mention this bucket. That",
      "does not mean it did not exist in July. Do not say the charges are new. Say",
      "that this export shows them and the last one did not, and that we should ask",
      "for the same line on every future export.",
      "",
      "GUARDRAIL FEES ARE A SEPARATE POINT: " + money(guardrail.amount) + " for the safety layer, billed",
      "apart from inference. Small, but it is a real cost of running AI safely and",
      "it belongs in the number when anyone asks what AI costs.",
    ].join("\n"),
  },

  /* ==================== 6 / tagging got worse ======================== */
  {
    kind: "table",
    eyebrow: "Data quality",
    accent: UNVERIFIED,
    title: "Tagging went backwards this month",
    note: "None of these change what we spent. They change how much of it we can explain.",
    tables: [
      {
        title: "What changed in the data between the two exports",
        sub: "In the order it should be fixed",
        fontSize: 12,
        cols: [
          { label: "Issue", w: 3.1 },
          { label: "July", w: 2.0 },
          { label: "August", w: 2.0 },
          { label: "Why it matters", w: 3.9 },
        ],
        rows: [
          [
            { text: "Spend with no application name", bold: true },
            money(J.unnamedEst) + ", " + pct((J.unnamedEst / J.total) * 100),
            { text: money(P.unnamedEst) + ", " + pct((P.unnamedEst / P.total) * 100), bold: true, color: COLORS.danger },
            "Cannot be charged to anyone, even in principle",
          ],
          [
            { text: "Bedrock spend with no application", bold: true },
            { text: "not shown", color: COLORS.faint },
            { text: money(untagged.amount), bold: true, color: COLORS.danger },
            "Most of one provider is outside the per-team view",
          ],
          [
            { text: "One workload, many rows", bold: true },
            { text: "not present", color: COLORS.faint },
            ivr.length + " IVR rows, " + pension.length + " pension rows",
            "Versioned names mean nothing can be trended",
          ],
          [
            { text: "Rows still with no actuals", bold: true },
            money(J.unverifiedEst),
            money(P.unverifiedEst),
            "Every " + azure.name + " row, in both months",
          ],
          [
            { text: "Names mangled in the export", bold: true },
            { text: "none", color: COLORS.faint },
            encoded.length + " rows",
            "Percent-encoding left in the application name",
          ],
        ],
      },
    ],
    stats: [
      {
        label: "Unnamed spend",
        value: pct((P.unnamedEst / P.total) * 100),
        note: "of August, against " + pct((J.unnamedEst / J.total) * 100) + " in July",
        accent: COLORS.danger,
      },
      {
        label: "Unexplained in total",
        value: money(P.unnamedEst + untagged.amount),
        note: "unnamed rows plus untagged Bedrock",
        accent: UNVERIFIED,
      },
      {
        label: "Estimate now within",
        value: pct(Math.abs(P.understatement)),
        note: "on " + check.name + " rows, from " + pct(J.understatement) + " out in July",
        accent: COLORS.good,
      },
    ],
    foot:
      "One thing did get better. In July the estimate ran " + pct(J.understatement) + " under the actual on the " +
      "rows that carry both; in August it is within " + pct(Math.abs(P.understatement)) + ". The estimator is now " +
      "accurate on the traffic it can see, which is exactly why the traffic it cannot see matters more.",
    speakerNotes: [
      "THE HEADLINE HERE IS THE FIRST ROW. Spend with no application name went from",
      money(J.unnamedEst) + " to " + money(P.unnamedEst) + ", " + pct((J.unnamedEst / J.total) * 100) +
        " of the month to " + pct((P.unnamedEst / P.total) * 100) + ".",
      "",
      "AND WE CAN PROBABLY SAY WHERE IT WENT. July's largest application was",
      "agent on Claude, " + money(J.byApp[0].est) + " over " + num(J.byApp[0].invocations) + " calls. In August",
      "agent is smaller and a new row called 'unknown' appears on the same team,",
      "same provider, " + money(P.byApp.find((r) => r.key === "unknown | Claude").est) + " over " +
        num(P.byApp.find((r) => r.key === "unknown | Claude").invocations) + " calls. That is very",
      "likely the same workload having lost its label. Say 'likely', not 'is'.",
      "",
      "NAME SPRAWL: " + ivr.length + " rows beginning IVR, " + pension.length + " for the pension copilot,",
      "differing by version and by 'copy' and by date. Each is a different row in",
      "every report, so nothing can be trended and no budget can be set.",
      "",
      "THE GOOD NEWS, AND MEAN IT: the estimator is now accurate. July was " +
        pct(J.understatement) + " low",
      "on the rows we can check, August is within " + pct(Math.abs(P.understatement)) +
        ". Whoever fixed that should hear so.",
      "",
      "TONE: none of this is anyone's fault and none of it is expensive to fix.",
      "A to-do list, not an audit finding.",
    ].join("\n"),
  },

  /* ========================== 7 / the ask ============================ */
  {
    kind: "criteria",
    eyebrow: "The ask",
    accent: COLORS.cyan,
    title: "Four things before the month closes",
    note: "Three are export settings. The fourth is a decision, and it is the only one that needs you.",
    items: [
      {
        label: "Put an application on every Bedrock charge",
        desc:
          "Tag the untagged actual so the largest single unexplained line in the bill lands on a team.",
        tip: money(untagged.amount) + " this month, " +
          pct((untagged.amount / bedrockKnown) * 100, 0) + " of our Bedrock spend.",
      },
      {
        label: "Recover the label on the agent traffic",
        desc:
          "The row now reporting as unknown is almost certainly one named application that lost its tag.",
        tip: money(P.unnamedEst) + " of August has no application name, against " +
          money(J.unnamedEst) + " in July.",
      },
      {
        label: "One name per workload, not one per version",
        desc:
          "Stable application names, with the version somewhere that is not the name.",
        tip: ivr.length + " rows for what is one IVR service, " + pension.length + " for one copilot.",
      },
      {
        label: "Decide whether the extra calls are worth making",
        desc:
          "The growth is real usage at a steady price, so the only question left is a product one.",
        tip: "Cost is " + times(C.costGrowth) + " on " + times(C.volumeGrowth) + " the volume. Nothing to renegotiate.",
      },
    ],
    banner: {
      title:
        "August lands near " + money(C.projected) + ", with about " +
        money((P.unattributedTotal / P.days) * 31) + " of it unowned",
      text:
        "The first three fix that. The fourth decides whether " + money(C.projected) +
        " a month is the right number to be spending, which is the only part of this " +
        "that is not an export setting.",
    },
    speakerNotes: [
      "THE ASK IN ONE SENTENCE: tag the Bedrock spend, recover the lost label, and",
      "tell us whether the new volume is worth having.",
      "",
      "THE FIRST THREE ARE FREE. They are how the data is produced, not how AI is",
      "used. Nobody has to stop building anything, and it is worth saying that out",
      "loud, because a cost slide in a CIO meeting is usually heard as a restriction.",
      "",
      "THE FOURTH IS THE ONLY REAL DECISION IN THE DECK. The bill doubled because",
      "usage doubled at a flat price. There is no procurement fix for that and no",
      "waste to cut. Either the calls are worth making, in which case we budget",
      "for " + money(C.projected) + " a month and move on, or some of them are not, in which case",
      "the fix is at the application and the owners are the four teams on slide four.",
      "",
      "IF YOU ARE ASKED FOR ONE NUMBER TO REMEMBER: " + money(P.perDay) + " a day, doubling",
      "since July, and " + pct((P.unattributedTotal / (P.total + P.unattributedTotal)) * 100, 0) +
        " of it currently belongs to nobody.",
      "",
      "CLOSE ON THE POSITIVE, BECAUSE IT IS TRUE: the estimate is now accurate, the",
      "growth is adoption rather than waste, and the fixes are configuration.",
    ].join("\n"),
  },
];
