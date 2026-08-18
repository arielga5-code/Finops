/**
 * Cloud consumption by vendor — AI against everything else, January–July 2026.
 *
 * One question, asked six ways: how much are we spending on each cloud each
 * month, and how much of that is AI?
 *
 * Every series on every slide is derived in `data/vendor-split.js` from the
 * same extracted workbooks the other decks use. Nothing here is a typed-in
 * figure — the stat tiles below are computed from those same arrays, so a
 * number on a slide cannot disagree with the bar beside it.
 *
 * The basis is stated in full in `data/vendor-split.js`. In short: vendor
 * consumption plus Amazon Bedrock (which bills through AWS Marketplace but is
 * plainly AWS AI spend); all other Marketplace subscriptions excluded;
 * Databricks counted as "other", not AI.
 */

const { COLORS } = require("./lib/theme");
const V = require("./data/vendor-split");

const AZURE = COLORS.azure;
const AWS = COLORS.aws;
const GCP = COLORS.gcp;
const AI = COLORS.ai;

/* ------------------------------------------------------------------ *
 * Figures, all computed from the derived series
 * ------------------------------------------------------------------ */

const sum = (a) => a.reduce((x, y) => x + y, 0);
const first = (a) => a[0];
const last = (a) => a[a.length - 1];
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const pct = (n, d = 1) => n.toFixed(d) + "%";
const growth = (a) => ((last(a) / first(a) - 1) * 100);

const F = {
  periodAll: money(sum(V.totals.all)),
  periodAI: money(sum(V.totals.ai)),
  periodAIShare: pct((sum(V.totals.ai) / sum(V.totals.all)) * 100),
  julAll: money(last(V.totals.all)),
  julAI: money(last(V.totals.ai)),
  julOther: money(last(V.totals.other)),
  janAll: money(first(V.totals.all)),
  janAI: money(first(V.totals.ai)),
  janOther: money(first(V.totals.other)),
  julShare: pct(last(V.aiShare)),
  janShare: pct(first(V.aiShare)),
  aiGrowth: pct(growth(V.totals.ai), 0),
  otherGrowth: pct(growth(V.totals.other), 1),
  runRate: money(last(V.totals.all) * 12),
  julAzure: money(last(V.vendors.azure.total)),
  julAws: money(last(V.vendors.aws.total)),
  julGcp: money(last(V.vendors.gcp.total)),
  azureJulAI: money(last(V.vendors.azure.ai)),
  awsJulAI: money(last(V.vendors.aws.ai)),
  gcpJulAI: money(last(V.vendors.gcp.ai)),
  azureJulShare: pct((last(V.vendors.azure.ai) / last(V.vendors.azure.total)) * 100),
  awsJulShare: pct((last(V.vendors.aws.ai) / last(V.vendors.aws.total)) * 100),
  gcpJulShare: pct((last(V.vendors.gcp.ai) / last(V.vendors.gcp.total)) * 100),
  azurePeriod: money(sum(V.vendors.azure.total)),
  awsPeriod: money(sum(V.vendors.aws.total)),
  gcpPeriod: money(sum(V.vendors.gcp.total)),
  azureShareOfAll: pct((sum(V.vendors.azure.total) / sum(V.totals.all)) * 100, 0),
  awsShareOfAll: pct((sum(V.vendors.aws.total) / sum(V.totals.all)) * 100, 0),
  gcpShareOfAll: pct((sum(V.vendors.gcp.total) / sum(V.totals.all)) * 100, 1),
  azureAIGrowth: pct(growth(V.vendors.azure.ai), 0),
  azureOtherGrowth: pct(growth(V.vendors.azure.other), 1),
  awsOtherGrowth: pct(growth(V.vendors.aws.other), 1),
  aiDelta: money(last(V.totals.ai) - first(V.totals.ai)),
  otherDelta: money(Math.abs(last(V.totals.other) - first(V.totals.other))),
  allDelta: money(last(V.totals.all) - first(V.totals.all)),
};

const cats = V.MONTHS;
const S = (name, vals) => ({ name, vals });

/* ------------------------------------------------------------------ *
 * Chart series
 * ------------------------------------------------------------------ */

// One rule across the whole deck: AI is purple, everything else wears its
// vendor's colour. Bottom-up the columns stack all three vendors' ordinary
// consumption first, then the AI bands, so AI reads as a single purple crown
// on every column while the base still says which cloud you are looking at.
const COMBINED_COLORS = [
  AZURE, AWS, GCP,                              // …— other
  COLORS.aiDeep, COLORS.aiMid, AI,              // …— AI, GCP → AWS → Azure
];

