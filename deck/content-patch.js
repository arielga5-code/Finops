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
  { name: "10 smaller meters", kind: "-", vals: [476, 620, 701] },
];

const sum = (a) => a.reduce((x, y) => x + y, 0);
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const pct = (n, d = 1) => n.toFixed(d) + "%";

const meterTotal = (m) => sum(m.vals);
const tagTotal = sum(METERS.map(meterTotal));
const bandTotal = (kind) => sum(METERS.filter((m) => m.kind === kind).map(meterTotal));
const bandMonth = (kind, i) => sum(METERS.filter((m) => m.kind === kind).map((m) => m.vals[i]));

// The unclassified bucket is 10 tail meters too small to name. It is carried
// with infrastructure rather than left dangling, because that is what it is -
// networking, storage and monitoring odds and ends, no models.
const INFRA = bandTotal("infra") + bandTotal("-");
const AI_METERS = bandTotal("AI");
const infraMonth = (i) => bandMonth("infra", i) + bandMonth("-", i);

const KIND_COLOR = { infra: COLORS.warn, AI: COLORS.azure, "-": COLORS.faint };

/** One table row, in the column order the slide declares: name, kind, May-Jul, total, share. */
const meterRow = (m) => [
  m.name,
  { text: m.kind, color: KIND_COLOR[m.kind] },
  money(m.vals[0]),
  money(m.vals[1]),
  money(m.vals[2]),
  money(meterTotal(m)),
  pct((meterTotal(m) / tagTotal) * 100),
];

/** The two summary rows under the meters, same columns, set bold. */
const bandRow = (label, months, color) => {
  const total = sum(months);
  return [
    { text: label, bold: true },
    { text: "-", color: COLORS.faint },
    ...months.map((v) => ({ text: money(v), bold: true })),
    { text: money(total), bold: true },
    { text: pct((total / tagTotal) * 100), bold: true, color },
  ];
};

const topMeter = [...METERS].sort((a, b) => meterTotal(b) - meterTotal(a))[0];

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
    kind: "table",
    eyebrow: "Azure / AIFactory",
    accent: COLORS.warn,
    title: "Inside AIFactory: infrastructure vs. AI",
    note: "May-Jul invoiced, the only window with meter-level detail.",
    tables: [
      {
        title: "Every meter billed under the tag",
        sub: "Three-month totals, with the month-by-month split and each meter's share of the tag",
        fontSize: 12,
        cols: [
          { label: "Meter category", w: 2.75 },
          { label: "Kind", w: 0.75 },
          { label: "May", w: 0.95, align: "right" },
          { label: "Jun", w: 0.95, align: "right" },
          { label: "Jul", w: 0.95, align: "right" },
          { label: "3-month", w: 1.05, align: "right" },
          { label: "Share", w: 0.85, align: "right" },
        ],
        rows: [
          // Largest first, but the unnamed tail bucket stays at the bottom -
          // sorting it by size would drop it into the middle of the named
          // meters, where it reads as one of them.
          ...[...METERS]
            .sort((a, b) =>
              (a.kind === "-") - (b.kind === "-") || meterTotal(b) - meterTotal(a))
            .map(meterRow),
          bandRow("Infrastructure", [0, 1, 2].map(infraMonth), COLORS.warn),
          bandRow("AI meters", [0, 1, 2].map((i) => bandMonth("AI", i)), COLORS.azure),
        ],
      },
    ],
    stats: [
      {
        label: "Not AI meters",
        value: pct((INFRA / tagTotal) * 100),
        note: "of the AIFactory tag is infrastructure",
        accent: COLORS.warn,
      },
      {
        label: "Largest single line",
        value: money(meterTotal(topMeter)),
        note: topMeter.name + ", ahead of the models it fronts",
        accent: COLORS.cyan,
      },
      {
        label: "AI meters",
        value: money(AI_METERS),
        note: pct((AI_METERS / tagTotal) * 100) + " of the tag",
        accent: COLORS.azure,
      },
    ],
    foot:
      "API Management alone is " + money(meterTotal(topMeter)) + ", or " +
      pct((meterTotal(topMeter) / tagTotal) * 100) + " of the tag, more than the models it " +
      "fronts. Inference has to run somewhere, so this is not automatically wrong; it is the " +
      "part of the AI bill that right-sizing can actually move, and nobody is looking at it. " +
      "The subscriptions actually named \"AI Factory\" total just $4,279. The tag is what " +
      "counts here, not the subscription name.",
    speakerNotes: [
      "The AIFactory tag is " + money(tagTotal) + " over May-July.",
      "",
      "  Infrastructure  " + money(INFRA) + "  " + pct((INFRA / tagTotal) * 100),
      "  AI meters       " + money(AI_METERS) + "  " + pct((AI_METERS / tagTotal) * 100),
      "",
      "The headline: API Management is the single largest line at " +
        money(meterTotal(topMeter)) + ",",
      "ahead of Foundry Models. The gateway costs more than the models behind it.",
      "",
      "Watch for the trap in the name: the two subscriptions literally called",
      '"AI Factory" total $4,279. The tag is what matters, not the subscription name.',
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
