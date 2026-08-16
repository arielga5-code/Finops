/**
 * Slide content for the Harel Cloud FinOps deck (Jan–Jul 2026).
 *
 * This file holds *what the deck says*. `lib/theme.js` holds what it looks
 * like and `lib/components.js` holds how it is laid out. To change a headline,
 * a callout or the order of slides, edit here and re-run `npm run build`.
 *
 * Numbers marked `auto` are computed from `data/charts.json` at build time, so
 * they cannot drift away from the charts they sit next to. Where the source
 * deck stated a total that its own chart does not support, the chart wins and
 * the discrepancy is listed in README.md.
 *
 * Slide kinds
 *   section    — part divider
 *   agenda     — numbered card grid
 *   chart      — one chart + right-hand stat rail
 *   dualChart  — two charts side by side + stat strip
 *   table      — one or two tables + stat rail
 *   closing    — sign-off
 */

const { COLORS } = require("./lib/theme");

const AWS = COLORS.aws;
const AZURE = COLORS.azure;
const GCP = COLORS.gcp;
const AI = COLORS.ai;

module.exports = [
  /* ---------------------------------------------------------------- *
   * Agenda
   * ---------------------------------------------------------------- */
  {
    kind: "agenda",
    eyebrow: "Cloud FinOps · FY2026",
    title: "Meeting agenda",
    note: "Cloud infrastructure, DevOps and databases · Technology and Cyber Defence Division · July 2026",
    items: [
      { label: "AWS 2026", desc: "Usage review by account, service and billing entity", accent: AWS },
      { label: "Azure 2026", desc: "Usage review by cost centre, service and subscription", accent: AZURE },
      { label: "GCP 2026", desc: "Usage review by Google Cloud service", accent: GCP },
      { label: "FinOps AI Factory", desc: "Project-level AI consumption and model spend", accent: AI },
      { label: "FinOps project", desc: "Optimisation recommendations across both clouds", accent: COLORS.cyan },
      { label: "Savings achievements", desc: "What has already been implemented and banked", accent: COLORS.good },
      { label: "Next steps", desc: "Governance, tagging and future initiatives", accent: COLORS.muted },
    ],
  },

  /* ---------------------------------------------------------------- *
   * Part one — AWS
   * ---------------------------------------------------------------- */
  {
    kind: "section",
    kicker: "Part one · AWS",
    title: "AWS 2026",
    sub: "Cloud cost summary · January to July 2026",
    accent: AWS,
  },
  {
    kind: "chart",
    eyebrow: "AWS · Accounts",
    accent: AWS,
    title: "Consumption by account name",
    note: "Two payers sit under AWS. Charges exclude Marketplace purchases, which are shown separately.",
    chart: { id: "chart1", type: "stacked", top: 8 },
    chartTitle: "Monthly spend by linked account",
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total", note: "auto:change", accent: AWS },
      { label: "July", value: "auto:last", note: "after MAP credit", accent: COLORS.muted },
    ],
    notes: {
      title: "What moved",
      items: [
        "customers3-prod and horizon-prod both stepped up",
        "harel-org-02-root and aws-devTest-digital grew on EC2 and S3",
        "ai-factory-dev carries a MAP contract credit, which is why July nets down",
      ],
    },
  },
  {
    kind: "chart",
    eyebrow: "AWS · Services",
    accent: AWS,
    title: "Consumption by service name",
    note: "Same total, cut by service. Charges exclude Marketplace purchases.",
    chart: { id: "chart2", type: "stacked", top: 8 },
    chartTitle: "Monthly spend by service",
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total", note: "auto:change", accent: AWS },
      { label: "Largest service", value: "auto:top", note: "auto:topshare", accent: COLORS.cyan },
    ],
    notes: {
      title: "What moved",
      items: [
        "EC2 compute keeps rising month over month",
        "S3 storage and Glacier Deep Archive both up sharply",
        "The July dip in 'Other' is the MAP credit, not a usage change",
      ],
    },
  },
  {
    kind: "dualChart",
    eyebrow: "AWS · Billing account Harel IL",
    accent: AWS,
    title: "Harel IL billing account",
    note: "The second AWS payer, cut by service and by account.",
    charts: [
      { id: "chart4", title: "By service", type: "stacked", top: 6 },
      { id: "chart3", title: "By account", type: "stacked", top: 6 },
    ],
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total:chart3", note: "excludes Marketplace", accent: AWS },
      { label: "Largest account", value: "auto:top:chart3", note: "auto:topshare:chart3", accent: COLORS.cyan },
      { label: "Largest service", value: "auto:top:chart4", note: "auto:topshare:chart4", accent: COLORS.cyan },
    ],
    foot: "Increases concentrate in cloudops-network, customers3-prod and harel-org-02-root; on the service side in S3 Glacier Deep Archive, S3 API and RDS compute.",
  },
  {
    kind: "chart",
    eyebrow: "AWS · Marketplace",
    accent: AWS,
    title: "Marketplace purchases",
    note: "None of this is consumption. Security vendors bought, replaced and retired inside the period.",
    chart: { id: "chart5", type: "rank", top: 10 },
    chartTitle: "Purchases by product, Jan–Jul total",
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total", note: "2.6× regular AWS usage", accent: AWS },
      { label: "July", value: "auto:last", note: "Cortex is new in July", accent: COLORS.muted },
    ],
    foot: "Splunk, CrowdStrike and Trellix land in January; TrendAI and Fortinet in June and gone by July; Cortex replaces them. Only MongoDB Atlas and the small tools are genuinely recurring.",
  },

  /* ---------------------------------------------------------------- *
   * Part two — Azure
   * ---------------------------------------------------------------- */
  {
    kind: "section",
    kicker: "Part two · Azure",
    title: "Azure 2026",
    sub: "Cloud cost summary · January to July 2026",
    accent: AZURE,
  },
  {
    kind: "chart",
    eyebrow: "Azure · Cost centres",
    accent: AZURE,
    title: "Consumption by cost centre",
    note: "From the CostCenter tag. Charges exclude Marketplace purchases.",
    chart: { id: "chart6", type: "stacked", top: 8 },
    chartTitle: "Monthly spend by cost centre",
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total", note: "auto:change", accent: AZURE },
      { label: "Largest cost centre", value: "auto:top", note: "auto:topshare", accent: COLORS.cyan },
    ],
    notes: {
      title: "What moved",
      items: [
        "cloudops, datacloud and cloudit all up",
        "AI Factory is the fastest-growing centre in the period",
        "Risk Agility and Actuary fell back after Q1",
      ],
    },
  },
  {
    kind: "chart",
    eyebrow: "Azure · Services",
    accent: AZURE,
    title: "Consumption by service name",
    note: "Same total, cut by service. Charges exclude Marketplace purchases.",
    chart: { id: "chart8", type: "stacked", top: 8 },
    chartTitle: "Monthly spend by service",
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total", note: "auto:change", accent: AZURE },
      { label: "Largest service", value: "auto:top", note: "auto:topshare", accent: COLORS.cyan },
    ],
    notes: {
      title: "What moved",
      items: [
        "GitHub and Copilot Studio drive most of the July step-up",
        "Foundry Models and Foundry Tools rise every month from April",
        "Virtual Network, Log Analytics and Sentinel add to the base",
      ],
    },
  },
  {
    kind: "chart",
    eyebrow: "Azure · Marketplace",
    accent: AZURE,
    title: "Marketplace purchases",
    note: "Marketplace sits under the Shared Resources subscription.",
    chart: { id: "chart9", type: "rank", top: 8 },
    chartTitle: "Purchases by product, Jan–Jul total",
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total", note: "prepayments, not consumption", accent: AZURE },
      { label: "Databricks P3", value: "$504,000", note: "600,000 DBU pre-purchase", accent: AI },
      { label: "Commvault", value: "$22,031", note: "backup & recovery add-on, July", accent: COLORS.muted },
    ],
    foot: "A prepayment is cash out in one month and consumption over three years — read Databricks usage elsewhere in this deck as draw-down, not new spend.",
  },
  {
    kind: "dualChart",
    eyebrow: "Azure · DataCloud",
    accent: AZURE,
    title: "Cost centre — DataCloud",
    note: "The largest Azure cost centre, by service and by subscription.",
    charts: [
      { id: "chart11", title: "By service", type: "stacked", top: 6 },
      { id: "chart10", title: "By subscription", type: "stacked", top: 6 },
    ],
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total:chart10", note: "auto:change:chart10", accent: AZURE },
      { label: "Largest subscription", value: "auto:top:chart10", note: "auto:topshare:chart10", accent: COLORS.cyan },
      { label: "Largest service", value: "auto:top:chart11", note: "auto:topshare:chart11", accent: COLORS.cyan },
    ],
    foot: "Databricks drops to zero from May — that is the reserved capacity purchase taking over, not a workload stopping. Foundry Models and Foundry Tools take its place as the growth line.",
  },
  {
    kind: "chart",
    eyebrow: "Azure · Opswat",
    accent: AZURE,
    title: "Opswat new mail",
    note: "A flat, predictable workload — useful as a baseline against everything else in this section.",
    chart: { id: "chart12", type: "stacked", top: 5 },
    chartTitle: "Monthly spend by service",
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total", note: "auto:change", accent: AZURE },
      { label: "Largest service", value: "auto:top", note: "auto:topshare", accent: COLORS.cyan },
    ],
    foot: "Virtual machines and storage account for almost the whole cost, and neither has moved more than a few percent in seven months.",
  },
  {
    kind: "dualChart",
    eyebrow: "Azure · Actuary",
    accent: AZURE,
    title: "Cost centre — Actuary",
    note: "Spend fell hard after January when Databricks moved onto reserved capacity.",
    charts: [
      { id: "chart14", title: "By service", type: "stacked", top: 6 },
      { id: "chart13", title: "By subscription", type: "stacked", top: 4 },
    ],
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total:chart13", note: "auto:change:chart13", accent: AZURE },
      { label: "Largest subscription", value: "auto:top:chart13", note: "auto:topshare:chart13", accent: COLORS.cyan },
      { label: "Largest service", value: "auto:top:chart14", note: "auto:topshare:chart14", accent: COLORS.cyan },
    ],
    foot: "The remaining growth is virtual machines, Data Factory v2 and virtual network — infrastructure, not analytics.",
  },
  {
    kind: "dualChart",
    eyebrow: "Azure · SAP",
    accent: AZURE,
    title: "Cost centre — SAP",
    note: "The most stable large workload in the estate — and the best candidate for reservations.",
    charts: [
      { id: "chart16", title: "By service", type: "stacked", top: 5 },
      { id: "chart15", title: "By subscription", type: "stacked", top: 4 },
    ],
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total:chart15", note: "auto:change:chart15", accent: AZURE },
      { label: "Largest subscription", value: "auto:top:chart15", note: "auto:topshare:chart15", accent: COLORS.cyan },
      { label: "Largest service", value: "auto:top:chart16", note: "auto:topshare:chart16", accent: COLORS.cyan },
    ],
    foot: "Dev/Test costs more than Production every month of the period. Virtual machines are roughly three quarters of the bill and barely vary — a flat, reservable profile.",
  },
  {
    kind: "dualChart",
    eyebrow: "Azure · Cloud IT",
    accent: AZURE,
    title: "Cost centre — Cloud IT",
    note: "Shared platform services: network, monitoring and security for everyone else.",
    charts: [
      { id: "chart18", title: "By service", type: "stacked", top: 6 },
      { id: "chart17", title: "By subscription", type: "stacked", top: 5 },
    ],
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total:chart17", note: "auto:change:chart17", accent: AZURE },
      { label: "Largest subscription", value: "auto:top:chart17", note: "auto:topshare:chart17", accent: COLORS.cyan },
      { label: "Largest service", value: "auto:top:chart18", note: "auto:topshare:chart18", accent: COLORS.cyan },
    ],
    foot: "Log Analytics and Sentinel drive the March spike; virtual network and storage carry the underlying growth.",
  },
  {
    kind: "dualChart",
    eyebrow: "Azure · Risk Agility",
    accent: AZURE,
    title: "Cost centre — Risk Agility",
    note: "A workload that has been switched off in stages — compute is now effectively zero.",
    charts: [
      { id: "chart20", title: "By service", type: "stacked", top: 4 },
      { id: "chart19", title: "By subscription", type: "stacked", top: 2 },
    ],
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total:chart19", note: "auto:change:chart19", accent: AZURE },
      { label: "July", value: "auto:last:chart19", note: "storage only", accent: COLORS.good },
    ],
    foot: "January ran $12.8K of virtual machines. By June the VMs are gone and only storage remains — worth a decision on whether the residual data still needs to be retained.",
  },
  {
    kind: "dualChart",
    eyebrow: "Azure · Basasach",
    accent: AZURE,
    title: "Cost centre — Basasach",
    note: "Small and completely flat: an application platform plus its database.",
    charts: [
      { id: "chart22", title: "By service", type: "stacked", top: 4 },
      { id: "chart21", title: "By subscription", type: "stacked", top: 2 },
    ],
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total:chart21", note: "auto:change:chart21", accent: AZURE },
      { label: "Largest service", value: "auto:top:chart22", note: "auto:topshare:chart22", accent: COLORS.cyan },
    ],
    foot: "Production and Dev/Test cost almost exactly the same every month, which usually means Dev/Test is sized like Production rather than for its actual use.",
  },
  {
    kind: "dualChart",
    eyebrow: "Azure · ITSec",
    accent: AZURE,
    title: "Cost centre — ITSec",
    note: "Security tooling spread thinly across every subscription in the estate.",
    charts: [
      { id: "chart24", title: "By service", type: "stacked", top: 6 },
      { id: "chart23", title: "By subscription", type: "stacked", top: 6 },
    ],
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total:chart23", note: "auto:change:chart23", accent: AZURE },
      { label: "Largest service", value: "auto:top:chart24", note: "auto:topshare:chart24", accent: COLORS.cyan },
    ],
    foot: "Ten subscriptions carry ITSec charges. Virtual network and Azure DNS are two thirds of the total.",
  },
  {
    kind: "chart",
    eyebrow: "Azure · Investments",
    accent: AZURE,
    title: "Cost centre — Investments",
    note: "Databricks reserved capacity removed the compute line; infrastructure is now the whole cost.",
    chart: { id: "chart25", type: "stacked", top: 5 },
    chartTitle: "Monthly spend by service",
    stats: [
      { label: "Total, Feb–Jul", value: "auto:total", note: "smallest Azure cost centre", accent: AZURE },
      { label: "July", value: "auto:last", note: "virtual machines rising", accent: COLORS.danger },
    ],
    foot: "Databricks falls to zero from May on the reserved-instance purchase; virtual machines have tripled since April and are now the line to watch.",
  },
  {
    kind: "table",
    eyebrow: "Coverage · Purchase options",
    accent: COLORS.cyan,
    title: "2026 coverage by vendor",
    note: "How each cloud's compute is actually bought — the single biggest lever on unit cost.",
    tables: [
      {
        title: "AWS",
        sub: "Monthly cost by purchase option",
        accent: AWS,
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
        accent: AZURE,
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
      { label: "AWS discounted", value: "93%", note: "spot plus savings plan", accent: COLORS.good },
      { label: "Azure discounted", value: "59%", note: "reservation plus savings plan", accent: COLORS.warn },
      { label: "Azure on-demand", value: "$21,690", note: "per month, the addressable gap", accent: COLORS.danger },
    ],
    foot: "AWS buys 93% of its compute at a discount; Azure only 59%. Closing that gap is the largest single optimisation available in the estate.",
  },
  {
    kind: "dualChart",
    eyebrow: "Azure · Databricks",
    accent: AI,
    title: "Databricks reserved capacity",
    note: "600,000 DBU hours pre-purchased on 28 Apr 2026 (P3Y). Cumulative utilisation is 18%; actual Databricks cost since is $0.",
    charts: [
      { id: "chart30", title: "Supporting infrastructure — by service", type: "stacked", top: 5 },
      { id: "chart29", title: "Supporting infrastructure — by subscription", type: "stacked", top: 5 },
    ],
    stats: [
      { label: "Commitment", value: "600,000", note: "DBU hours, three-year term", accent: AI },
      { label: "Utilisation to July", value: "18%", note: "cumulative against the commitment", accent: COLORS.danger },
      { label: "Infrastructure, May–Jul", value: "auto:total:chart29", note: "the part still billed as usage", accent: COLORS.cyan },
    ],
    foot: "Databricks compute bills at $0 against the pre-purchase, but the VMs, networking and storage underneath it do not. At 18% cumulative utilisation the commitment is running behind its three-year pace.",
  },

  /* ---------------------------------------------------------------- *
   * Part three — GCP
   * ---------------------------------------------------------------- */
  {
    kind: "section",
    kicker: "Part three · GCP",
    title: "GCP 2026",
    sub: "Cloud cost summary · March to July 2026",
    accent: GCP,
  },
  {
    kind: "chart",
    eyebrow: "GCP · Services",
    accent: GCP,
    title: "Consumption by Google Cloud service",
    note: "The smallest provider by a wide margin, and the fastest growing.",
    chart: { id: "chart31", type: "stacked", top: 6 },
    chartTitle: "Monthly spend by service",
    stats: [
      { label: "Total, Mar–Jul", value: "auto:total", note: "auto:change", accent: GCP },
      { label: "Vertex AI, July", value: "$2,359", note: "now the largest GCP service", accent: AI },
    ],
    foot: "Vertex AI passed Compute Engine in July. Compute Engine, networking and DNS are flat to within a few dollars — every dollar of GCP growth is AI.",
  },

  /* ---------------------------------------------------------------- *
   * Part four — AI Factory
   * ---------------------------------------------------------------- */
  {
    kind: "section",
    kicker: "Part four · FinOps",
    title: "AI Factory",
    sub: "Where AI spend actually lands, project by project",
    accent: AI,
  },
  {
    kind: "chart",
    eyebrow: "AI Factory · Projects",
    accent: AI,
    title: "Consumption by project",
    note: "Four projects make up the AI Factory programme. AIFactory itself is more than half of it.",
    chart: { id: "chart32", type: "stacked", top: 5, drop: ["Total"] },
    chartTitle: "Monthly spend by project",
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total", note: "auto:change", accent: AI },
      { label: "Largest project", value: "auto:top", note: "auto:topshare", accent: COLORS.cyan },
    ],
    foot: "Spend roughly quadruples between January and July. June and July are flat against each other — the first month the programme has not grown.",
  },
  {
    kind: "dualChart",
    eyebrow: "AI Factory · Core project",
    accent: AI,
    title: "AI Factory project",
    note: "The tag covers far more than models — API Management and VMs are the two largest lines.",
    charts: [
      { id: "chart34", title: "By service", type: "stacked", top: 6 },
      { id: "chart33", title: "By subscription", type: "stacked", top: 5 },
    ],
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total:chart33", note: "auto:change:chart33", accent: AI },
      { label: "Largest service", value: "auto:top:chart34", note: "auto:topshare:chart34", accent: COLORS.cyan },
      { label: "Foundry Models", value: "auto:series:chart34:Foundry Models", note: "the actual model spend", accent: COLORS.ai },
    ],
    foot: "Most of what is tagged AI Factory is infrastructure rather than inference. That is not automatically wrong — models need somewhere to run — but it is the part right-sizing can move.",
  },
  {
    kind: "chart",
    eyebrow: "AI Factory · Solugen",
    accent: AI,
    title: "Solugen project",
    note: "Almost entirely Foundry Models and Foundry Tools — a genuinely model-heavy workload.",
    chart: { id: "chart35", type: "stacked", top: 6 },
    chartTitle: "Monthly spend by service",
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total", note: "auto:change", accent: AI },
      { label: "Foundry Models", value: "auto:series:Foundry Models", note: "auto:seriesshare:Foundry Models", accent: COLORS.cyan },
    ],
    foot: "May is the step change: Foundry Models jumps from under $1K to over $9K in a single month and has stayed there since.",
  },
  {
    kind: "chart",
    eyebrow: "AI Factory · Document intelligence",
    accent: AI,
    title: "Document intelligence (OCR services)",
    note: "OCR consumption by subscription. The growth is all Solugen Production.",
    chart: { id: "chart36", type: "stacked", top: 6 },
    chartTitle: "Monthly spend by subscription",
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total", note: "auto:change", accent: AI },
      { label: "Largest subscription", value: "auto:top", note: "auto:topshare", accent: COLORS.cyan },
    ],
    foot: "Solugen Production goes from a rounding error in January to the largest consumer in July. DataCloud prod is flat throughout.",
  },
  {
    kind: "chart",
    eyebrow: "AI Factory · INSAIT",
    accent: AI,
    title: "INSAIT project",
    note: "An application stack, not a model workload — until July.",
    chart: { id: "chart37", type: "stacked", top: 7 },
    chartTitle: "Monthly spend by service",
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total", note: "auto:change", accent: AI },
      { label: "Largest service", value: "auto:top", note: "auto:topshare", accent: COLORS.cyan },
    ],
    foot: "Foundry Models were negligible for six months and then jumped to $293 in July. Small in absolute terms, but it is the start of a new consumption line worth a quota before it grows.",
  },
  {
    kind: "chart",
    eyebrow: "AI Factory · Cognitive search",
    accent: AI,
    title: "Azure Cognitive Search",
    note: "Search indexes are provisioned capacity — they bill whether or not anyone queries them.",
    chart: { id: "chart38", type: "stacked", top: 7 },
    chartTitle: "Monthly spend by subscription",
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total", note: "auto:change", accent: AI },
      { label: "July", value: "auto:last", note: "eleven subscriptions carrying indexes", accent: COLORS.cyan },
    ],
    foot: "Dev/Test, AI Factory prod and Solugen Production drive the increase. Eleven separate subscriptions now run search capacity — worth confirming each index still backs a live use case.",
  },
  {
    kind: "chart",
    eyebrow: "AI Factory · Models",
    accent: AI,
    title: "Foundry models and tools",
    note: "Consumption by model and meter. This is the closest view of what the models themselves cost.",
    chart: { id: "chart39", type: "stacked", top: 8 },
    chartTitle: "Monthly spend by model and meter",
    stats: [
      { label: "Total, Jan–Jul", value: "auto:total", note: "auto:change", accent: AI },
      { label: "Largest meter", value: "auto:top", note: "auto:topshare", accent: COLORS.cyan },
    ],
    foot: "GPT-5.4 input and output become the dominant meters from June. Document intelligence page meters (S0 Custom / Pre-built / Add-on) are the steady base underneath them.",
  },
  {
    kind: "chart",
    eyebrow: "AWS · Bedrock",
    accent: AWS,
    title: "Consumption by Bedrock service",
    note: "Claude models consumed through Bedrock by the engineering teams, billed as Marketplace lines.",
    chart: { id: "chart40", type: "stacked", top: 8 },
    chartTitle: "Monthly spend by model",
    stats: [
      { label: "Total, Mar–Jul", value: "auto:total", note: "auto:change", accent: AWS },
      { label: "Largest model", value: "auto:top", note: "auto:topshare", accent: COLORS.cyan },
    ],
    foot: "Opus-class models are the overwhelming majority of Bedrock spend. Model mix changes month to month — Opus 5 appears in July — which is exactly what a model policy is for.",
  },
  {
    kind: "chart",
    eyebrow: "Azure · Sandbox",
    accent: AZURE,
    title: "Harel AI sandbox",
    note: "The experimentation environment. Small, but it should not be growing unattended.",
    chart: { id: "chart41", type: "stacked", top: 6 },
    chartTitle: "Monthly spend by service",
    stats: [
      { label: "Total, Jan–Jun", value: "auto:total", note: "auto:change", accent: AZURE },
      { label: "Largest service", value: "auto:top", note: "auto:topshare", accent: COLORS.cyan },
    ],
    foot: "Cognitive Search and virtual machines are almost the entire sandbox bill — provisioned capacity sitting idle between experiments.",
  },
  {
    kind: "dualChart",
    eyebrow: "Azure · Developer AI",
    accent: AI,
    title: "GitHub and Copilot",
    note: "Developer-facing AI, billed through the Shared Resources subscription.",
    charts: [
      { id: "chart43", title: "GitHub, by subscription", type: "stacked", top: 3 },
      { id: "chart42", title: "Copilot Studio, by subscription", type: "stacked", top: 3 },
    ],
    stats: [
      { label: "GitHub, May–Jul", value: "auto:total:chart43", note: "auto:change:chart43", accent: AI },
      { label: "Copilot Studio, July", value: "auto:last:chart42", note: "first full month billed", accent: COLORS.cyan },
      { label: "Combined", value: "auto:total:chart43+chart42", note: "developer AI, three months", accent: COLORS.muted },
    ],
    foot: "GitHub triples between May and July. Copilot Studio credits appear for the first time in July at $8,919 — no credit applied, billed in full.",
  },

  /* ---------------------------------------------------------------- *
   * Part five — FinOps project
   * ---------------------------------------------------------------- */
  {
    kind: "section",
    kicker: "Part five · FinOps",
    title: "Optimisation",
    sub: "What we recommend, and what has already been banked",
    accent: COLORS.good,
  },
  {
    kind: "table",
    eyebrow: "FinOps · Recommendations",
    accent: COLORS.good,
    title: "Optimisation recommendations",
    note: "Identified, costed and not yet implemented. Annualised figures.",
    tables: [
      {
        title: "Azure",
        sub: "Annual saving if implemented",
        accent: AZURE,
        cols: [
          { label: "Recommendation", w: 3.6 },
          { label: "Annual saving", w: 1.5, align: "right" },
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
          ["Retire VMs · consider serverless Databricks", { text: "under review", color: COLORS.muted }],
        ],
      },
      {
        title: "AWS",
        sub: "Annual saving if implemented",
        accent: AWS,
        cols: [
          { label: "Recommendation", w: 3.6 },
          { label: "Annual saving", w: 1.5, align: "right" },
        ],
        rows: [
          ["EKS extended support, version 1.33 — prod", { text: "$4,526", color: COLORS.good }],
          ["SageMaker — check necessity on several accounts", { text: "$3,420", color: COLORS.good }],
        ],
      },
    ],
    stats: [
      { label: "Total potential saving", value: "$193K", note: "annualised, both clouds", accent: COLORS.good },
      { label: "Azure share", value: "96%", note: "$184,836 of the total", accent: AZURE },
      { label: "Largest single item", value: "$44,592", note: "premium disk tier changes", accent: COLORS.cyan },
    ],
  },
  {
    kind: "table",
    eyebrow: "FinOps · Implemented",
    accent: COLORS.good,
    title: "Implemented savings — AWS and Azure",
    note: "Already actioned in 2026. Annualised figures.",
    tables: [
      {
        title: "Banked savings",
        sub: "By savings type",
        accent: COLORS.good,
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
          ["EKS extended support 1.33 — preprod", { text: "$4,526", color: COLORS.good }],
          ["Retire two unused SQL instances on expiring RI", { text: "$4,563", color: COLORS.good }],
          ["App Service — reserved instance", { text: "$712", color: COLORS.good }],
          ["RI refund to reach 100% utilisation", { text: "$440", color: COLORS.good }],
        ],
      },
    ],
    stats: [
      { label: "Total annual savings", value: "$278,868", note: "already implemented", accent: COLORS.good, big: true },
      { label: "Largest action", value: "$70,452", note: "North Europe decommission", accent: COLORS.cyan },
      { label: "Commitment-based", value: "$132,118", note: "reservations and savings plans", accent: AZURE },
      { label: "Still on the table", value: "$193K", note: "the recommendations on the previous slide", accent: COLORS.warn },
    ],
    foot: "Implemented and outstanding together are $472K of annual saving, against consumption of roughly $2.9M a year (Jan–Jul annualised, Marketplace excluded) — about 16% of the estate is addressable without changing what runs on it.",
  },
  {
    kind: "table",
    eyebrow: "FinOps · North Europe",
    accent: COLORS.good,
    title: "Decommissioning North Europe",
    note: "Monthly cost of everything still running in the North Europe region, by subscription.",
    tables: [
      {
        title: "North Europe — monthly cost by service",
        accent: COLORS.good,
        cols: [
          { label: "Service", w: 2.9 },
          { label: "Prod", w: 1.35, align: "right" },
          { label: "SAP Production", w: 1.55, align: "right" },
          { label: "Shared Resources", w: 1.7, align: "right" },
          { label: "Total", w: 1.3, align: "right" },
        ],
        rows: [
          ["Virtual Machines", "$154", "$1,661", "$550", { text: "$2,365", color: COLORS.text }],
          ["Storage", "$7", "$1,868", "$109", { text: "$1,984", color: COLORS.text }],
          ["VPN Gateway", "$930", "—", "—", { text: "$930", color: COLORS.text }],
          ["Azure Site Recovery", "—", "—", "$200", { text: "$200", color: COLORS.text }],
          ["Azure DNS", "$180", "—", "—", { text: "$180", color: COLORS.text }],
          ["Virtual Network", "$18", "$70", "$3", { text: "$91", color: COLORS.text }],
          ["Bandwidth", "$25", "$3", "$9", { text: "$37", color: COLORS.text }],
          ["NAT Gateway", "$35", "—", "—", { text: "$35", color: COLORS.text }],
          ["Microsoft Defender for Cloud", "$30", "—", "—", { text: "$30", color: COLORS.text }],
          ["Load Balancer", "$19", "—", "—", { text: "$19", color: COLORS.text }],
          ["Automation", "—", "—", "$0", { text: "$0", color: COLORS.muted }],
          [
            { text: "Grand total", bold: true },
            { text: "$1,397", bold: true },
            { text: "$3,601", bold: true },
            { text: "$872", bold: true },
            { text: "$5,871", bold: true, color: COLORS.good },
          ],
        ],
      },
    ],
    stats: [
      { label: "Monthly cost", value: "$5,871", note: "across three subscriptions", accent: COLORS.cyan },
      { label: "Annualised", value: "$70,452", note: "the banked saving", accent: COLORS.good },
      { label: "SAP Production share", value: "61%", note: "$3,601 of the monthly total", accent: AZURE },
    ],
    foot: "Virtual machines and storage are 74% of what is left in the region. Nothing here is a shared dependency for another region.",
  },

  /* ---------------------------------------------------------------- *
   * Next steps (Hebrew, right-to-left)
   * ---------------------------------------------------------------- */
  {
    kind: "table",
    eyebrow: "Next steps",
    accent: COLORS.cyan,
    title: "Open items and owners",
    note: "נושאים להמשך · משימות, אחראים וסטטוס",
    noteRtl: true,
    tables: [
      {
        rtl: true,
        rowH: 0.42,
        fontSize: 10,
        cols: [
          { label: "אחראי", w: 1.7, align: "right" },
          { label: "סטטוס", w: 1.2, align: "right" },
          { label: "פירוט", w: 5.9, align: "right" },
          { label: "משימה", w: 2.7, align: "right" },
          { label: "#", w: 0.5, align: "right" },
        ],
        rows: [
          ["אגף תשתיות", { text: "מתוכנן", color: COLORS.warn }, "מימוש תכנית חיסכון Cloud FinOps — Rightsizing, Auto Shutdown, Reserved Instances", "פרויקט חיסכון והתייעלות", "1"],
          ["אריאל אוראל", { text: "מתוכנן", color: COLORS.warn }, "הטמעת פלטפורמת WIV.AI — ממשל, ניטור עלויות ושימושים", "הטמעת WIV.AI (FREE)", "2"],
          ["אריאל אוראל", { text: "בתהליך", color: COLORS.cyan }, "השלמת תיוג משאבים לפי Service, Application, Cost Center ו-Environment לצורך Chargeback/Showback, כולל AI Gateway ו-AWS Bedrock", "תיוגים לפי שירות", "3"],
          ["אריאל", { text: "מתוכנן", color: COLORS.warn }, "ניתוח עלויות אוטומטי, זיהוי המלצות חיסכון ואופטימיזציה של שירותי AWS", "הטמעת AWS FinOps Agent", "4"],
          ["—", { text: "TBD", color: COLORS.muted }, "הגדלת ניצול חוזה ה-DBU Commitment ומעקב Utilization, אופטימיזציה Classic/Serverless", "Databricks Commitment Optimization", "5"],
        ],
      },
    ],
    stats: [
      { label: "In progress", value: "1", note: "resource tagging for chargeback", accent: COLORS.cyan },
      { label: "Planned", value: "3", note: "savings programme · WIV.AI · AWS FinOps agent", accent: COLORS.warn },
      { label: "To be scoped", value: "1", note: "Databricks commitment optimisation", accent: COLORS.muted },
    ],
    foot: "Tagging is the dependency underneath the rest: without Service, Application, Cost Center and Environment on every resource, neither chargeback nor the AI gateway's per-consumer budgets can be enforced.",
  },

  /* ---------------------------------------------------------------- *
   * Close
   * ---------------------------------------------------------------- */
  {
    kind: "closing",
    kicker: "Harel Insurance · Cloud FinOps",
    title: "Thank you",
    sub: "Cloud infrastructure, DevOps and databases · Technology and Cyber Defence Division",
    accent: COLORS.cyan,
  },
];
