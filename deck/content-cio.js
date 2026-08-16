/**
 * Combined CIO briefing — the merge of "Harel Cloud Cost · CIO v33" and the
 * Jan–Jul 2026 operational FinOps review.
 *
 * Editorial rules this deck follows, in case you re-cut it:
 *
 *  1. One spine, one basis. The narrative runs on the CIO deck's run-rate
 *     framing. Where a figure comes from the seven-month operational data
 *     instead, the slide says so on its face.
 *  2. No story is told twice. Where both decks covered the same ground, the
 *     sharper version won and the other moved to the appendix.
 *  3. Every number that appears twice in the deck must reconcile, or the
 *     slide explains why it does not.
 *
 * The appendix at the end is reused straight from `content.js` — the same
 * slide objects, so the operational detail can never drift out of step with
 * the review deck it came from.
 */

const { COLORS } = require("./lib/theme");
const operational = require("./content");

const AWS = COLORS.aws;
const AZURE = COLORS.azure;
const GCP = COLORS.gcp;
const AI = COLORS.ai;

/** Slides lifted verbatim from the operational review, in appendix order. */
const APPENDIX_PICKS = [2, 3, 7, 8, 10, 13, 14, 24, 25, 30, 31, 33];

const core = [
  /* ================================================================ *
   * Opening
   * ================================================================ */
  {
    kind: "section",
    kicker: "Harel Insurance · Cloud FinOps",
    title: "Cloud spend, the AI shift,\nand what we have taken out",
    sub: "May–July 2026 run-rate, against seven months of consumption · CIO briefing",
    accent: COLORS.cyan,
  },

  {
    kind: "hero",
    eyebrow: "Where we are",
    accent: COLORS.cyan,
    title: "Today's run-rate",
    note: "July annualised, all three clouds. A pace, not a budget.",
    value: "$3.4M",
    valueLabel: "run-rate today  ·  July consumption × 12, across Azure, AWS and GCP",
    delta: "up $641K in three months  ·  +23.2%",
    deltaColor: COLORS.danger,
    parts: [
      { label: "Azure", value: "$186,541", note: "66% of the bill", accent: AZURE },
      { label: "AWS", value: "$92,930", note: "33% of the bill", accent: AWS },
      { label: "GCP", value: "$3,850", note: "1.4% of the bill", accent: GCP },
    ],
    pointsTitle: "What moved in three months",
    points: [
      "Azure added $41,287 a month — AI and data platforms are two thirds of that increase.",
      "AWS added $9,868 a month of usage, before Marketplace, which is reported separately.",
      "GCP is a rounding error in absolute terms and the fastest-growing line in percentage terms.",
    ],
    foot: "Consumption only — Marketplace purchases are excluded here and reported separately. AWS is shown gross of the $16,100 July credit, which is explained later in this deck.",
  },

  {
    kind: "chart",
    eyebrow: "Where this goes",
    accent: COLORS.danger,
    title: "December is between $3.4M and $5.8M",
    note: "Three honest readings of the same data. Which one lands depends on whether May–July was a trend or a rebound.",
    chartTitle: "Monthly spend to December, on each basis",
    chart: {
      type: "line",
      legend: true,
      colors: [COLORS.text, COLORS.danger, COLORS.warn],
      inline: {
        cats: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        series: [
          { name: "Actual", vals: [229908, 257413, 283322, null, null, null, null, null] },
          { name: "Projected — May–Jul rates", vals: [null, null, 283322, 314660, 349617, 388652, 432284, 481097] },
          { name: "Projected — Jan–Jul rates", vals: [null, null, 283322, 292400, 301800, 311500, 321500, 333900] },
        ],
      },
    },
    stats: [
      { label: "If May–Jul repeats", value: "$5.78M", note: "+70% on today — the v33 projection", accent: COLORS.danger },
      { label: "On the seven-month trend", value: "$4.01M", note: "+18% on today — Azure at 3.0%/mo", accent: COLORS.warn },
      { label: "If July simply repeats", value: "$3.40M", note: "flat — no growth at all", accent: COLORS.good },
    ],
    foot: "The $5.8M figure annualises Azure growing 13.3% a month, measured May to July. Over the full seven months Azure has grown 3.0% a month — May was a local low, so the short window reads a rebound as a trend. Aug and Sep will tell us which it is. Planning against the middle case is the defensible position.",
  },

  /* ================================================================ *
   * Part one — the numbers
   * ================================================================ */
  {
    kind: "section",
    kicker: "Part one",
    title: "What the money is doing",
    sub: "Where it sits, where it grew, and one number that did not add up",
    accent: AZURE,
  },

  {
    kind: "chart",
    eyebrow: "Azure · the estate",
    accent: AZURE,
    title: "Spend is climbing, and AI is climbing faster",
    note: "Invoiced totals from Azure Cost Management, Commvault annual prepayment excluded so the trend reads as run-rate.",
    chartTitle: "Monthly invoiced spend",
    chart: {
      type: "line",
      legend: false,
      colors: [AZURE],
      inline: {
        cats: ["May 2026", "Jun 2026", "Jul 2026"],
        series: [{ name: "Invoiced", vals: [145254, 168421, 186541] }],
      },
    },
    stats: [
      { label: "Three-month total", value: "$500,216", note: "+28.4% over the three months", accent: COLORS.danger },
      { label: "AI and data platforms", value: "$192,935", note: "+62.5% — twice the pace of the bill", accent: AI },
      { label: "AI share of consumption", value: "32.1%", note: "from 26.4% in May", accent: COLORS.warn },
    ],
    foot: "AI is growing at more than twice the rate of everything else. That is the shift this briefing is about — not the absolute number, but the mix moving underneath it.",
  },

  {
    kind: "chart",
    eyebrow: "Context · seven months",
    accent: COLORS.cyan,
    title: "The same estate, over seven months",
    note: "The operational review covers January onwards. It changes how the last three months read.",
    chartTitle: "Monthly consumption by cloud, Jan–Jul 2026",
    chart: {
      type: "line",
      legend: true,
      colors: [AZURE, AWS, GCP],
      inline: {
        cats: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        series: [
          { name: "Azure", vals: [156990, 135742, 165199, 152577, 152263, 167406, 186917] },
          { name: "AWS", vals: [77126, 82582, 95860, 81929, 83062, 86581, 92930] },
          { name: "GCP", vals: [0, 0, 396, 440, 1449, 2220, 3707] },
        ],
      },
    },
    stats: [
      { label: "Consumption, Jan–Jul", value: "$1.71M", note: "≈ $2.9M annualised", accent: COLORS.cyan },
      { label: "March to July", value: "+8.5%", note: "four months, barely moved", accent: COLORS.good },
      { label: "May to July", value: "+19.7%", note: "the window v33 projects from", accent: COLORS.danger },
    ],
    foot: "March was already $261K a month. July is $284K. The three-month view starts at April–May, the softest point of the year, which is why it reads so steep. Both are true; only one is a trend.",
  },

  {
    kind: "chart",
    eyebrow: "All providers · AI",
    accent: AI,
    title: "Where AI spend actually sits",
    note: "Five platforms, three clouds, bought separately. Stacked to total AI spend per month.",
    chartTitle: "AI platform spend by month — Azure and GCP platforms",
    chart: {
      type: "stacked",
      inline: {
        cats: ["May 2026", "Jun 2026", "Jul 2026"],
        series: [
          { name: "Azure AI Services", vals: [16933, 25370, 23301] },
          { name: "GitHub Copilot", vals: [4760, 11445, 13460] },
          { name: "Copilot Studio (Cowork)", vals: [80, 0, 8920] },
          { name: "Google Vertex AI", vals: [366, 958, 1069] },
        ],
      },
    },
    stats: [
      { label: "Azure AI Services", value: "$65,604", note: "+38% May to Jul", accent: AI },
      { label: "GitHub Copilot", value: "$29,664", note: "+183% May to Jul", accent: COLORS.danger },
      { label: "AWS Bedrock — Claude", value: "$25,288", note: "July alone, gross of MAP credit", accent: AWS },
      { label: "Copilot Studio", value: "$9,000", note: "first full month in July", accent: COLORS.warn },
    ],
    foot: "AWS Bedrock is not in the chart because it is not split by month on the Azure enrollment. Its July figure is shown here at the gross $25,288 — see the reconciliation two slides on.",
  },

  {
    kind: "table",
    eyebrow: "Azure · AI deep dive",
    accent: AI,
    title: "Most of the AI bill is not models",
    note: "$152,402 of AI meter spend across tagged projects. Each project's split between models and the infrastructure billed under the same tag.",
    tables: [
      {
        title: "AI spend by project",
        sub: "Three-month totals, with the infrastructure share of each tag",
        cols: [
          { label: "Project", w: 2.0 },
          { label: "AI meter spend", w: 1.6, align: "right" },
          { label: "Share of AI", w: 1.3, align: "right" },
          { label: "Largest driver inside the tag", w: 3.6 },
        ],
        rows: [
          ["DataCloud", "$43,840", "28.8%", "Azure Databricks 47.3%"],
          ["BI", "$28,358", "18.6%", { text: "Infrastructure 69.3%", color: COLORS.danger }],
          ["Solugen", "$23,855", "15.7%", "Foundry Models 61.1%"],
          ["AIFactory", "$22,374", "14.7%", { text: "Infrastructure 64.8%", color: COLORS.danger }],
          ["Actuary", "$13,887", "9.1%", "Azure Databricks 55.3%"],
          ["Research", "$12,090", "7.9%", { text: "Infrastructure 55.8%", color: COLORS.danger }],
        ],
      },
    ],
    stats: [
      { label: "Three of the top six", value: "> 50%", note: "spend more on infrastructure than on models", accent: COLORS.danger },
      { label: "AIFactory tag", value: "$63,609", note: "of which 64.8% is infrastructure", accent: COLORS.warn },
      { label: "Largest single line", value: "$17,311", note: "API Management — ahead of Foundry Models", accent: COLORS.cyan },
    ],
    foot: "Not automatically wrong — inference needs somewhere to run — but it is the part of the AI bill that right-sizing can actually move, and it is the part nobody is looking at.",
  },

  {
    kind: "reconcile",
    eyebrow: "AWS · the $16,100 question",
    accent: AWS,
    title: "The undocumented credit, identified",
    note: "v33 flagged a $16,100.27 charge on ai-factory-dev that was reversed and never itemised. Cross-referencing the operational data identifies it exactly.",
    terms: [
      { label: "Regular AWS usage, July", value: "$92,930", note: "service usage as metered", accent: COLORS.text },
      { label: "Credit applied", value: "$16,100", op: "−", note: "MAP contract credit, ai-factory-dev", accent: AWS },
      { label: "Invoiced by Comm-IT", value: "$76,830", op: "=", note: "what we actually paid", accent: COLORS.good },
    ],
    tableTitle: "Where the $16,100.27 sits — July Bedrock consumption, two sources",
    table: {
      cols: [
        { label: "Claude model, July 2026", w: 3.2 },
        { label: "Operational data (gross)", w: 2.3, align: "right" },
        { label: "v33 CIO deck (net)", w: 2.1, align: "right" },
        { label: "Difference", w: 1.7, align: "right" },
        { label: "", w: 3.03 },
      ],
      rows: [
        ["Claude Opus 4.8", "$11,361.86", "—", { text: "$11,361.86", color: COLORS.aws }, "entire line reversed"],
        ["Claude Opus 4.6", "$9,873.22", "$5,134.81", { text: "$4,738.41", color: COLORS.aws }, "part of the line reversed"],
        ["Opus 4.7 · Opus 5 · Sonnet 4.6 · Haiku 4.5 · Sonnet 4.5", "$3,362.97", "$3,362.97", { text: "—", color: COLORS.muted }, "identical in both"],
        [
          { text: "Total", bold: true },
          { text: "$25,288.33", bold: true },
          { text: "$9,188.06", bold: true },
          { text: "$16,100.27", bold: true, color: COLORS.good },
          { text: "matches the credit to the cent", color: COLORS.good },
        ],
      ],
    },
    stats: [
      { label: "Identified", value: "$16,100.27", note: "Opus 4.8 in full, plus part of Opus 4.6", accent: COLORS.good },
      { label: "Attributed to", value: "ai-factory-dev", note: "88.6% of all July AWS credits", accent: AWS },
      { label: "Action", value: "Confirm", note: "raise with Comm-IT, then close the v33 item", accent: COLORS.cyan },
    ],
    foot: "The reversed charge is Claude Opus 4.8 in full plus part of Opus 4.6, on ai-factory-dev — and the operational deck names the reason: a MAP contract credit. v33 concluded it was 'not a discount on Claude consumption'; the line-level match says otherwise. Worth confirming with Comm-IT before it is treated as settled, but it is no longer an open mystery.",
  },

  {
    kind: "chart",
    eyebrow: "Marketplace",
    accent: AWS,
    title: "Marketplace dwarfs the usage underneath it",
    note: "None of this is consumption. Security vendors bought, replaced and retired inside the year.",
    chartTitle: "AWS Marketplace purchases by product, Jan–Jul total",
    chart: { id: "chart5", type: "rank", top: 9 },
    stats: [
      { label: "AWS Marketplace, Jan–Jul", value: "auto:total", note: "2.6× regular AWS usage", accent: AWS },
      { label: "Azure Marketplace, Jan–Jul", value: "auto:total:chart9", note: "mostly the Databricks prepayment", accent: AZURE },
      { label: "Recurring, of all of it", value: "~$14K/mo", note: "MongoDB Atlas and the small tools", accent: COLORS.good },
    ],
    foot: "Splunk, CrowdStrike and Trellix land in Q1; TrendAI and Fortinet in June and gone by July; Cortex replaces them. Treating Marketplace as part of the cloud bill makes the trend unreadable — it belongs on its own line in the budget.",
  },

  {
    kind: "chart",
    eyebrow: "GCP",
    accent: GCP,
    title: "Small, and entirely AI",
    note: "The smallest provider by a wide margin, and the fastest growing. All three statements reconcile to their invoices exactly.",
    chartTitle: "Monthly spend by service",
    chart: { id: "chart31", type: "stacked", top: 6 },
    stats: [
      { label: "GCP, July", value: "$3,707", note: "1.4% of the total cloud bill", accent: GCP },
      { label: "Vertex AI, July", value: "$2,359", note: "now the largest GCP service", accent: AI },
      { label: "Everything else", value: "flat", note: "Compute, networking and DNS unchanged", accent: COLORS.muted },
    ],
    foot: "Vertex AI passed Compute Engine in July. Every dollar of GCP growth this year is AI — which makes it the cleanest illustration of the shift happening more expensively elsewhere.",
  },

  /* ================================================================ *
   * Part two — the gap
   * ================================================================ */
  {
    kind: "section",
    kicker: "Part two",
    title: "What waiting costs",
    sub: "Three gaps that are already priced, and already being paid",
    accent: COLORS.warn,
  },

  {
    kind: "table",
    eyebrow: "Coverage",
    accent: COLORS.warn,
    title: "Azure buys 59% at a discount — AWS buys 93%",
    note: "How each cloud's compute is actually purchased — the single biggest lever on unit cost.",
    tables: [
      {
        title: "AWS",
        sub: "Monthly cost by purchase option",
        cols: [
          { label: "Purchase option", w: 2.6 },
          { label: "Total cost", w: 1.5, align: "right" },
          { label: "Ratio", w: 1.1, align: "right" },
        ],
        rows: [
          ["Spot", "$16,559", { text: "47%", color: COLORS.good }],
          ["Compute Savings Plan", "$16,364", { text: "46%", color: COLORS.good }],
          ["On-Demand", "$2,502", { text: "7%", color: COLORS.danger }],
          [{ text: "Total", bold: true }, { text: "$35,425", bold: true }, { text: "100%", bold: true, color: COLORS.muted }],
        ],
      },
      {
        title: "Azure",
        sub: "Monthly cost by purchase option",
        cols: [
          { label: "Purchase option", w: 2.6 },
          { label: "Total cost", w: 1.5, align: "right" },
          { label: "Ratio", w: 1.1, align: "right" },
        ],
        rows: [
          ["On-Demand", "$21,690", { text: "41%", color: COLORS.danger }],
          ["Reservation", "$21,463", { text: "40%", color: COLORS.good }],
          ["Compute Savings Plan", "$9,424", { text: "18%", color: COLORS.good }],
          ["Spot", "$737", { text: "1%", color: COLORS.muted }],
          [{ text: "Total", bold: true }, { text: "$53,314", bold: true }, { text: "100%", bold: true, color: COLORS.muted }],
        ],
      },
    ],
    stats: [
      { label: "Azure on-demand", value: "$21,690", note: "per month, at list price", accent: COLORS.danger },
      { label: "If Azure matched AWS", value: "~$7,600", note: "estimated monthly saving at 93% coverage", accent: COLORS.good },
      { label: "Annualised", value: "~$91,000", note: "on compute alone, nothing switched off", accent: COLORS.good },
    ],
    foot: "SAP is the obvious first candidate: it is the largest Azure workload, it has not moved more than a few percent in seven months, and it is almost entirely virtual machines — the flattest, most reservable profile in the estate.",
  },

  {
    kind: "bigStat",
    eyebrow: "Databricks",
    accent: AI,
    title: "$504,000 paid in April. 18% of it used.",
    note: "A three-year, 600,000 DBU-hour pre-purchase made on 28 April 2026.",
    value: "18%",
    text: "cumulative utilisation of the Databricks commitment as at July. Databricks compute bills at $0 because it draws against a balance already paid — so it disappears from every consumption report while the money is already gone.",
    stats: [
      { label: "Committed", value: "$504,000", note: "Azure P3 pre-purchase, 28 Apr 2026", accent: AI },
      { label: "Term", value: "3 years", note: "600,000 DBU hours", accent: COLORS.muted },
      { label: "Drawn to July", value: "$88,666", note: "consumption, not new cash", accent: COLORS.cyan },
      { label: "Infra underneath", value: "$63,501", note: "May–Jul — this part still bills", accent: COLORS.danger },
    ],
    points: [
      "At the current pace the commitment finishes its three-year term substantially unused — the choice is to drive utilisation up or to renegotiate.",
      "The VMs, networking and storage that Databricks runs on are not covered by the pre-purchase and cost $63,501 across May to July alone.",
      "This is invisible in a consumption-only view, which is exactly why it belongs in a CIO briefing rather than an operations report.",
    ],
  },

  {
    kind: "bigStat",
    eyebrow: "Attribution",
    accent: COLORS.danger,
    title: "A quarter of the bill has no owner",
    note: "From the Project tag on each resource, Azure enrollment.",
    value: "23.4%",
    text: "of July's Azure spend carries no project tag — up from 8.4% in May. Nearly a quarter of the bill cannot be attributed to a team, which means it cannot be charged back, questioned, or defended.",
    stats: [
      { label: "Untagged, July", value: "23.4%", note: "was 8.4% in May", accent: COLORS.danger },
      { label: "Untagged AI spend", value: "$51,381", note: "of $96,843 untagged in total", accent: AI },
      { label: "Cost centre field", value: "empty", note: "on every line of the enrollment", accent: COLORS.muted },
    ],
    points: [
      "The untagged share tripled in three months — it is getting worse, not better, and it is worst in exactly the AI workloads that are growing fastest.",
      "Tagging is the dependency under everything else: no chargeback, no per-consumer budget, and no gateway quota can be enforced without it.",
    ],
  },

  /* ================================================================ *
   * Part three — what we have taken out
   * ================================================================ */
  {
    kind: "section",
    kicker: "Part three",
    title: "What we have already taken out",
    sub: "$278,868 banked, $193,000 identified and waiting",
    accent: COLORS.good,
  },

  {
    kind: "table",
    eyebrow: "Implemented",
    accent: COLORS.good,
    title: "$278,868 of annual saving, already actioned",
    note: "Delivered during 2026. Annualised figures.",
    tables: [
      {
        title: "Banked savings, by type",
        cols: [
          { label: "Savings type", w: 4.2 },
          { label: "Annual saving", w: 1.6, align: "right" },
        ],
        rows: [
          ["Decommission North Europe", { text: "$70,452", color: COLORS.good }],
          ["VM reserved instance purchase", { text: "$66,783", color: COLORS.good }],
          ["Savings plan purchase", { text: "$65,335", color: COLORS.good }],
          ["Remove unnecessary VMs", { text: "$28,105", color: COLORS.good }],
          ["Idle unattached disks", { text: "$20,576", color: COLORS.good }],
          ["RI renewal — blob storage", { text: "$9,432", color: COLORS.good }],
          ["RDS reserved instance purchase", { text: "$7,944", color: COLORS.good }],
          ["Retire two unused SQL instances on expiring RI", { text: "$4,563", color: COLORS.good }],
          ["EKS extended support 1.33 — preprod", { text: "$4,526", color: COLORS.good }],
          ["App Service — reserved instance", { text: "$712", color: COLORS.good }],
          ["RI refund to reach 100% utilisation", { text: "$440", color: COLORS.good }],
        ],
      },
    ],
    stats: [
      { label: "Total annual savings", value: "$278,868", note: "already implemented", accent: COLORS.good, big: true },
      { label: "Against annualised spend", value: "9.5%", note: "of ~$2.9M consumption", accent: COLORS.cyan },
      { label: "Largest action", value: "$70,452", note: "North Europe decommission — $5,871/mo removed", accent: AZURE },
      { label: "Commitment-based", value: "$132,118", note: "reservations and savings plans", accent: COLORS.muted },
    ],
    foot: "This is the half of the story the previous briefing did not tell: the bill grew 23% in three months, and it would have grown considerably more without these.",
  },

  {
    kind: "table",
    eyebrow: "Identified",
    accent: COLORS.warn,
    title: "$193,000 more, costed and waiting on a decision",
    note: "Identified, not yet implemented. Annualised figures.",
    tables: [
      {
        title: "Azure",
        sub: "Annual saving if implemented",
        cols: [
          { label: "Recommendation", w: 3.5 },
          { label: "Annual saving", w: 1.45, align: "right" },
        ],
        rows: [
          ["Premium disks", { text: "$44,592", color: COLORS.good }],
          ["Schedule shutdown for 24/7 VMs", { text: "$36,741", color: COLORS.good }],
          ["VM reserved instance purchase", { text: "$26,758", color: COLORS.good }],
          ["VM right-size", { text: "$19,854", color: COLORS.good }],
          ["RI — Azure Database for PostgreSQL", { text: "$17,037", color: COLORS.good }],
          ["Idle reserved disks", { text: "$13,464", color: COLORS.good }],
          ["Remove unnecessary VMs", { text: "$13,147", color: COLORS.good }],
          ["Idle unattached disks", { text: "$7,656", color: COLORS.good }],
          ["RI — Redis Cache", { text: "$2,664", color: COLORS.good }],
          ["SQL DB right-size", { text: "$2,129", color: COLORS.good }],
          ["VPN gateway — check necessity", { text: "$794", color: COLORS.good }],
        ],
      },
      {
        title: "AWS",
        sub: "Annual saving if implemented",
        cols: [
          { label: "Recommendation", w: 3.5 },
          { label: "Annual saving", w: 1.45, align: "right" },
        ],
        rows: [
          ["EKS extended support 1.33 — prod", { text: "$4,526", color: COLORS.good }],
          ["SageMaker — check necessity", { text: "$3,420", color: COLORS.good }],
        ],
      },
    ],
    stats: [
      { label: "Total potential", value: "$193K", note: "annualised, both clouds", accent: COLORS.warn },
      { label: "Plus the coverage gap", value: "~$91K", note: "Azure on-demand at AWS's discount rate", accent: COLORS.warn },
      { label: "Banked plus identified", value: "$563K", note: "≈ 19% of annualised consumption", accent: COLORS.good },
    ],
    foot: "None of this changes what runs — it changes how it is bought and how long it stays on. The ask is a decision on the top four items, which are 66% of the value.",
  },

  /* ================================================================ *
   * Part four — governance
   * ================================================================ */
  {
    kind: "section",
    kicker: "Part four",
    title: "Stopping it recurring",
    sub: "Optimisation is a one-off. Governance is what stops the next $600K",
    accent: AI,
  },

  {
    kind: "flow",
    eyebrow: "The mechanism",
    accent: AI,
    title: "One gateway for every AI request",
    note: "The enforcement point, not a reporting layer bolted on afterwards — its logs are the financial record.",
    left: {
      heading: "Applications and developers",
      items: ["Business applications", "Copilots and assistants", "Autonomous agents", "Data science", "Third-party SaaS"],
    },
    centre: {
      title: "AI Command Center",
      sub: "Policy enforcement point",
      chips: ["Visibility", "Budgets per unit", "Owners", "Alerts", "Rate limits", "Token quotas", "Chargeback", "Executive dashboard"],
      foot: "Unauthorised or over-budget requests are filtered out. Governed, cost-allocated requests pass through.",
    },
    right: {
      heading: "Provider estate",
      items: ["Microsoft Copilot", "Azure AI Foundry", "AWS Bedrock", "Google Vertex AI", "Claude / OpenAI"],
    },
    foot: "Today every business unit buys AI separately, on shared keys, with no owner per consumer — which is why 23.4% of the bill has no name against it.",
  },

  {
    kind: "criteria",
    eyebrow: "Ownership",
    accent: AI,
    title: "Nothing reaches production unowned",
    note: "No AI workload goes live without explicit business ownership and financial allocation.",
    items: [
      { label: "Business owner", desc: "Accountability for the use case and its return." },
      { label: "Technical owner", desc: "Deployment, model choice and system health." },
      { label: "Budget", desc: "Maximum financial exposure, set before anything runs." },
      { label: "Rate limit", desc: "Prevents API spam, runaway loops and overload." },
      { label: "Token quota", desc: "Caps consumption per consumer, independent of budget." },
      { label: "Cost centre", desc: "Makes chargeback possible at month end." },
      { label: "Executive approval", desc: "Sign-off before launch, not after the first invoice." },
    ],
    banner: {
      title: "This is what makes shadow AI structurally impossible",
      text: "Applied at the gateway, these criteria mean an unowned or unfunded workload cannot obtain a key — so it never reaches a provider inside the enterprise network.",
    },
  },

  {
    kind: "steps",
    eyebrow: "Lifecycle",
    accent: COLORS.aws,
    title: "A gated path from proposal to report",
    note: "Four hard checkpoints sit before deployment. A request that cannot clear them does not reach a provider at all.",
    items: [
      { label: "Request", desc: "Use case, expected volume and business justification submitted." },
      { label: "Business approval", gate: true, desc: "Named business owner accepts the outcome and the cost." },
      { label: "Budget allocation", gate: true, desc: "Monthly envelope assigned against a cost centre." },
      { label: "Quota assignment", gate: true, desc: "Token quota and rate limit set per consumer." },
      { label: "Gateway policy", gate: true, desc: "Key issued, model tier pinned, policy applied." },
      { label: "Deployment", desc: "Workload goes live through the gateway, never around it." },
      { label: "Monitoring", desc: "Usage, anomalies and unit cost tracked continuously." },
      { label: "Executive report", desc: "Consumption, variance and value reported monthly." },
    ],
    foot: "Steps 02 to 05 are the gates. Everything after them is observation, not permission.",
  },

  {
    kind: "table",
    eyebrow: "Model policy",
    accent: AI,
    title: "Sonnet by default, Opus by exception",
    note: "GitHub Copilot model selection is the one AI lever that needs no new platform — only a policy.",
    tables: [
      {
        title: "Model pricing and intended use",
        sub: "Promotional pricing, valid through 31 August 2026",
        cols: [
          { label: "Model", w: 2.1 },
          { label: "Input / 1M", w: 1.15, align: "right" },
          { label: "Output / 1M", w: 1.25, align: "right" },
          { label: "Relative cost", w: 1.3, align: "right" },
          { label: "Recommended usage", w: 2.6 },
        ],
        rows: [
          ["Claude Sonnet 5", "$2", "$10", { text: "Baseline", color: COLORS.good }, "Default model — routine coding, SQL, debugging, documentation"],
          ["Claude Opus 4.8", "$5", "$25", { text: "~2.5×", color: COLORS.warn }, "Complex tasks"],
          ["Claude Opus 5", "$5", "$25", { text: "~2.5×", color: COLORS.warn }, "Advanced reasoning"],
          ["Opus 4.8 Fast", "$10", "$50", { text: "~5×", color: COLORS.danger }, "Exception only"],
        ],
      },
    ],
    stats: [
      { label: "Available saving", value: "~60%", note: "on model token cost, routine work Opus → Sonnet", accent: COLORS.good },
      { label: "GitHub Copilot spend", value: "$29,664", note: "May–Jul, growing 183%", accent: COLORS.danger },
      { label: "AWS Bedrock, Opus share", value: "82.1%", note: "of AWS AI spend is Opus-class", accent: COLORS.warn },
      { label: "Promotional pricing ends", value: "31 Aug 2026", note: "reassess before the date, not after", accent: COLORS.muted },
    ],
    foot: "The same policy applies to Bedrock: 82% of AWS AI spend is Opus-class, and the model mix changes month to month — Opus 4.8 ran and stopped, Opus 5 appeared in July. That is a policy gap, not a usage pattern.",
  },

  /* ================================================================ *
   * Close
   * ================================================================ */
  {
    kind: "table",
    eyebrow: "Next steps",
    accent: COLORS.cyan,
    title: "What we are asking for",
    note: "Open items, owners and status",
    tables: [
      {
        title: "Open items",
        cols: [
          { label: "#", w: 0.45, align: "center" },
          { label: "Item", w: 2.9 },
          { label: "Detail", w: 5.8 },
          { label: "Status", w: 1.15, align: "center" },
          { label: "Owner", w: 1.7 },
        ],
        rowH: 0.42,
        fontSize: 9.5,
        rows: [
          ["1", "Savings and efficiency programme", "Deliver the Cloud FinOps savings plan — right-sizing, auto-shutdown, reserved instances", { text: "Planned", color: COLORS.warn }, "Infrastructure Division"],
          ["2", "WIV.AI rollout (free tier)", "Deploy the WIV.AI platform for governance, cost and usage monitoring", { text: "Planned", color: COLORS.warn }, "Ariel Oral"],
          ["3", "Tagging by service", "Complete resource tagging by Service, Application, Cost Center and Environment for chargeback and showback, including AI Gateway and AWS Bedrock", { text: "In progress", color: COLORS.cyan }, "Ariel Oral"],
          ["4", "AWS FinOps agent", "Automated cost analysis, savings recommendations and AWS service optimisation", { text: "Planned", color: COLORS.warn }, "Ariel"],
          ["5", "Databricks commitment optimisation", "Raise DBU commitment utilisation from 18%, track it monthly, and tune Classic vs Serverless", { text: "To scope", color: COLORS.muted }, "—"],
        ],
      },
    ],
    stats: [
      { label: "Decision needed", value: "4 items", note: "the $193K recommendation list", accent: COLORS.warn },
      { label: "Dependency", value: "Tagging", note: "item 3 blocks chargeback and gateway quotas", accent: COLORS.cyan },
      { label: "To confirm", value: "$16,100", note: "MAP credit, with Comm-IT", accent: AWS },
    ],
  },

  /* ================================================================ *
   * Appendix
   * ================================================================ */
  {
    kind: "section",
    kicker: "Appendix",
    title: "The operational detail",
    sub: "Cost centre and project breakdowns, January to July 2026",
    accent: COLORS.muted,
  },
];

/**
 * Sign-off, after the appendix: the words only, centred and large, in the
 * deck's signature cyan rather than the body near-white.
 */
const closing = {
  kind: "closing",
  title: "Thank you",
  titleSize: 110,
  titleColor: COLORS.cyan,
  accent: COLORS.cyan,
};

module.exports = [...core, ...APPENDIX_PICKS.map((i) => operational[i]), closing];
module.exports.coreLength = core.length;
