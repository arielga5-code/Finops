/**
 * FinOps for AI — CIO briefing.
 *
 * Rebuilt from the "Using AI Right at Harel" practitioner deck (5 levers plus a
 * one-page policy) into an executive cut, in the same design system as the
 * cloud-cost briefing so the two read as one programme.
 *
 * Two editorial rules:
 *
 *  1. Every lever is stated with its published saving AND with Harel's own
 *     exposure to it, so it is a decision rather than a tip. Figures for our
 *     spend come from the Jan–Jul 2026 consumption series used in the CIO deck.
 *  2. No invented totals. Lever savings are the rates the platforms publish;
 *     nothing multiplies them into a headline number we cannot defend.
 */

const { COLORS } = require("./lib/theme");

const AWS = COLORS.aws;
const AZURE = COLORS.azure;
const AI = COLORS.ai;

module.exports = [
  /* ---------------------------------------------------------------- *
   * Opening
   * ---------------------------------------------------------------- */
  {
    kind: "section",
    kicker: "Harel Insurance · FinOps for AI",
    title: "Using AI right",
    sub: "Cost-optimal, compliant use of Bedrock, GitHub Copilot and Azure AI Foundry · CIO briefing",
    accent: AI,
    speakerNotes: [
      "THE ASK IN ONE LINE: agree a model policy, so AI spend scales with value",
      "instead of with habit.",
      "",
      "This is not about spending less on AI. It is about paying the right price",
      "for each unit of it. Five levers, all available today on platforms we",
      "already run — no new tooling to buy.",
    ].join("\n"),
  },

  {
    kind: "hero",
    eyebrow: "Why now",
    accent: AI,
    title: "AI is a quarter of the cloud bill",
    note: "Billed AI across all three clouds. Excludes the Databricks pre-purchase, which bills at $0.",
    value: "$75,439",
    valueLabel: "billed AI in July 2026  ·  up from $8,640 in January",
    delta: "26.6% of the cloud bill  ·  was 3.7% in January",
    deltaColor: COLORS.danger,
    parts: [
      { label: "AWS Bedrock — Claude", value: "$25,288", note: "July", accent: AWS },
      { label: "Azure AI Foundry", value: "$19,613", note: "July", accent: AZURE },
      { label: "GitHub Copilot", value: "$19,260", note: "July", accent: AI },
    ],
    pointsTitle: "What this slide is not saying",
    points: [
      "Not that AI is too expensive — the return is real and the spend is growing for good reasons.",
      "It is saying the unit price is unmanaged: no tier policy, no caching standard, no batch default.",
      "Five levers below change what each unit costs, without changing what anyone is allowed to build.",
    ],
    foot: "Jan–Jul 2026 consumption. Billed AI totalled $199,531 over the seven months and grew 773% from January to July.",
    speakerNotes: [
      "GROUNDING THE CONVERSATION IN OUR OWN NUMBERS.",
      "",
      "  Billed AI, July      75,439   (26.6% of a 283,554 monthly bill)",
      "  Billed AI, January    8,640   ( 3.7% of a 234,115 monthly bill)",
      "  Jan-Jul total       199,531   growth +773%",
      "",
      "By platform in July: Bedrock 25,288, Foundry 19,613, Copilot 19,260,",
      "Copilot Studio 8,920, Vertex AI 2,359.",
      "",
      "The point to land: the growth is not the problem. The absence of a price",
      "policy underneath the growth is.",
    ].join("\n"),
  },

  /* ---------------------------------------------------------------- *
   * The levers
   * ---------------------------------------------------------------- */
  {
    kind: "steps",
    eyebrow: "The programme",
    accent: AI,
    cols: 5,
    title: "Five levers, all available today",
    note: "Nothing here needs new tooling. Every one is a setting or a habit on a platform we already run.",
    items: [
      { label: "Model tier", desc: "Match the model to the task. The price gap between tiers is 5–15×." },
      { label: "Region", desc: "Cheapest region that still meets the compliance requirement of the data." },
      { label: "Prompt caching", desc: "Stop paying twice for the same context. Up to 90% off the repeated part." },
      { label: "Batch & commit", desc: "Batch is about 50% cheaper. Commit steady volume to reserved capacity." },
      { label: "Platform wins", desc: "One high-impact move each on Bedrock, Copilot and Foundry." },
    ],
    foot: "Levers 1 and 3 are the largest and the fastest — a tier policy and a caching standard can be in force within a sprint.",
  },

  {
    kind: "table",
    eyebrow: "Lever 1 · the biggest driver",
    accent: COLORS.danger,
    title: "Match the model to the task",
    note: "The single largest determinant of AI unit cost. Escalate on measured need, never by default.",
    tables: [
      {
        title: "The three tiers",
        sub: "Start at balanced. Move up only when quality measurably fails a real test.",
        cols: [
          { label: "Tier", w: 2.2 },
          { label: "What it is for", w: 3.5 },
          { label: "Models", w: 3.0 },
        ],
        rows: [
          [{ text: "Light / fast", color: COLORS.good }, "High volume, simple: classification, extraction, routing, tagging", "Claude Haiku · GPT-4o-mini · small Foundry and open models"],
          [{ text: "Balanced — default", color: COLORS.cyan }, "Most production work: chat, drafting, document processing, standard coding", "Claude Sonnet · GPT-4o · GitHub Copilot base model"],
          [{ text: "Top — deliberate", color: COLORS.danger }, "Hard reasoning only: complex underwriting logic, difficult code, deep analysis", "Claude Opus · OpenAI o-series"],
        ],
      },
    ],
    stats: [
      { label: "Gap between tiers", value: "5–15×", note: "same task, different tier", accent: COLORS.danger },
      { label: "Our Bedrock spend", value: "82%", note: "is Opus-class today", accent: AWS },
      { label: "Opus → Sonnet", value: "~60%", note: "lower token cost, routine work", accent: COLORS.good },
    ],
    foot: "The rule: start on the balanced tier, escalate only when quality measurably fails a real test — never 'just in case'. Today 82% of our AWS AI spend is Opus-class, which is the clearest single opportunity in this deck.",
    speakerNotes: [
      "THE ONE SLIDE THAT MATTERS MOST.",
      "",
      "The 5-15x gap is between tiers for the same task. Choosing the top tier by",
      "default is the most expensive habit in AI, and it is invisible on an",
      "invoice because the line item looks identical.",
      "",
      "OUR EXPOSURE",
      "82.1% of AWS AI spend is Opus-class. Bedrock was 25,288 in July. We have",
      "not measured how much of that genuinely needs Opus — that measurement is",
      "the first action, not a blanket downgrade.",
      "",
      "On GitHub Copilot the published promotional pricing makes Sonnet 5 the",
      "baseline and Opus about 2.5x; shifting routine work is roughly 60% off the",
      "token cost. That promotional pricing ends 31 Aug 2026 — reassess before,",
      "not after.",
      "",
      "IF CHALLENGED: this is not a quality policy, it is a default policy. Any",
      "team can escalate; they just have to show the balanced tier failed.",
    ].join("\n"),
  },

  {
    kind: "table",
    eyebrow: "Lever 2 · region",
    accent: AZURE,
    title: "Cheapest region that still complies",
    note: "For an insurer this is a compliance decision first and a cost decision second.",
    tables: [
      {
        title: "Two ways to route a request",
        cols: [
          { label: "Routing", w: 2.6 },
          { label: "What it is", w: 3.4 },
          { label: "Use it for", w: 3.4 },
        ],
        rows: [
          [{ text: "Global / cross-region", color: COLORS.good }, "Bedrock cross-region profile · Azure Global Standard", "Non-sensitive, high-volume work only"],
          [{ text: "Specific / in-region", color: AZURE }, "Bedrock regional endpoint · Azure Data Zone or Regional", "Default for policyholder, PII and regulated data"],
        ],
      },
    ],
    stats: [
      { label: "Global routing", value: "Cheapest", note: "per token, best throughput", accent: COLORS.good },
      { label: "But it may process", value: "Outside", note: "the chosen region", accent: COLORS.danger },
      { label: "In-region premium", value: "Small", note: "for compliance certainty", accent: AZURE },
    ],
    foot: "Harel rule: regulated data never leaves an approved region — even for a discount. Everything else takes the cheapest compliant route. This is the one lever where the answer is not always 'the cheaper option'.",
  },

  {
    kind: "bigStat",
    eyebrow: "Lever 3 · prompt caching",
    accent: COLORS.good,
    title: "Stop paying twice for the same context",
    note: "Supported natively by both Bedrock and Azure AI Foundry.",
    value: "~90%",
    text: "lower cost on the cached, repeated portion of the input. Large stable context — system prompts, policy documents, knowledge bases — is re-sent and re-charged on every single call unless it is cached.",
    stats: [
      { label: "What to cache", value: "Stable context", note: "system prompts, policies, forms, code", accent: COLORS.good },
      { label: "Best fit", value: "Assistants", note: "document Q&A, agentic workflows", accent: COLORS.cyan },
      { label: "Effort", value: "Configuration", note: "no new platform, no new licence", accent: AI },
    ],
    points: [
      "Cache system and instruction prompts, policy documents, forms, knowledge bases, long code references, and few-shot examples reused on every request.",
      "The saving lands hardest exactly where our spend is growing fastest — internal assistants and document processing.",
      "Fastest lever to implement: it is a change to how a request is composed, not to what the workload does.",
    ],
  },

  {
    kind: "table",
    eyebrow: "Lever 4 · consumption model",
    accent: COLORS.warn,
    title: "Batch it, or commit it",
    note: "Two different answers to the same question: does this work need to happen in seconds?",
    tables: [
      {
        title: "How to buy the capacity",
        cols: [
          { label: "Model", w: 2.2 },
          { label: "Saving", w: 1.8, align: "right" },
          { label: "When it applies", w: 5.2 },
        ],
        rows: [
          [{ text: "Batch it", color: COLORS.good }, { text: "≈ 50%", color: COLORS.good }, "Anything not needed in seconds: overnight document processing, bulk classification, report generation"],
          [{ text: "Commit it", color: COLORS.cyan }, { text: "Lower rate", color: COLORS.cyan }, "Steady, high-volume production → Bedrock Provisioned Throughput or Azure PTU. Variable and experimental stays on-demand"],
        ],
      },
    ],
    stats: [
      { label: "Batch versus real-time", value: "≈ 50%", note: "cheaper for the same work", accent: COLORS.good },
      { label: "Commitment gives", value: "Predictable", note: "capacity, at a lower rate", accent: COLORS.cyan },
      { label: "Review cadence", value: "Quarterly", note: "promote matured, steady workloads", accent: COLORS.muted },
    ],
    foot: "The rule: if it isn't needed right now, send it to the batch API. Then review quarterly and move anything that has settled into steady production onto committed capacity — the same discipline that already saved $132,118 a year on cloud reservations.",
  },

  {
    kind: "table",
    eyebrow: "Lever 5 · quick wins",
    accent: COLORS.cyan,
    title: "One high-impact move per platform",
    note: "Three platforms, three different failure modes, three different fixes.",
    tables: [
      {
        title: "Per platform",
        cols: [
          { label: "Platform", w: 2.4 },
          { label: "The move", w: 3.6 },
          { label: "Also worth doing", w: 3.4 },
        ],
        rows: [
          [{ text: "Amazon Bedrock", color: AWS }, "Tag every workload with team and use case", "Per-team budget alerts on token spend · Guardrails to block off-scope calls"],
          [{ text: "GitHub Copilot", color: AI }, "Reclaim idle seats monthly — it is a per-seat licence", "Measure acceptance rate, not seat count · Steer routine work to the included model"],
          [{ text: "Azure AI Foundry", color: AZURE }, "Choose by cost-per-capability, not by brand", "Smaller and open models cover most cases · Batch deployments for bulk jobs"],
        ],
      },
    ],
    stats: [
      { label: "Copilot, Jan–Jul", value: "$57,177", note: "+593% — seats worth auditing", accent: AI },
      { label: "Bedrock, July", value: "$25,288", note: "untagged by use case today", accent: AWS },
      { label: "Foundry, July", value: "$19,613", note: "model choice not yet governed", accent: AZURE },
    ],
    foot: "Copilot is a licence problem, Bedrock is an attribution problem, Foundry is a model-choice problem. Each needs a different owner and a different monthly routine.",
  },

  /* ---------------------------------------------------------------- *
   * The policy
   * ---------------------------------------------------------------- */
  {
    kind: "table",
    eyebrow: "The policy",
    accent: COLORS.good,
    title: "How teams use AI at Harel",
    note: "One page. This is the artefact we are asking to adopt.",
    tables: [
      {
        cols: [{ label: "Do", w: 5.7 }],
        rows: [
          [{ text: "Default to the balanced model tier", color: COLORS.good }],
          [{ text: "Escalate to top models only on measured need", color: COLORS.good }],
          [{ text: "Cache stable, repeated context", color: COLORS.good }],
          [{ text: "Batch every non-urgent job", color: COLORS.good }],
          [{ text: "Pick the compliant region at lowest cost", color: COLORS.good }],
          [{ text: "Reclaim idle Copilot seats monthly", color: COLORS.good }],
          [{ text: "Tag and budget every workload", color: COLORS.good }],
        ],
      },
      {
        cols: [{ label: "Don't", w: 5.7 }],
        rows: [
          [{ text: "Reach for the top model by default", color: COLORS.danger }],
          [{ text: "Send regulated data to global endpoints", color: COLORS.danger }],
          [{ text: "Re-send the same context on every call", color: COLORS.danger }],
          [{ text: "Run real-time when batch would do", color: COLORS.danger }],
          [{ text: "Leave Copilot seats idle", color: COLORS.danger }],
          [{ text: "Ship untagged, un-budgeted workloads", color: COLORS.danger }],
          [{ text: "Trust one model choice forever — re-review", color: COLORS.danger }],
        ],
      },
    ],
    stats: [],
    foot: "None of this restricts what a team may build. It sets the default price of building it, and makes the exception a decision someone owns.",
  },

  {
    kind: "criteria",
    eyebrow: "The ask",
    accent: COLORS.cyan,
    title: "What we need from this meeting",
    note: "Six decisions. Each needs a named owner.",
    items: [
      { label: "Adopt the one-page policy", desc: "As the default for every team building on AI." },
      { label: "Set the tier default", desc: "Balanced tier standard; top tier by exception, with evidence." },
      { label: "Mandate caching", desc: "Stable context cached on assistants and document workloads." },
      { label: "Batch by default", desc: "Anything not needed in seconds goes to the batch API." },
      { label: "Monthly Copilot review", desc: "Reclaim idle seats; report acceptance rate, not seat count." },
      { label: "Name an owner per platform", desc: "Bedrock, Copilot and Foundry each need one." },
    ],
    banner: {
      title: "Reassess before 31 August 2026",
      text: "GitHub Copilot's promotional model pricing ends on that date. The tier decision should be taken and measured before it changes, not after the first invoice that reflects it.",
    },
  },

  {
    kind: "closing",
    title: "Thank you",
    titleSize: 110,
    titleColor: COLORS.cyan,
    accent: COLORS.cyan,
  },
];
