/**
 * AI cost by team and application, 1 July to 19 August 2026.
 *
 * Every figure is derived in `data/ai-cost-window.js` from the AI cost dataset
 * workbook. Read that module's header before changing any wording here.
 *
 * WHAT THIS DECK IS FOR
 *
 * The two CIO slides answer "how much, and who owns it". This one is the level
 * underneath: the actual application names, the team each belongs to, and how
 * each one's money divides between Claude, Azure OpenAI and GCP. It is the
 * document somebody opens when they want to argue with a number.
 *
 * The order is deliberate. The top ten come first because ten names are 97% of
 * the bill, then the rows with no name at all, then one page per team so every
 * application in the file is accounted for somewhere.
 *
 * THE UNNAMED ROWS GET THEIR OWN SLIDE, EARLY
 *
 * Two of the ten largest applications are called `unknown` and `(unlabeled)`.
 * Putting them in a ranked chart and moving on would let the room read them as
 * applications. They are not: they are the absence of an application name on
 * $5,487 of spend, next to $30,125 that never reached an application row at
 * all. That slide is the point of the deck, not an appendix to it.
 */

const { COLORS } = require("./lib/theme");
const W = require("./data/ai-cost-window");

const { money, pct, num, sum, times } = W;

// The provider accents, used identically on every chart here so a colour means
// the same thing on slide 2 as it does on slide 7.
const PROVIDER_COLOR = W.PROVIDERS.map((p) => W.SOURCE_COLOR[p]);

const UNNAMED_ACCENT = COLORS.danger;

/** Bars for one rolled-up application list, largest at the top. */
function bars(items) {
  // PowerPoint draws the first category at the bottom of a horizontal bar
  // chart, so the list is reversed on the way in.
  const ordered = [...items].reverse();
  // Label a segment only where there is room to read the number. A seven
  // character figure needs about 0.62" and the plot area is about 6.5" wide, so
  // a segment under a tenth of the largest bar cannot hold its own label and
  // gets none. Deriving the floor from the data rather than fixing it means the
  // same rule works on a chart topping out at $14,000 and one topping out at
  // $300, and no label is ever printed half in and half out of its bar.
  const max = Math.max(...items.map((a) => a.total));
  const floor = Math.max(1, Math.round((max * 0.1) / 10) * 10);
  return {
    type: "rankStack",
    colors: PROVIDER_COLOR,
    // Zero written as "$0K" reads like a rounding artefact, so it is special
    // cased out of the thousands format.
    valFmt: max >= 8000 ? '[=0]"$0";"$"#,##0,"K"' : '"$"#,##0',
    dataLabels: `[<${floor}]"";"$"#,##0`,
    inline: {
      cats: ordered.map((a) => a.app),
      series: W.PROVIDERS.map((p) => ({
        name: p === "Claude" ? "Claude" : p === "Azure" ? "Azure OpenAI" : "GCP",
        vals: ordered.map((a) => a[p] || 0),
      })),
    },
  };
}

/**
 * The applications worth a bar for one team, with the rest gathered.
 *
 * Everything that cost anything at all gets a bar, up to ten; the rows that
 * were billed nothing are rolled into one line rather than drawn as ten bars
 * of zero width. Keeping that rolled line on the chart, rather than dropping
 * it, is what stops the slide implying a team has four applications when it
 * has thirty.
 */
function teamBars(teamName, max = 10) {
  const all = W.appsFor(teamName);
  const head = all.filter((a) => a.total >= 0.005).slice(0, max);
  const tail = all.filter((a) => !head.includes(a));
  if (!tail.length) return { head, tail, items: head };
  const rolled = {
    app: `${tail.length} smaller applications`,
    total: sum(tail.map((a) => a.total)),
    invocations: sum(tail.map((a) => a.invocations)),
    unnamed: false,
    ...Object.fromEntries(W.PROVIDERS.map((p) => [p, sum(tail.map((a) => a[p] || 0))])),
  };
  return { head, tail, items: [...head, rolled] };
}

