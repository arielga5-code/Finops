/**
 * Replacement slides for the hand-assembled "Final" CIO deck.
 *
 * Three slides in that deck were pasted in from the v33 briefing rather than
 * generated here. They carried v33's type scale, eyebrows at 10.5pt, body text
 * down to 8pt, and, because PowerPoint drops a slide-level background when you
 * paste onto a different master, they lost the dark canvas and came through
 * white. This file rebuilds all three on the current design system; the merge
 * script splices them back into the deck in place.
 *
 * Their position in that deck moves as it is re-cut, so `fix:final` in
 * package.json carries the current mapping rather than this comment. In build
 * order they are:
 *
 *   1  Spend by AI platform, was a v33 card row on the May-Jul cut
 *   2  Inside AIFactory, was a v33 table at 9.5pt
 *   3  AI spend is outpacing governance
 *
 * One editorial change came with the rebuild. Slide 5 was still on v33's
 * May-July window, which put it next to a Jan-Jul slide showing a different
 * total for the same five platforms. It is now on the deck's single basis -
 * metered consumption, January to July 2026, and reads its figures from
 * `data/ai-platforms.js`, the same source as the chart on slide 6. The two
 * slides now add up to the same $199,531.
 */

const { COLORS } = require("./lib/theme");
const AI = require("./data/ai-platforms");

const AI_PURPLE = COLORS.ai;

/* ------------------------------------------------------------------ *
 * The AIFactory tag, meter by meter
 *
 * `kind` drives the totals: the infrastructure and AI summary rows and every
 * share are computed from the rows below, so a corrected meter cannot leave a
 * stale total sitting under it.
 * ------------------------------------------------------------------ */

const METERS = [
  { name: "API Management", kind: "infra", vals: [5694, 5514, 6103] },
  { name: "Foundry Models", kind: "AI", vals: [1183, 9683, 5641] },
  { name: "Virtual Machines", kind: "infra", vals: [2887, 4557, 4865] },
  { name: "Azure Cognitive Search", kind: "AI", vals: [1166, 1582, 1825] },
  { name: "Microsoft Defender for Cloud", kind: "infra", vals: [401, 1574, 1166] },
  { name: "Azure Database for PostgreSQL", kind: "infra", vals: [790, 1069, 1102] },
  { name: "Virtual Network", kind: "infra", vals: [330, 518, 543] },
  { name: "Foundry Tools", kind: "AI", vals: [95, 480, 718] },
  { name: "Redis Cache", kind: "infra", vals: [327, 379, 500] },
  { name: "Storage", kind: "infra", vals: [307, 368, 445] },
  // Ten meters too small to name individually, carried as one line.
  { name: "10 smaller meters", kind: "-", count: 10, vals: [476, 620, 701] },
];

const sum = (a) => a.reduce((x, y) => x + y, 0);
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const pct = (n, d = 1) => n.toFixed(d) + "%";

const meterTotal = (m) => sum(m.vals);
const tagTotal = sum(METERS.map(meterTotal));
const bandTotal = (kind) => sum(METERS.filter((m) => m.kind === kind).map(meterTotal));

// The unclassified bucket is 10 tail meters too small to name. It is carried
// with infrastructure rather than left dangling, because that is what it is -
// networking, storage and monitoring odds and ends, no models.
const INFRA = bandTotal("infra") + bandTotal("-");
const AI_METERS = bandTotal("AI");

// Orange is infrastructure, blue is AI, everywhere on the slide. The tail
// bucket is both, so it gets neither and is drawn grey.
const KIND_COLOR = { infra: COLORS.warn, AI: COLORS.azure, "-": COLORS.faint };

const ranked = [...METERS].sort((a, b) => meterTotal(b) - meterTotal(a));
const topMeter = ranked[0];
const models = METERS.find((m) => m.name === "Foundry Models");

/**
 * Five named lines and one remainder, for the bar rows.
 *
 * Five is the number that fits without the rows turning back into a table. The
 * remainder is computed against the tag total rather than listed out, so the
 * bars still add up to the whole and nothing is quietly dropped.
 */
const NAMED = 5;
const TOP_LINES = [
  ...ranked.slice(0, NAMED).map((m) => ({
    name: m.name,
    value: meterTotal(m),
    color: KIND_COLOR[m.kind],
  })),
  {
    name: `${sum(ranked.slice(NAMED).map((m) => m.count || 1))} smaller meters`,
    value: tagTotal - sum(ranked.slice(0, NAMED).map(meterTotal)),
    color: COLORS.faint,
  },
];

/* ------------------------------------------------------------------ *
 * The mesh slide
 * ------------------------------------------------------------------ */

const cowork = AI.platform("Cowork");

