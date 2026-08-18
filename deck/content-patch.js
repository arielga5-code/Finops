/**
 * Replacement slides for the hand-assembled "Final" CIO deck.
 *
 * Slides in that deck get pasted in, redesigned, or replaced from here as the
 * deck evolves. Their position moves as it is re-cut, so `fix:final` in
 * package.json carries the current mapping rather than this comment. In build
 * order they are:
 *
 *   1  Spend by AI platform
 *   2  Infrastructure across the AI Factory programme, by service
 *   3  AI spend is outpacing governance, the mesh
 *   4  The same programme, built four different ways, by project
 *   5  Nothing reaches production unowned, the ownership criteria
 *
 * Slide 1 reads its figures from `data/ai-platforms.js`; slides 2 and 4 both
 * read from `data/ai-projects.js`, so a project's total, its infrastructure
 * share and its growth cannot say something different from one slide to the
 * next. Slide 5 is not built here at all, it is pulled straight out of
 * `content-cio.js`, the same object the combined CIO briefing itself uses, so
 * a tip added there does not need to be repeated in two places.
 */

const { COLORS } = require("./lib/theme");
const AI = require("./data/ai-platforms");
const P = require("./data/ai-projects");
const cio = require("./content-cio");

const AI_PURPLE = COLORS.ai;

const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const pct = (n, d = 1) => n.toFixed(d) + "%";

/* ------------------------------------------------------------------ *
 * Infrastructure across the whole programme, service by service
 *
 * Every project's non-AI meters, added together. Deliberately excludes AI:
 * this slide answers one question, what does the platform under the AI cost -
 * and the mixed AI/infra table it replaces buried that answer in ninety numbers.
 * ------------------------------------------------------------------ */

const INFRA_NAMED = 8;
const infraTop = P.infraByService.slice(0, INFRA_NAMED);
const infraRest = P.infraByService.slice(INFRA_NAMED);
const infraRestTotal = infraRest.reduce((a, b) => a + b.value, 0);