/** One team page: bars on the left, the team's own numbers on the right. */
function teamSlide(teamName, opts = {}) {
  const t = W.teams.find((x) => x.name === teamName);
  const { items, tail } = teamBars(teamName, opts.max);
  const all = W.appsFor(teamName);
  const unnamedHere = all.filter((a) => a.unnamed);
  const unnamedCost = sum(unnamedHere.map((a) => a.total));
  const lead = all[0];

  return {
    kind: "chart",
    eyebrow: "Team / " + teamName,
    accent: opts.accent || COLORS.cyan,
    title: opts.title,
    note:
      money(t.best) + " across " + all.length + " applications and " +
      num(t.invocations) + " calls, " + W.label + ".",
    chartTitle: "Cost by application, split by provider",
    chart: bars(items),
    stats: [
      {
        label: "Team total",
        value: money(t.best),
        note: pct((t.best / W.attributed) * 100) + " of all attributed AI spend",
        accent: opts.accent || COLORS.cyan,
      },
      {
        label: "Cost per 1,000 calls",
        value: "$" + t.perThousand.toFixed(0),
        note: num(t.invocations) + " calls in the window",
        accent: COLORS.muted,
      },
      unnamedCost > 0
        ? {
            label: "Unnamed here",
            value: money(unnamedCost),
            note:
              (unnamedCost / t.best < 0.001
                ? "under 0.1%"
                : pct((unnamedCost / t.best) * 100)) +
              " of this team, on " + unnamedHere.length +
              " row" + (unnamedHere.length === 1 ? "" : "s"),
            accent: UNNAMED_ACCENT,
          }
        : {
            label: "Largest application",
            value: money(lead.total),
            note: lead.app + ", " + pct((lead.total / t.best) * 100) + " of the team",
            accent: COLORS.warn,
          },
    ],
    foot: opts.foot,
    speakerNotes: opts.speakerNotes,
  };
}

const top10 = W.appRollup.slice(0, 10);
const top10Total = sum(top10.map((a) => a.total));
const insait = W.teams.find((t) => t.name === "insait");
const aiFactory = W.teams.find((t) => t.name === "ai-factory");
const solugen = W.teams.find((t) => t.name === "solugen");

// Everything outside the three teams that carry the deck, for one closing page.
const BIG = new Set(["insait", "ai-factory", "solugen"]);
const smallTeams = W.teams.filter((t) => !BIG.has(t.name) && t.invocations > 0);