module.exports = [
  /* ========================= 1 / AI platforms ========================= */
  {
    kind: "platforms",
    eyebrow: "All providers",
    accent: AI_PURPLE,
    title: "Spend by AI platform",
    note:
      "Billed AI, all three clouds, January to July. Excludes the Databricks " +
      "pre-purchase, which bills at $0.",
    firstLabel: "Jan",
    lastLabel: "Jul",
    items: AI.items,
    foot:
      "Five platforms, bought separately by different teams, on three clouds and two " +
      "enrolments. Every one of them grew, and the two that did not exist in January are " +
      "already 22% of the July bill. " + money(AI.total) + " over the seven months.",
    speakerNotes: [
      "The platform cut of the slide that follows. Same basis, same total:",
      "  " + money(AI.total) + " of billed AI, January to July 2026.",
      "",
      ...AI.items.map(
        (p) =>
          `  ${p.name.padEnd(26)} ${money(p.total).padStart(9)}  ` +
          `${((p.total / AI.total) * 100).toFixed(1)}%  ${p.badge}`
      ),
      "",
      "WHAT IS NOT HERE",
      "Databricks. It draws down the 600,000 DBU pre-purchase paid in April and",
      "bills at $0, so it would show as the largest platform while costing nothing",
      "this month. It has its own slide.",
      "",
      "AWS July is gross of the $16,100 MAP credit, same footing as the rest of",
      "the deck, and that credit has its own slide too.",
      "",
      "IF ASKED WHY THIS DIFFERS FROM THE v33 VERSION: v33 showed the May-July",
      "invoiced window. This is the full seven months, on the deck's one basis.",
    ].join("\n"),
  },

  /* ========================== 2 / AIFactory ========================== */
  {
    kind: "splitBars",
    eyebrow: "Azure / AIFactory",
    accent: COLORS.warn,
    title: "Two thirds of the AI Factory tag is not AI",
    note: money(tagTotal) + " billed under the tag, May-Jul invoiced.",
    bands: [
      {
        label: "Infrastructure",
        value: INFRA,
        color: COLORS.warn,
        note: "the gateway, the servers and the databases",
      },
      {
        label: "AI meters",
        value: AI_METERS,
        color: COLORS.azure,
        note: "model tokens and cognitive search",
      },
    ],
    rowsTitle: "The five largest lines, and everything else",
    items: TOP_LINES,
    callout: {
      title:
        "API Management costs more than the models it fronts: " +
        money(meterTotal(topMeter)) + " against " + money(meterTotal(models)),
      text:
        "Inference has to run somewhere, so this is not automatically wrong. It is the part " +
        "of the AI bill that right-sizing can actually move, and it is the part nobody is looking at.",
    },
    foot:
      "Meter-level detail for every line is in the appendix. The subscriptions actually " +
      "named \"AI Factory\" total just $4,279, so the tag is what counts, not the name.",
    speakerNotes: [
      "ONE NUMBER OFF THIS SLIDE: " + pct((INFRA / tagTotal) * 100) + " of the AI Factory tag",
      "is infrastructure, not AI.",
      "",
      "  Infrastructure  " + money(INFRA) + "   " + pct((INFRA / tagTotal) * 100),
      "  AI meters       " + money(AI_METERS) + "   " + pct((AI_METERS / tagTotal) * 100),
      "  ---------------------------------",
      "  Tag total       " + money(tagTotal) + "   May-Jul invoiced",
      "",
      "The orange bars are infrastructure, the blue are AI. Read the top two rows",
      "together: the gateway in front of the models costs more than the models.",
      "",
      "WHAT IS IN THE AI BAND",
      "Foundry Models (tokens), Azure Cognitive Search, Foundry Tools. Document",
      "Intelligence, the OCR service, is a separate project in the programme and is",
      "not in this tag, so it is not in this total. It is on the projects slide.",
      "",
      "IF ASKED FOR THE FULL METER LIST: it is in the appendix. Do not read it out.",
    ].join("\n"),
  },

  /* ============================ 3 / the mesh ========================= */
  {
    kind: "mesh",
    eyebrow: "The problem",
    accent: COLORS.danger,
    title: "AI spend is outpacing governance",
    note:
      "Every business unit buys AI separately, on shared keys, with no owner " +
      "per consumer.",
    left: {
      heading: "Who consumes AI",
      items: [
        "Business applications",
        "Analytics and BI",
        "HR and back office",
        "R&D and data science",
        "Cloud and platform",
      ],
    },
    right: {
      heading: "What they buy",
      items: [
        "Microsoft Copilot",
        "Azure AI Foundry",
        "AWS Bedrock",
        "Google Vertex AI",
        "Claude / OpenAI",
        "Databricks",
      ],
    },
    panel: {
      title: "Today's reality",
      items: [
        "Multiple AI providers, bought separately",
        "Multiple business units consuming them",
        "Multiple applications on shared keys",
        "Limited financial visibility per consumer",
        "No unified enterprise ownership",
      ],
    },
    speakerNotes: [
      "The mesh is the argument. Five consumer groups, six platforms, nothing in",
      "the middle. Thirty direct paths, no single place that can see the spend,",
      "refuse a request, or attribute a bill.",
      "",
      "Databricks is on the list because it is bought the same way as the rest, and",
      "it is the largest single commitment of the year. It bills at $0 today because",
      "it draws down the April pre-purchase, which is exactly why nobody is watching",
      "it. See the Databricks slide.",
      "",
      "This slide sets up the gateway slide. Do not solve it here.",
    ].join("\n"),
  },
];