const INFRA_SERIES = [
  ...infraTop.map((l) => ({ name: l.name, vals: [l.value] })),
  ...(infraRest.length
    ? [{ name: `${infraRest.length} smaller services`, vals: [infraRestTotal] }]
    : []),
];

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

  /* ====================== 2 / programme infrastructure ================ */
  {
    kind: "chart",
    eyebrow: "AI Factory / Infrastructure",
    accent: COLORS.azure,
    title: "The AI programme carries " + P.money(P.infraTotal) + " of infrastructure",
    note:
      "All four projects, January to July. AI meters are excluded here, " +
      "models, tools, search and OCR pages have their own slides.",
    chartTitle: "Infrastructure spend by service, every project combined",
    chart: {
      type: "rank",
      color: COLORS.azure,
      inline: { cats: INFRA_SERIES.map((s) => s.name), series: INFRA_SERIES },
    },
    stats: [
      {
        label: "Infrastructure",
        value: P.money(P.infraTotal),
        note: pct((P.infraTotal / P.total) * 100) + " of the programme",
        accent: COLORS.azure,
      },
      {
        label: "Largest line",
        value: P.money(P.infraByService[0].value),
        note: P.infraByService[0].name,
        accent: COLORS.cyan,
      },
      {
        label: "AI, for contrast",
        value: P.money(P.aiTotal),
        note: pct((P.aiTotal / P.total) * 100) + " of the programme",
        accent: AI_PURPLE,
      },
    ],
    foot:
      "Every project carries some infrastructure except Document Intelligence, a hosted OCR " +
      "API with none at all, the next slide breaks this out project by project. Inference " +
      "running on a plain virtual machine still bills as infrastructure, so this is a floor.",
    speakerNotes: [
      "ONE NUMBER OFF THIS SLIDE: " + P.money(P.infraTotal) + " of the " + P.money(P.total),
      "AI Factory programme is infrastructure, not AI models. That is " +
        pct((P.infraTotal / P.total) * 100) + ".",
      "",
      "THE TWO BIG LINES",
      "  " + P.infraByService[0].name.padEnd(24) + P.money(P.infraByService[0].value),
      "  " + P.infraByService[1].name.padEnd(24) + P.money(P.infraByService[1].value),
      "Between them, " +
        pct(((P.infraByService[0].value + P.infraByService[1].value) / P.infraTotal) * 100) +
        " of all the infrastructure in the programme.",
      "",
      "WHAT IS EXCLUDED: Foundry Models, Foundry Tools, Azure Cognitive Search, and every",
      "Document Intelligence page meter. Those are on the AI platform slides, not here.",
      "",
      "WHERE THIS GOES: this is the half of the AI bill that right-sizing and reservations",
      "can move. The next slide shows how unevenly it falls across the four projects.",
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

/* ------------------------------------------------------------------ *
 * 4 / consumption by project
 *
 * Was a seven-month stacked column, four series, twenty-eight numbers at
 * 8-9pt. Traded for one bar per project: how big it is, and how much of it is
 * infrastructure versus AI, at a glance. The month-by-month detail this drops
 * still exists, it is the chart on the operational review's own copy of this
 * slide, but a CIO briefing does not need it read off the screen.
 * ------------------------------------------------------------------ */

const projectItems = [...P.projects].sort((a, b) => b.total - a.total);

const shareOf = (p) => (p.total ? (p.infra / p.total) * 100 : 0);
const widest = [...P.projects].sort((a, b) => shareOf(a) - shareOf(b));
const leanest = widest[0];
const heaviest = widest[widest.length - 1];

const top = projectItems[0];

module.exports.push({
  kind: "projectBars",
  eyebrow: "AI Factory / Projects",
  accent: AI_PURPLE,
  title: "The same programme, built four different ways",
  note:
    "Four projects, January to July. Blue is infrastructure, purple is AI, the " +
    "same colours as the programme total.",
  legend: [
    { label: "Infrastructure", color: COLORS.azure },
    { label: "AI", color: AI_PURPLE },
  ],
  stats: [
    {
      label: "Total, Jan-Jul",
      value: P.money(P.total),
      note: (P.growth >= 0 ? "+" : "") + P.growth.toFixed(0) + "% Jan to Jul",
      accent: AI_PURPLE,
    },
    { label: "Largest project", value: top.name, note: pct((top.total / P.total) * 100) + " of the programme", accent: COLORS.cyan },
    {
      label: "Infrastructure share",
      value: `${Math.round(shareOf(leanest))}% to ${Math.round(shareOf(heaviest))}%`,
      note: leanest.name + " to " + heaviest.name,
      accent: COLORS.azure,
    },
  ],
  items: projectItems.map((p) => ({
    name: p.name, total: p.total, infra: p.infra, ai: p.ai, badge: p.badge,
  })),
  foot:
    leanest.name + " buys AI as a hosted API and carries no infrastructure at all. " +
    heaviest.name + " builds its own, so " + pct(shareOf(heaviest), 0) + " of it is infrastructure. " +
    "The gap is what a project buys versus what it builds, not how well it is run.",
  speakerNotes: [
    "Same four projects as the infrastructure slide, now compared to each other",
    "rather than added together.",
    "",
    ...projectItems.map(
      (p) =>
        `  ${p.name.padEnd(23)} ${P.money(p.total).padStart(9)}   infra ${Math.round(shareOf(p))}%   ${p.badge}`
    ),
    "",
    "THE RANGE IS THE POINT: from " + Math.round(shareOf(leanest)) + "% to " +
      Math.round(shareOf(heaviest)) + "% infrastructure, inside the same programme.",
    leanest.name + " is a hosted OCR API, there is nothing under it to build.",
    heaviest.name + " is a research workload running on its own containers and",
    "gateway, so nearly all of it is platform.",
    "",
    "AI Factory sits in the middle because it is the shared platform everyone",
    "else's model traffic runs through, that gateway is the largest single",
    "infrastructure line in the whole programme. See the previous slide.",
    "",
    "IF ASKED FOR THE MONTH-BY-MONTH VIEW: it is in the appendix, on the",
    "operational review's own copy of this slide.",
  ].join("\n"),
});

/* ------------------------------------------------------------------ *
 * 5 / ownership criteria
 *
 * Pulled by reference from content-cio.js rather than redefined, so this is
 * never a second copy that can drift from the one the CIO deck itself builds.
 * ------------------------------------------------------------------ */

const ownership = cio.find((s) => s.kind === "criteria");
if (!ownership) {
  throw new Error("content-patch: content-cio.js no longer has a criteria slide");
}
module.exports.push(ownership);