module.exports = [
  /* ============================== cover ============================== */
  {
    kind: "section",
    kicker: "AI cost by team and application",
    title: "Every application,\nand who is paying for it",
    sub:
      money(W.attributed) + " attributed across " + W.appRollup.length +
      " applications and " + W.teams.filter((t) => t.best > 0).length + " teams, " + W.label,
    accent: COLORS.cyan,
    speakerNotes: [
      "This is the detail behind the two CIO slides. Same window, same source,",
      "same figures, one level down.",
      "",
      "  " + money(W.attributed) + " attributed to a team",
      "  " + W.appRollup.length + " distinct application names across " + W.apps.length + " rows",
      "  " + num(W.invocations) + " calls, " + W.days + " days",
      "",
      "HOW TO USE IT: the top ten and the unnamed rows are the two slides worth",
      "presenting. The team pages after them are there so that every application",
      "in the file is accounted for and anyone who wants to argue with a number",
      "can find it.",
      "",
      "COLOUR IS CONSISTENT THROUGHOUT: Claude orange, Azure OpenAI blue, GCP",
      "green. Same as the rest of the FinOps decks.",
      "",
      "ONE THING TO SAY OUT LOUD EARLY: the figures are Cost Explorer actuals",
      "where they exist and the token estimate where they do not. Azure has no",
      "actuals column at all, so every Azure bar here is an estimate.",
    ].join("\n"),
  },

  /* ==================== 1 / the top ten ============================== */
  {
    kind: "chart",
    eyebrow: "The whole estate",
    accent: COLORS.cyan,
    title: "Ten names are " + pct((top10Total / W.appsBest) * 100, 0) + " of the AI bill",
    note:
      W.appRollup.length + " application names in the file. The other " +
      (W.appRollup.length - 10) + " carry " + money(W.appsBest - top10Total) + " between them.",
    chartTitle: "Cost by application, split by provider",
    chart: bars(top10),
    stats: [
      {
        label: "Largest application",
        value: money(top10[0].total),
        note: top10[0].app + ", " + top10[0].teams.join(" and ") + ", " +
          pct((top10[0].total / W.appsBest) * 100) + " of the bill",
        accent: COLORS.cyan,
      },
      {
        label: "In the top ten",
        value: "2 of 10",
        note: "are not application names: unknown and (unlabeled)",
        accent: UNNAMED_ACCENT,
      },
      {
        label: "The long tail",
        value: String(W.apps.filter((r) => r.best < 1).length) + " rows",
        note: "under $1 each, out of " + W.apps.length + " rows in the file",
        accent: COLORS.muted,
      },
    ],
    foot:
      "One bar per application name, rolled up across every team and provider it appears in. " +
      top10[0].app + " runs on both Claude and Azure OpenAI, which is why its bar has two colours. " +
      "Figures are Cost Explorer actuals where they exist and the token estimate where they do not.",
    speakerNotes: [
      "TOP TEN APPLICATIONS, " + W.label,
      ...top10.map(
        (a, i) =>
          `  ${String(i + 1).padStart(2)} ${a.app.slice(0, 26).padEnd(27)} ${money(a.total).padStart(8)}  ` +
          `${pct((a.total / W.appsBest) * 100).padStart(6)}  ${num(a.invocations).padStart(9)} calls  ` +
          `${a.teams.join(",")}`
      ),
      "",
      "  top 10 together  " + money(top10Total) + ", " + pct((top10Total / W.appsBest) * 100),
      "",
      "THE GOOD NEWS FIRST: ten names. Not a hundred. A list this short can have",
      "an owner each and a budget each, and that is a week of work rather than a",
      "programme.",
      "",
      "NOW THE PART TO STOP ON: numbers five and six are called 'unknown' and",
      "'(unlabeled)'. They are " + money(top10[4].total + top10[5].total) + " between them and they are not",
      "applications, they are the absence of a name. The next slide is entirely",
      "about that, and it is the one to spend time on.",
      "",
      "IF ASKED WHY agent HAS TWO COLOURS: the same application is served by both",
      "Claude and Azure OpenAI, " + money(top10[0].Claude) + " and " + money(top10[0].Azure) + ".",
      "That is worth knowing on its own, because the two are priced very",
      "differently for what looks like the same work.",
    ].join("\n"),
  },

  /* ============== 2 / everything with no name ======================== */
  {
    kind: "table",
    eyebrow: "No application name",
    accent: UNNAMED_ACCENT,
    title: "Every row in the file that cannot be charged to anyone",
    note:
      "All " + W.unnamedRows.length + " of them, in full. Nothing here is aggregated away.",
    tables: [
      {
        title: "Rows named unknown or (unlabeled), as they appear in the report",
        fontSize: 12,
        // Narrow enough to leave a rail for the stat tiles, so the table keeps
        // the full height of the slide and every row stays visible.
        cols: [
          { label: "Application name", w: 2.1 },
          { label: "Provider", w: 1.5 },
          { label: "Team", w: 1.6 },
          { label: "Cost", w: 1.3, align: "right" },
          { label: "Calls", w: 1.3, align: "right" },
          { label: "Per 1,000", w: 1.2, align: "right" },
        ],
        rows: [
          ...W.unnamedRows.map((r) => [
            { text: r.app, bold: true, color: UNNAMED_ACCENT },
            r.source === "Azure" ? "Azure OpenAI" : r.source,
            r.team.toLowerCase(),
            { text: r.best >= 0.005 ? money(r.best) : "under $0.01", bold: r.best >= 1 },
            num(r.invocations),
            r.invocations && r.best >= 0.005
              ? "$" + ((r.best / r.invocations) * 1000).toFixed(0)
              : { text: "-", color: COLORS.faint },
          ]),
          [
            { text: "Total", bold: true },
            "",
            "",
            { text: money(W.unnamedBest), bold: true, color: UNNAMED_ACCENT },
            { text: num(sum(W.unnamedRows.map((r) => r.invocations))), bold: true },
            "",
          ],
        ],
      },
    ],
    stats: [
      {
        label: "Unnamed rows",
        value: money(W.unnamedBest),
        note: W.unnamedRows.length + " rows above, " +
          pct((W.unnamedBest / W.appsBest) * 100) + " of attributed spend",
        accent: UNNAMED_ACCENT,
      },
      {
        label: "Untagged Bedrock",
        value: money(W.untagged),
        note: "never reached the application table at all",
        accent: UNNAMED_ACCENT,
      },
      {
        label: "Together",
        value: pct((W.unchargeable / W.grand) * 100),
        note: money(W.unchargeable) + " of the " + money(W.grand) + " bill has no name on it",
        accent: COLORS.warn,
      },
    ],
    foot:
      "The two largest, on insait, are " + money(W.unnamedRows[0].best) + " on Claude and " +
      money(W.unnamedRows[1].best) + " on Azure OpenAI. Both are large enough, and priced highly enough per " +
      "call, to be production traffic rather than stray tests. Add the " + money(W.untagged) +
      " of untagged Bedrock and guardrail fees that never reach this table and the figure is " +
      money(W.unchargeable) + ".",
    speakerNotes: [
      "THIS IS THE SLIDE THAT MATTERS. Read the table, do not summarise it.",
      "",
      ...W.unnamedRows.map(
        (r) =>
          `  ${r.app.padEnd(13)} ${r.source.padEnd(7)} ${r.team.toLowerCase().padEnd(12)} ` +
          `${money(r.best).padStart(8)}  ${num(r.invocations).padStart(8)} calls`
      ),
      "",
      "  " + money(W.unnamedBest) + " on " + W.unnamedRows.length + " rows, " +
        pct((W.unnamedBest / W.appsBest) * 100) + " of attributed spend.",
      "",
      "TWO ROWS ARE THE WHOLE PROBLEM: 'unknown' on Claude at " + money(W.unnamedRows[0].best) + " and",
      "'(unlabeled)' on Azure at " + money(W.unnamedRows[1].best) + ", both on insait. At $91 and $97 per",
      "thousand calls, that is not somebody's test script. That is production",
      "traffic with the label missing.",
      "",
      "AND THIS TABLE IS THE SMALLER HALF. " + money(W.untagged) + " of Bedrock spend never",
      "reaches the application table at all, plus " + money(W.guardrails) + " of guardrail fees.",
      "Together with these rows that is " + money(W.unchargeable) + ", " +
        pct((W.unchargeable / W.grand) * 100) + " of everything we spent.",
      "",
      "WHAT IT COSTS US: no chargeback, no quota anyone can be held to, and no",
      "answer to 'whose is this' for nearly half the bill.",
      "",
      "WHAT IT WOULD TAKE: the tag exists, it is simply not being set. This is a",
      "configuration change at the gateway, not a project.",
      "",
      "DO NOT BLAME A TEAM FOR THIS. The rows land on insait because insait runs",
      "the most agent traffic, not because insait is careless. The default is",
      "wrong, and everyone inherits it.",
    ].join("\n"),
  },

  /* ==================== 3, 4, 5 / one page per team ================== */
  teamSlide("insait", {
    accent: COLORS.aws,
    title:
      "insait: " + pct((insait.best / W.attributed) * 100, 0) +
      " of the spend, and the most unnamed",
    foot:
      "insait runs agent and copilot traffic, which is expensive per call by nature: $" +
      insait.perThousand.toFixed(0) + " per thousand against $" +
      solugen.perThousand.toFixed(0) + " for solugen. The two unnamed rows sit here, and the " +
      "pension copilot appears under several spellings, which is why the tail is longer than it looks.",
    speakerNotes: [
      "INSAIT, " + money(insait.best) + ", " + pct((insait.best / W.attributed) * 100) +
        " of attributed spend, " + num(insait.invocations) + " calls.",
      "",
      ...W.appsFor("insait")
        .slice(0, 12)
        .map(
          (a) =>
            `  ${a.app.slice(0, 30).padEnd(31)} ${money(a.total).padStart(8)}  ` +
            `${num(a.invocations).padStart(8)} calls  ${a.sources.join("+")}`
        ),
      "",
      "THREE THINGS TO POINT AT:",
      "",
      "1. agent is " + money(W.appsFor("insait")[0].total) + " on its own, on both Claude and Azure.",
      "   It is the single largest application we run.",
      "",
      "2. The second and third bars have no name. " + money(W.unnamedRows[0].best) + " and " +
        money(W.unnamedRows[1].best) + ".",
      "   Almost certainly the same agent workload with the tag missing, but we",
      "   cannot prove that, which is the point.",
      "",
      "3. The pension copilot is spread across several rows because the name is",
      "   written differently each time, with and without hyphens, with preprod",
      "   and test suffixes. Same for the IVR service, ten rows for one thing.",
      "   Nothing can be trended while that is true.",
      "",
      "TONE: this team is not overspending. It is doing the most expensive kind",
      "of AI work, which is a product decision that was already taken. The ask",
      "here is naming, not restraint.",
    ].join("\n"),
  }),

  teamSlide("ai-factory", {
    accent: COLORS.ai,
    title:
      "ai-factory: the only team using all three providers",
    foot:
      "The one team whose work is genuinely split: Azure OpenAI for claims-copilot, Claude for the " +
      "developer command line, GCP for both document OCR pipelines. " +
      W.appsFor("ai-factory").length + " application names, most of them worth pennies, which is where " +
      "the test and template rows collect.",
    speakerNotes: [
      "AI-FACTORY, " + money(aiFactory.best) + ", " + pct((aiFactory.best / W.attributed) * 100) +
        " of attributed spend, " + num(aiFactory.invocations) + " calls.",
      "",
      ...W.appsFor("ai-factory")
        .slice(0, 12)
        .map(
          (a) =>
            `  ${a.app.slice(0, 30).padEnd(31)} ${money(a.total).padStart(8)}  ` +
            `${num(a.invocations).padStart(8)} calls  ${a.sources.join("+")}`
        ),
      "",
      "THE SHAPE HERE IS DIFFERENT AND IT IS WORTH NAMING: this is the only team",
      "with real spend on all three providers, and each one is doing a distinct",
      "job rather than the same job three ways.",
      "",
      "  Azure OpenAI  claims-copilot, high volume, cheap per call",
      "  Claude        cli, the developer command line",
      "  GCP           idp-ocr-hybrid, document OCR, our dearest per call",
      "",
      "cli IS THE ONE TO FLAG: " + money(W.appsFor("ai-factory").find((a) => a.app === "cli").total) +
        " of internal developer tooling.",
      "Not customer-facing, not budgeted anywhere, and the fastest-growing line",
      "in the bill on the period decks. It deserves an owner.",
      "",
      "THE TAIL IS THE MESSY PART: most of this team's application names are test",
      "rows, template defaults like microservice-name, and personal names. They",
      "cost nothing. They make every report harder to read.",
    ].join("\n"),
  }),

  teamSlide("solugen", {
    accent: COLORS.cyan,
    title: "solugen: one application, half of all our calls",
    foot:
      "insureGen alone is " + num(W.appsFor("solugen")[0].invocations) + " calls, " +
      pct((W.appsFor("solugen")[0].invocations / W.invocations) * 100, 0) +
      " of everything we send to any AI provider, at $" +
      W.appsFor("solugen")[0].perThousand.toFixed(0) + " per thousand. It is the cheapest large " +
      "workload we run and the clearest one to forecast.",
    speakerNotes: [
      "SOLUGEN, " + money(solugen.best) + ", " + pct((solugen.best / W.attributed) * 100) +
        " of attributed spend, " + num(solugen.invocations) + " calls, " +
        pct((solugen.invocations / W.invocations) * 100) + " of all calls.",
      "",
      ...W.appsFor("solugen").map(
        (a) =>
          `  ${a.app.slice(0, 30).padEnd(31)} ${money(a.total).padStart(8)}  ` +
          `${num(a.invocations).padStart(8)} calls  ${a.sources.join("+")}`
      ),
      "",
      "THE SIMPLEST TEAM IN THE FILE, AND THE POINT IS THAT THIS IS WHAT GOOD",
      "LOOKS LIKE: one named application, one provider, half our call volume, a",
      "quarter of the money, and a unit cost that has not moved.",
      "",
      "It needs no intervention. It needs a budget line and a monthly number.",
      "",
      "THE ONE BLEMISH: " + money(W.appsFor("solugen").find((a) => a.unnamed).total) +
        " on an '(unlabeled)' row, " + num(W.appsFor("solugen").find((a) => a.unnamed).invocations) +
        " calls.",
      "Small, and the same defect as everywhere else.",
      "",
      "IF SOMEONE ASKS WHY SOLUGEN IS SO CHEAP PER CALL: it is classification",
      "work on Azure OpenAI, short prompts and short answers. Comparing its unit",
      "cost to an agent workload is not a fair comparison, and we should not",
      "invite the room to make it.",
    ].join("\n"),
  }),

  /* ==================== 6 / everyone else ============================ */
  {
    kind: "table",
    eyebrow: "The rest",
    accent: COLORS.muted,
    title: "The other " + smallTeams.length + " teams, in full",
    note:
      money(sum(smallTeams.map((t) => t.best))) + " between them, " +
      pct((sum(smallTeams.map((t) => t.best)) / W.attributed) * 100) + " of attributed spend.",
    tables: [
      {
        title: "Every remaining team, its largest application, and its provider split",
        fontSize: 12,
        // Narrow enough to leave a rail for the stat tiles: thirteen rows plus
        // a header need the full height of the slide on the left.
        cols: [
          { label: "Team", w: 1.9 },
          { label: "Largest application", w: 2.3 },
          { label: "Claude", w: 1.1, align: "right" },
          { label: "Azure", w: 1.1, align: "right" },
          { label: "GCP", w: 1.0, align: "right" },
          { label: "Total", w: 1.1, align: "right" },
          { label: "Calls", w: 1.1, align: "right" },
        ],
        rows: smallTeams.map((t) => {
          const list = W.appsFor(t.name);
          const lead = list[0];
          // money() rounds, and a team billed 25 cents printed as "$0" reads as
          // no spend at all. Only a true zero gets the dash.
          const cell = (v) =>
            v >= 0.5 ? money(v) : v > 0 ? "<$1" : { text: "-", color: COLORS.faint };
          return [
            {
              text: t.name,
              bold: true,
              color: W.unownedTeams.includes(t) ? COLORS.warn : COLORS.text,
            },
            list.length > 1 ? `${lead.app} (+${list.length - 1})` : lead.app,
            cell(t.claude),
            cell(t.azure),
            cell(t.gcp),
            {
              text: t.best >= 0.5 ? money(t.best) : t.best > 0 ? "under $1" : "no spend",
              bold: true,
            },
            num(t.invocations),
          ];
        }),
      },
    ],
    stats: [
      {
        label: "Largest",
        value: money(smallTeams[0].best),
        note: smallTeams[0].name + ", the gateway not a team",
        accent: COLORS.warn,
      },
      {
        label: "Not owners",
        value: String(W.unownedTeams.length) + " of " + smallTeams.length,
        note: W.unownedTeams.map((t) => t.name).join(", ") + ", in amber",
        accent: COLORS.warn,
      },
      {
        label: "Under $5",
        value: String(smallTeams.filter((t) => t.best < 5).length) + " teams",
        note: "nearly all of it test traffic on a billed endpoint",
        accent: COLORS.muted,
      },
    ],
    foot:
      "apim, azure and unknown are amber because they are a gateway and two defaults, not teams anyone " +
      "can be asked to answer for. Their spend is real and stays in every total, but a chargeback " +
      "conversation cannot start with them.",
    speakerNotes: [
      "THE REMAINING TEAMS, " + money(sum(smallTeams.map((t) => t.best))) + " between them.",
      "",
      ...smallTeams.map(
        (t) =>
          `  ${t.name.padEnd(22)} ${money(t.best).padStart(8)}  ${num(t.invocations).padStart(7)} calls  ` +
          (W.unownedTeams.includes(t) ? "not a business owner" : "")
      ),
      "",
      "TWO THINGS ONLY:",
      "",
      "1. apim at " + money(smallTeams[0].best) + " is the gateway's own row, not a team. Its",
      "   bedrock-session traffic belongs to whoever called through it, and today",
      "   we cannot say who that was.",
      "",
      "2. Everything below onedoc is test traffic that reached a billed endpoint.",
      "   It costs nothing. It is on the slide because it is the same defect as",
      "   the unnamed rows, one size down: nobody meant to create these, and",
      "   nothing stops them.",
      "",
      "DO NOT SPEND TIME HERE IN THE MEETING. This page exists so that the file",
      "is fully accounted for, not because there is a decision in it.",
    ].join("\n"),
  },

  /* ==================== 7 / the naming standard ====================== */
  {
    kind: "criteria",
    eyebrow: "The ask",
    accent: COLORS.cyan,
    title: "Four rules that would make this file readable",
    note: "All four are gateway configuration or a naming convention. None are engineering work.",
    items: [
      {
        label: "No call without an application tag",
        desc:
          "Reject or default-flag any request that reaches a provider without a named application on it.",
        tip: money(W.unchargeable) + " has no name today, " +
          pct((W.unchargeable / W.grand) * 100, 0) + " of the bill.",
      },
      {
        label: "One name per service, not one per version",
        desc:
          "Stable application names, with the version and environment carried somewhere other than the name.",
        tip: "Ten IVR rows and seven pension copilot rows are two services.",
      },
      {
        label: "No personal names, no template defaults",
        desc:
          "An application name identifies a service. It is not a person and it is not microservice-name.",
        tip: "Both appear in the file today, across three different teams.",
      },
      {
        label: "Test traffic never reaches a billed endpoint",
        desc:
          "Give test work its own key and its own quota, so it cannot land in the production bill.",
        tip: String(W.apps.filter((r) => /test/i.test(r.app)).length) +
          " rows in this file have test in the name.",
      },
    ],
    banner: {
      title: "Then this file becomes a monthly chargeback instead of a diagnosis",
      text:
        "Every figure in this deck already exists. The only reason it cannot be sent to a team as an " +
        "invoice is that " + pct((W.unchargeable / W.grand) * 100, 0) +
        " of it has no name on it, and the names it does have are not stable enough to compare month to month.",
    },
    speakerNotes: [
      "THE ASK IN ONE SENTENCE: make the gateway refuse an untagged call, and fix",
      "the names. Both are configuration.",
      "",
      "NOBODY HAS TO STOP BUILDING ANYTHING. Say that out loud. A cost slide in a",
      "CIO meeting is usually heard as a restriction, and this one is not.",
      "",
      "WHAT IT BUYS: a per-application figure every month that can be sent to a",
      "team and defended. That is the precondition for chargeback and for any",
      "quota model at the gateway. Today the gateway would be enforcing budgets",
      "it cannot prove.",
      "",
      "WHAT IT COSTS: nothing to buy. A tagging rule and a naming convention.",
      "",
      "IF ASKED WHO OWNS THE FIX: the gateway team, for the tag. The application",
      "teams, for the names. Neither is more than a day of work, and the second",
      "one only has to be done once per service.",
    ].join("\n"),
  },
];