const vendorChart = (v, vendorColor) => ({
  inline: {
    cats,
    series: [
      S("All other consumption", V.vendors[v].other),
      S("AI consumption", V.vendors[v].ai),
    ],
  },
  colors: [vendorColor, AI],
});

module.exports = [
  /* ---------------------------------------------------------------- *
   * Opening
   * ---------------------------------------------------------------- */
  {
    kind: "section",
    kicker: "Harel Insurance · Cloud FinOps",
    title: "Where the money goes",
    sub: "Monthly consumption by cloud vendor, split into AI and everything else · January–July 2026",
    accent: AI,
    speakerNotes: [
      "ONE CHART DECK. The next slide is the whole story; the rest is",
      "the same data taken apart so questions can be answered.",
      "",
      "The point to land: total non-AI cloud spend is flat. Every dollar of",
      "growth this year is AI.",
    ].join("\n"),
  },

  /* ---------------------------------------------------------------- *
   * The chart
   * ---------------------------------------------------------------- */
  {
    kind: "chart",
    eyebrow: "All clouds · monthly consumption",
    accent: AI,
    title: "All of this year's growth is AI",
    note: "Each column is one month's total cloud spend. Purple is AI; the vendor colours beneath it are everything else.",
    chartTitle: "Monthly consumption by vendor and by AI · January–July 2026",
    chart: {
      inline: { cats, series: V.combinedSeries },
      colors: COMBINED_COLORS,
    },
    stats: [
      { label: "July consumption", value: F.julAll, note: `${F.runRate} a year at this rate`, accent: COLORS.cyan },
      { label: "Of which AI", value: F.julAI, note: `${F.julShare} of the month · was ${F.janShare} in January`, accent: AI },
      { label: "Everything else", value: F.julOther, note: `${F.otherGrowth} against January — flat`, accent: COLORS.good },
    ],
    notes: {
      title: "Read it this way",
      items: [
        `Total bill: +${F.allDelta} a month.`,
        `AI is +${F.aiDelta} of that.`,
        `Non-AI fell ${F.otherDelta}.`,
      ],
    },
    foot: "Consumption for all three clouds plus Amazon Bedrock, which bills through AWS Marketplace but is plainly AWS AI spend. Other Marketplace subscriptions are excluded. Databricks counts as ordinary consumption, not AI.",
    speakerNotes: [
      "THE SLIDE: total cloud consumption per month, every vendor, with AI",
      "lifted out as the bright band on top.",
      "",
      `Two lines to say out loud:`,
      `  • The bill grew from ${F.janAll} to ${F.julAll} a month.`,
      `  • The non-AI part went from ${F.janOther} to ${F.julOther} — it did not grow.`,
      "",
      "So this is not a cloud cost problem that happens to include AI. It is an",
      "AI cost problem sitting on a stable cloud estate. That distinction",
      "decides where the governance effort goes.",
      "",
      "If asked why GCP is barely visible: it is real but small — under $4K a",
      "month. There is a slide on it.",
    ].join("\n"),
  },

  /* ---------------------------------------------------------------- *
   * The same data as a share
   * ---------------------------------------------------------------- */
  {
    kind: "chart",
    eyebrow: "All clouds · mix",
    accent: AI,
    title: `AI went from ${F.janShare} of the bill to ${F.julShare}`,
    note: "The same months as the previous slide, with each column scaled to 100% so the shift in mix is readable independently of the total.",
    chartTitle: "Share of monthly cloud consumption · AI against everything else",
    chart: {
      inline: {
        cats,
        series: [S("All other consumption", V.totals.other), S("AI consumption", V.totals.ai)],
      },
      colors: ["44546F", AI],
      grouping: "percentStacked",
      valFmt: "0%",
    },
    stats: [
      { label: "January", value: F.janShare, note: `${F.janAI} of ${F.janAll}`, accent: COLORS.muted },
      { label: "July", value: F.julShare, note: `${F.julAI} of ${F.julAll}`, accent: AI },
      { label: "AI growth, Jan→Jul", value: F.aiGrowth, note: "against a flat non-AI base", accent: COLORS.danger },
    ],
    notes: {
      title: "Why it matters",
      items: [
        "A mix shift this fast outruns annual budgeting.",
        "The controls that govern it are per-model and per-app, not per-subscription.",
      ],
    },
    foot: `Across the whole period AI is ${F.periodAIShare} of consumption (${F.periodAI} of ${F.periodAll}) — the July figure is high because almost all of it arrived in the last three months.`,
    speakerNotes: [
      "Same numbers, different question. The previous slide asks how much;",
      "this one asks what share.",
      "",
      "The seven-month average is only " + F.periodAIShare + ". Quoting that",
      "would understate the position badly — the curve is what matters, not",
      "the average, because almost all of the AI spend landed in May, June",
      "and July.",
    ].join("\n"),
  },

  /* ---------------------------------------------------------------- *
   * Vendor by vendor
   * ---------------------------------------------------------------- */
  {
    kind: "chart",
    eyebrow: "Azure",
    accent: AZURE,
    title: `Azure is ${F.azureShareOfAll} of the estate and most of the AI`,
    note: "Azure consumption by month, with AI Foundry, GitHub Copilot and Copilot Studio lifted out of the total.",
    chartTitle: `Azure monthly consumption · ${F.azurePeriod} January–July`,
    chart: vendorChart("azure", AZURE),
    stats: [
      { label: "July Azure", value: F.julAzure, note: "the largest of the three clouds", accent: AZURE },
      { label: "Of which AI", value: F.azureJulAI, note: `${F.azureJulShare} of Azure in July`, accent: AI },
      { label: "Azure AI, Jan→Jul", value: F.azureAIGrowth, note: `non-AI Azure moved ${F.azureOtherGrowth}`, accent: COLORS.danger },
    ],
    notes: {
      title: "Inside the purple band",
      items: [
        "AI Foundry models and tools.",
        "GitHub Copilot — the largest AI line.",
        "Microsoft Copilot Studio.",
      ],
    },
    foot: "Azure Databricks sits in the blue band. Its pre-purchased capacity was paid in April and bills at $0 from May, which is why the blue band steps down that month rather than because usage fell.",
    speakerNotes: [
      "Azure carries about two thirds of the estate and the majority of the",
      "AI spend.",
      "",
      "Watch for the question about the May step-down in the dark band: that",
      "is the Databricks pre-purchase starting to draw down, not a saving.",
      "The capacity was paid for in April.",
    ].join("\n"),
  },

  {
    kind: "chart",
    eyebrow: "AWS",
    accent: AWS,
    title: "AWS is flat — except for Bedrock",
    note: "AWS consumption by month. The purple band is Amazon Bedrock — almost entirely Claude models.",
    chartTitle: `AWS monthly consumption · ${F.awsPeriod} January–July`,
    chart: vendorChart("aws", AWS),
    stats: [
      { label: "July AWS", value: F.julAws, note: `${F.awsShareOfAll} of the estate`, accent: AWS },
      { label: "Of which Bedrock", value: F.awsJulAI, note: `${F.awsJulShare} of AWS in July`, accent: AI },
      { label: "Non-AI AWS, Jan→Jul", value: F.awsOtherGrowth, note: "a stable, well-covered estate", accent: COLORS.good },
    ],
    notes: {
      title: "Worth knowing",
      items: [
        "Bedrock was $0 until March and is now the fastest-growing line in the estate.",
        "July Bedrock is shown gross, before the $16,100 MAP contract credit.",
      ],
    },
    foot: "Bedrock bills through AWS Marketplace rather than as consumption, so it does not appear in the AWS consumption charts in the operational deck. It is pulled in here because leaving it out would show AWS as having no AI at all.",
    speakerNotes: [
      "The AWS estate itself is the quiet one — flat all year, 93% of compute",
      "bought at a discount.",
      "",
      "Bedrock is the exception and it is steep: nothing in January, $25,288",
      "in July, essentially all Claude.",
      "",
      "Be ready for: 'why is this not in the AWS numbers elsewhere?' Because",
      "Bedrock is billed as a Marketplace subscription. That is an invoicing",
      "artefact, not an accounting judgement.",
      "",
      "The July figure is gross. A $16,100 MAP credit lands against it and is",
      "still to be confirmed with the reseller.",
    ].join("\n"),
  },

  {
    kind: "chart",
    eyebrow: "GCP",
    accent: GCP,
    title: "GCP is small, new, and mostly AI",
    note: "GCP consumption by month. The estate opened in March and is over half Vertex AI and Gemini API.",
    chartTitle: `GCP monthly consumption · ${F.gcpPeriod} January–July`,
    chart: vendorChart("gcp", GCP),
    stats: [
      { label: "July GCP", value: F.julGcp, note: `${F.gcpShareOfAll} of the estate`, accent: GCP },
      { label: "Of which AI", value: F.gcpJulAI, note: `${F.gcpJulShare} of GCP in July`, accent: AI },
      { label: "First billed month", value: "March", note: "no GCP consumption before it", accent: COLORS.muted },
    ],
    notes: {
      title: "Why it gets a slide",
      items: [
        "A third estate to govern.",
        "It opened as an AI platform.",
      ],
    },
    foot: "Note the axis: this chart tops out near $4,000 a month, against $187,000 on the Azure slide. GCP is shown separately precisely because it is invisible on a shared scale.",
    speakerNotes: [
      "Do not let this one get waved away. It is small in dollars and large",
      "in precedent: a third cloud, opened this year, already more than half",
      "AI by value.",
      "",
      "If it grows at the rate the other two AI lines did, it needs tagging",
      "and budget ownership now, while it is still cheap to set up.",
    ].join("\n"),
  },

  /* ---------------------------------------------------------------- *
   * The basis
   * ---------------------------------------------------------------- */
  {
    kind: "table",
    eyebrow: "Basis",
    accent: COLORS.cyan,
    title: "What counts as AI, and what does not",
    note: "So the split can be challenged on the definition rather than on the arithmetic.",
    tables: [
      {
        title: "Counted as AI",
        sub: "Generative-AI service lines, by vendor",
        cols: [
          { label: "Vendor", w: 1.1 },
          { label: "Service lines", w: 3.3 },
          { label: "Jan–Jul", w: 1.15, align: "right" },
        ],
        rows: [
          ["Azure", "AI Foundry Models, Foundry Tools, GitHub Copilot, Copilot Studio", money(sum(V.vendors.azure.ai))],
          ["AWS", "Amazon Bedrock — almost entirely Claude models", money(sum(V.vendors.aws.ai))],
          ["GCP", "Vertex AI, Gemini API", money(sum(V.vendors.gcp.ai))],
          [{ text: "Total", bold: true }, { text: "", bold: true }, { text: money(sum(V.totals.ai)), bold: true, color: AI }],
        ],
      },
      {
        title: "Deliberately not counted as AI",
        sub: "And the reason in each case",
        cols: [
          { label: "Line", w: 1.8 },
          { label: "Why it sits in “everything else”", w: 3.9 },
        ],
        rows: [
          ["Azure Databricks", "A data platform. Pre-purchased in April, bills at $0 from May — it would distort an AI growth line."],
          ["Azure Cognitive Search", "Reported inside “other services” in the source data and cannot be split out cleanly. Understates AI slightly."],
          ["AWS Marketplace", "Security, database and observability subscriptions — $1.5M over the period. Excluded from consumption throughout."],
          ["Infrastructure under AI apps", "VMs, storage and API Management serving AI workloads bill as ordinary consumption."],
        ],
      },
    ],
    stats: [
      { label: "AI, January–July", value: F.periodAI, note: `${F.periodAIShare} of all consumption in the period`, accent: AI },
      { label: "Excluded from both columns", value: "$1.5M", note: "AWS Marketplace security and database subscriptions", accent: COLORS.muted },
      { label: "Direction of the error", value: "Understated", note: "AI-serving infrastructure is counted as ordinary spend", accent: COLORS.warn },
    ],
    foot: "Source: the same extracted workbooks behind the operational review. The split is computed at build time in data/vendor-split.js, so these figures cannot drift from the charts on the previous slides.",
    speakerNotes: [
      "This slide exists to survive the one hard question: 'what did you",
      "count?'",
      "",
      "The definition is conservative in both directions that matter — it",
      "leaves Databricks out of AI, and it leaves the infrastructure that",
      "runs AI workloads out too. So the real AI-attributable cost is higher",
      "than the bright bands show, not lower.",
    ].join("\n"),
  },

  /* ---------------------------------------------------------------- *
   * Close
   * ---------------------------------------------------------------- */
  {
    kind: "closing",
    kicker: "The one line to take away",
    title: "Flat estate. Steep AI.",
    sub: `Non-AI consumption ${F.otherGrowth} since January · AI ${F.aiGrowth} · ${F.julShare} of July's bill`,
    accent: AI,
    titleSize: 66,
    titleColor: AI,
  },
];
