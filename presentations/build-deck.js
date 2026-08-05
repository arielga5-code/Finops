/*
 * FinOps: Gaining Visibility — management presentation generator.
 */
const path = require("path");
const pptxgen = require("pptxgenjs");
const kit = require("./deck-kit.js");
const {
  DARK, DARK_CARD, WHITE, TINT, INK, MUTED, MUTED_D,
  AMBER, AMBER_SOFT, TEAL, TEAL_SOFT, HEAD, BODY, M,
  bg, card, iconBadge, kicker, title, sub, quoteBlock, iconRow, dotGrid,
} = kit;

/*
 * usage: node build-deck.js [outfile.pptx] [audience]
 *   audience: "exec" (default) or "cfo" — selects the speaker-note set only.
 *             The slides themselves are identical in both variants.
 */
const AUDIENCE = (process.argv[3] || "exec").toLowerCase();
const NOTES = {
  exec: require("./notes-exec.js"),
  cfo: require("./notes-cfo.js"),
}[AUDIENCE];
if (!NOTES) {
  console.error('unknown audience "' + AUDIENCE + '" — expected "exec" or "cfo"');
  process.exit(1);
}

const OUT = process.argv[2] ||
  path.join(__dirname, "finops-gaining-visibility" + (AUDIENCE === "exec" ? "" : "-" + AUDIENCE) + ".pptx");

function note(slide, n) {
  if (!NOTES[n]) throw new Error("missing note for slide " + n);
  slide.addNotes(NOTES[n]);
}

let pres;
/* ================= slides ================= */

async function slideTitle() {
  const s = pres.addSlide();
  bg(s, DARK);
  s.addText("MANAGEMENT BRIEFING", {
    x: M, y: 1.5, w: 7, h: 0.3, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 2.6, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText("FinOps:\nVisibility & Governance", {
    x: M, y: 1.95, w: 8.0, h: 1.6, fontFace: HEAD, fontSize: 38, bold: true,
    color: WHITE, margin: 0, valign: "top", lineSpacing: 44,
  });
  s.addText("Seeing cloud spend — and controlling it", {
    x: M, y: 3.72, w: 7.4, h: 0.4, fontFace: BODY, fontSize: 19,
    color: MUTED_D, margin: 0, valign: "middle",
  });
  s.addText(
    [
      { text: "Presented to", options: { fontSize: 11, color: MUTED_D, bold: true, charSpacing: 1.4, breakLine: true } },
      { text: "Executive Leadership", options: { fontSize: 15, color: WHITE } },
    ],
    { x: M, y: 5.6, w: 3.4, h: 0.8, fontFace: BODY, margin: 0, valign: "middle", lineSpacing: 20 }
  );
  s.addText(
    [
      { text: "Date", options: { fontSize: 11, color: MUTED_D, bold: true, charSpacing: 1.4, breakLine: true } },
      { text: "____________________", options: { fontSize: 15, color: MUTED_D } },
    ],
    { x: 4.3, y: 5.6, w: 3.4, h: 0.8, fontFace: BODY, margin: 0, valign: "middle", lineSpacing: 20 }
  );

  dotGrid(s, {
    x: 8.75, y: 1.72, cols: 7, rows: 7, gap: 0.56, d: 0.3, dim: "27313E",
    lit: (c, r) => c + r >= 8 && c >= 2,
  });
  s.addText("Spend you can see", {
    x: 8.75, y: 5.75, w: 4, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.6, color: AMBER, margin: 0, valign: "middle",
  });

  note(s, "title");
  return s;
}

async function slideProblem() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "The problem we face");
  title(s, "Cloud spend is dynamic, distributed and opaque");

  const items = [
    ["FiShuffle", "Costs move daily", "Spend is dynamic and distributed across teams, services and regions."],
    ["FiCalendar", "Budgeting models don't fit", "Traditional IT budgeting assumes fixed, predictable costs. Cloud is neither."],
    ["FiCode", "Engineers spend money", "Technical decisions made daily carry direct, immediate financial consequences."],
    ["FiFileText", "Bills arrive without context", "Monthly invoices show what was spent — rarely who spent it, or why."],
  ];
  let y = 2.15;
  for (const [ic, label, desc] of items) {
    await iconRow(s, {
      x: M, y, w: 6.5, h: 0.86, icon: ic, badgeBg: AMBER_SOFT, iconColor: "B87B18",
      label, desc, labelColor: INK, descColor: MUTED,
    });
    y += 1.1;
  }

  quoteBlock(s, {
    x: 7.5, y: 2.15, w: 5.23, h: 2.4, fill: TINT, color: INK, size: 14.5,
    text: "“When costs rise and no one can explain who owns the change or what caused it, " +
      "visibility has failed — even if a dashboard is showing numbers.”",
  });

  card(s, { x: 7.5, y: 4.76, w: 5.23, h: 1.65, fill: DARK_CARD });
  s.addText(
    [
      { text: "The result", options: { fontSize: 12, bold: true, charSpacing: 1.8, color: AMBER, breakLine: true } },
      { text: "Sticker shock, finger-pointing and reactive cost-cutting instead of strategic optimization.", options: { fontSize: 14.5, color: WHITE } },
    ],
    { x: 7.82, y: 4.91, w: 4.59, h: 1.35, fontFace: BODY, margin: 0, valign: "middle", lineSpacing: 20 }
  );

  note(s, "problem");
}

async function slideBlockers() {
  const s = pres.addSlide();
  bg(s, DARK);
  kicker(s, "The visibility blockers");
  title(s, "Five filters between us and a clear view", true);

  const blockers = [
    ["FiTag", "Inconsistent tagging", "A significant portion of spend stays unallocated or misallocated."],
    ["FiShare2", "Shared resources", "Databases, Kubernetes clusters and networking resist clean attribution to one team."],
    ["FiPercent", "Commitments & discounts", "Reserved Instances and Savings Plans break attribution — list price ≠ price paid."],
    ["FiCloud", "Multi-cloud estates", "Each provider bills and reports differently; a unified view has to be constructed."],
    ["FiShoppingBag", "SaaS & marketplace spend", "Invisible in cloud billing. Teams forget the subscriptions they signed."],
  ];
  let y = 1.88;
  for (const [ic, label, desc] of blockers) {
    card(s, { x: M, y, w: 12.13, h: 0.78, fill: DARK_CARD, shadow: false });
    await iconBadge(s, { x: M + 0.28, y: y + 0.13, d: 0.52, bg: "2E3A48", icon: ic, color: AMBER });
    s.addText(label, {
      x: M + 1.02, y, w: 3.5, h: 0.78, fontFace: BODY, fontSize: 15, bold: true,
      color: WHITE, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: M + 4.6, y, w: 7.4, h: 0.78, fontFace: BODY, fontSize: 13,
      color: MUTED_D, margin: 0, valign: "middle",
    });
    y += 0.88;
  }

  s.addText(
    "“Different clouds report data differently, network traffic adds up fast, and Kubernetes or SaaS often hide who generated the spend.”",
    { x: M, y: 6.4, w: 12.13, h: 0.6, fontFace: HEAD, fontSize: 14.5, italic: true, color: AMBER, margin: 0, valign: "middle" }
  );

  note(s, "blockers");
}

async function slideTagging() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Solution 1 — tagging strategy");
  title(s, "The foundation of all visibility");

  card(s, { x: M, y: 1.95, w: 4.1, h: 3.32, fill: DARK_CARD });
  await iconBadge(s, { x: M + 0.34, y: 2.24, d: 0.66, bg: AMBER, icon: "FiTag", color: "13202B" });
  s.addText("The challenge", {
    x: M + 0.34, y: 3.05, w: 3.4, h: 0.34, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText(
    "“Tagging is the single most foundational habit for sustainable FinOps maturity. It is also the most frequently skipped.”",
    { x: M + 0.34, y: 3.42, w: 3.42, h: 1.6, fontFace: HEAD, fontSize: 15, italic: true, color: WHITE, margin: 0, valign: "top", lineSpacing: 21 }
  );

  const actions = [
    ["FiList", "Define a global tag taxonomy", "One master list, agreed across the business — aligned to business need, not just cloud ops."],
    ["FiShield", "Enforce tags at creation", "Azure Policy, AWS Organizations tag policies, or Terraform. Retrofitting later is painful."],
    ["FiEye", "Start with showback", "Show teams their spend, uncharged, for 4–6 weeks — gaps surface before money is on the line."],
    ["FiCheckCircle", "Monitor tag compliance", "Dashboards that surface missing or incorrect metadata, tracked as a KPI."],
  ];
  let y = 1.95;
  for (const [ic, label, desc] of actions) {
    await iconRow(s, {
      x: 5.1, y, w: 7.63, h: 0.78, icon: ic, badgeBg: TEAL_SOFT, iconColor: "1F6B5C",
      label, desc, labelColor: INK, descColor: MUTED, d: 0.5, labelSize: 14.5, descSize: 12.5,
    });
    y += 0.85;
  }

  s.addText("Minimum viable tags", {
    x: M, y: 5.52, w: 4, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: MUTED, margin: 0, valign: "middle",
  });
  const tags = ["Environment", "CostCenter", "ApplicationID", "Owner", "Project"];
  let tx = M;
  for (const t of tags) {
    const w = 2.3;
    card(s, { x: tx, y: 5.95, w, h: 0.62, fill: AMBER_SOFT, shadow: false, radius: 0.3 });
    s.addText(t, {
      x: tx, y: 5.95, w, h: 0.62, fontFace: BODY, fontSize: 14, bold: true,
      color: "6B4A0E", margin: 0, align: "center", valign: "middle",
    });
    tx += 2.42;
  }

  note(s, "tagging");
}

async function slideBillingShock() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Governance — putting it together");
  title(s, "Nobody should learn it from the invoice");
  sub(s, "The same overrun, found at four different moments. Only the first three leave you anything to do about it.");

  /* when each signal reaches you */
  const axisY = 3.42;
  s.addShape(pres.ShapeType.roundRect, {
    x: 1.9, y: axisY, w: 9.53, h: 0.05, rectRadius: 0.02,
    fill: { color: "DFE4EA" }, line: { type: "none" },
  });

  const points = [
    [1.9, "Usage burn alert", "~10 minutes", "Throttle it, or confirm it was intended.", AMBER, "B87B18"],
    [5.2, "Daily spend threshold", "next morning", "One team, one number, one owner to ask.", TEAL, "1F6B5C"],
    [8.5, "Forecast overrun", "~2 weeks out", "Still time to change the month's outcome.", TEAL, "1F6B5C"],
    [11.43, "The invoice", "30–45 days later", "Nothing left to decide. Only to explain.", "AEB8C4", MUTED],
  ];
  for (const [x, name, when, action, dot, textColor] of points) {
    const boxW = 2.6;
    const bx = Math.min(Math.max(x - boxW / 2, M), 12.73 - boxW);
    s.addText(name, {
      x: bx, y: 2.42, w: boxW, h: 0.34, fontFace: BODY, fontSize: 14, bold: true,
      color: dot === "AEB8C4" ? MUTED : INK, margin: 0, align: "center", valign: "middle",
    });
    s.addText(when, {
      x: bx, y: 2.78, w: boxW, h: 0.32, fontFace: BODY, fontSize: 12.5, bold: true,
      charSpacing: 0.6, color: textColor, margin: 0, align: "center", valign: "middle",
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: x - 0.13, y: axisY - 0.105, w: 0.26, h: 0.26,
      fill: { color: dot }, line: { color: WHITE, width: 2 },
    });
    s.addText(action, {
      x: bx, y: 3.72, w: boxW, h: 0.62, fontFace: BODY, fontSize: 12,
      color: MUTED, margin: 0, align: "center", valign: "top", lineSpacing: 16,
    });
  }

  /* what has to be true */
  card(s, { x: M, y: 4.7, w: 7.3, h: 2.2, fill: TINT, shadow: false });
  s.addText("What has to be true", {
    x: M + 0.36, y: 4.86, w: 4, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: MUTED, margin: 0, valign: "middle",
  });
  const conditions = [
    "Protective alerts run on usage data, not on billing data",
    "Every alert has a named owner to route to",
    "Budgets are phased, so drift shows up in week one",
    "Quotas cap the worst case while someone investigates",
  ];
  let cy = 5.26;
  for (const c of conditions) {
    await iconBadge(s, { x: M + 0.36, y: cy, d: 0.3, bg: WHITE, icon: "FiCheck", color: "1F6B5C" });
    s.addText(c, {
      x: M + 0.82, y: cy - 0.06, w: 6.2, h: 0.42, fontFace: BODY, fontSize: 13,
      color: INK, margin: 0, valign: "middle",
    });
    cy += 0.42;
  }

  card(s, { x: 8.23, y: 4.7, w: 4.5, h: 2.2, fill: DARK_CARD });
  s.addText("The point", {
    x: 8.55, y: 4.88, w: 3.5, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText(
    "The goal is not a smaller invoice. It is an invoice with nothing in it you " +
    "have not already seen, explained and decided about.",
    { x: 8.55, y: 5.28, w: 3.86, h: 1.4, fontFace: HEAD, fontSize: 15.5, italic: true,
      color: WHITE, margin: 0, valign: "top", lineSpacing: 22 }
  );

  note(s, "billing-shock");
}

async function slideAiCost() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Governance — the AI line");
  title(s, "AI is repeating the cloud journey, at speed");
  sub(s, "The same three failures — no owner, no attribution, no ceiling — arriving on a much shorter clock.");

  const stats = [
    ["72%", "hit an unexpected AI bill in the past year", "One in three, more than once.", "A6432F"],
    ["52%", "have no clear owner for AI cost", "Split across engineering, FinOps, finance and IT.", AMBER],
    ["4 in 5", "need a day or more to trace a spike to its source", "Only about one in five manage it within hours.", AMBER],
    ["26%", "of AI spend estimated wasted", "Respondents' own estimate, not a measurement.", MUTED],
  ];
  const xs = [0.6, 3.7, 6.8, 9.9];
  for (let i = 0; i < stats.length; i++) {
    const [big, line, foot, color] = stats[i];
    card(s, { x: xs[i], y: 2.32, w: 2.83, h: 2.4, fill: TINT, shadow: false });
    s.addText(big, {
      x: xs[i] + 0.28, y: 2.5, w: 2.3, h: 0.7, fontFace: HEAD, fontSize: 32, bold: true,
      color, margin: 0, valign: "middle",
    });
    s.addText(line, {
      x: xs[i] + 0.28, y: 3.24, w: 2.3, h: 0.85, fontFace: BODY, fontSize: 13,
      color: INK, margin: 0, valign: "top", lineSpacing: 17,
    });
    s.addText(foot, {
      x: xs[i] + 0.28, y: 4.06, w: 2.3, h: 0.56, fontFace: BODY, fontSize: 11,
      color: MUTED, margin: 0, valign: "top", lineSpacing: 14,
    });
  }

  card(s, { x: M, y: 5.0, w: 7.3, h: 1.62, fill: DARK_CARD });
  s.addText("The number to manage", {
    x: M + 0.34, y: 5.18, w: 5, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText(
    [
      { text: "Time to attribute a spike. ", options: { color: WHITE, bold: true } },
      { text: "It turns an argument about governance into a number we can move — days today, hours as the target — and it is the one metric a runaway AI workload is measured against.", options: { color: MUTED_D } },
    ],
    { x: M + 0.34, y: 5.54, w: 6.62, h: 0.96, fontFace: BODY, fontSize: 13.5, margin: 0,
      valign: "top", lineSpacing: 19 }
  );

  card(s, { x: 8.23, y: 5.0, w: 4.5, h: 1.62, fill: AMBER_SOFT, shadow: false });
  s.addText("Why a rollup will not do it", {
    x: 8.57, y: 5.18, w: 4, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: "6B4A0E", margin: 0, valign: "middle",
  });
  s.addText(
    "AI waste hides in prompt design, model choice and retry logic. A monthly bill by resource " +
    "cannot name the caller — that needs per-consumer token attribution.",
    { x: 8.57, y: 5.54, w: 3.86, h: 0.96, fontFace: BODY, fontSize: 12.5,
      color: "6B4A0E", margin: 0, valign: "top", lineSpacing: 17 }
  );

  s.addText(
    "Harness / Sapio Research, 2026 State of AI in FinOps — 700 engineering leaders and practitioners, May–June 2026. " +
    "Vendor-sponsored research; the waste and maturity figures are self-reported estimates.",
    { x: M, y: 6.78, w: 12.13, h: 0.5, fontFace: BODY, fontSize: 10.5,
      color: MUTED, margin: 0, valign: "middle" }
  );

  note(s, "ai-cost");
}

async function slideTooling() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Tooling — a worked example");
  title(s, "What a FinOps platform adds: Finout");
  sub(s, "The capabilities a dedicated platform brings over native billing consoles, and what to test before buying one.");

  const caps = [
    ["FiLayers", "One normalized bill", "Cloud, SaaS and AI in one view — AWS, Azure, GCP, OCI, Kubernetes, Snowflake, Databricks, OpenAI, Anthropic. FOCUS supported."],
    ["FiTag", "Virtual tags", "Allocates untagged and shared cost by rule, without touching infrastructure tags — showback without a retagging project."],
    ["FiBox", "Kubernetes to pod level", "Cluster, namespace and pod allocation without an agent, which is the shared-cost problem most tools leave unsolved."],
    ["FiBarChart2", "Dashboards and unit economics", "Widgets for cost, usage, waste, budget and unit cost; business metrics from Datadog, Salesforce or Looker to divide by."],
    ["FiBell", "Budgets, forecast, anomalies", "Budget structures, forecasting on any unit cost, and anomaly alerts on unexpected movement."],
    ["FiTool", "Waste detection with an owner", "CostGuard consolidates recommendations across providers, assigns an owner and tracks the saving — into Jira, Slack or ServiceNow."],
  ];
  const xs = [0.6, 4.74, 8.88];
  const ys = [2.32, 4.36];
  for (let i = 0; i < caps.length; i++) {
    const [ic, name, desc] = caps[i];
    const x = xs[i % 3], y = ys[Math.floor(i / 3)];
    card(s, { x, y, w: 3.84, h: 1.88, fill: TINT, shadow: false });
    await iconBadge(s, { x: x + 0.32, y: y + 0.26, d: 0.5, bg: WHITE, icon: ic, color: "1F6B5C" });
    s.addText(name, {
      x: x + 0.96, y: y + 0.24, w: 2.7, h: 0.54, fontFace: HEAD, fontSize: 15, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: x + 0.32, y: y + 0.86, w: 3.2, h: 0.94, fontFace: BODY, fontSize: 11.5,
      color: MUTED, margin: 0, valign: "top", lineSpacing: 15,
    });
  }

  card(s, { x: M, y: 6.4, w: 12.13, h: 0.86, fill: DARK_CARD });
  s.addText(
    [
      { text: "Before buying, prove three things on our own data:  ", options: { color: AMBER, bold: true } },
      { text: "that it allocates the spend we cannot allocate today, that it attributes Azure OpenAI cost per calling application rather than per resource, and that it exports FOCUS so we are not locked in. Vendor-published outcomes — around 30% cost reduction and 50% engineer time saved — are marketing claims, not a forecast for us.", options: { color: MUTED_D } },
    ],
    { x: M + 0.36, y: 6.4, w: 11.4, h: 0.86, fontFace: BODY, fontSize: 12, margin: 0,
      valign: "middle", lineSpacing: 16 }
  );

  note(s, "tooling-finout");
}

async function slideClosing() {
  const s = pres.addSlide();
  bg(s, DARK);
  s.addText("Questions & discussion", {
    x: M, y: 1.85, w: 8, h: 0.9, fontFace: HEAD, fontSize: 40, bold: true,
    color: WHITE, margin: 0, valign: "middle",
  });
  s.addText("FinOps: Visibility & Governance — seeing cloud spend, and controlling it", {
    x: M, y: 2.85, w: 7.6, h: 0.45, fontFace: BODY, fontSize: 16,
    color: MUTED_D, margin: 0, valign: "middle",
  });

  s.addText("Key contacts", {
    x: M, y: 3.95, w: 4, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.8, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText(
    [
      { text: "____________________   ·   Title", options: { breakLine: true } },
      { text: "____________________   ·   Title" },
    ],
    { x: M, y: 4.32, w: 5.5, h: 0.9, fontFace: BODY, fontSize: 14.5, color: MUTED_D, margin: 0, valign: "top", lineSpacing: 24 }
  );

  s.addText("Resources", {
    x: M, y: 5.4, w: 4, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.8, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText(
    [
      { text: "FinOps Foundation   ·   finops.org", options: { breakLine: true } },
      { text: "FOCUS standard   ·   focus.finops.org" },
    ],
    { x: M, y: 5.77, w: 6, h: 0.9, fontFace: BODY, fontSize: 14.5, color: WHITE, margin: 0, valign: "top", lineSpacing: 24 }
  );

  dotGrid(s, {
    x: 8.75, y: 2.1, cols: 7, rows: 7, gap: 0.56, d: 0.3, dim: "27313E",
    lit: (c, r) => c + r >= 5,
  });

  note(s, "closing");
}

/* ---------- merged: why visibility + what good looks like ---------- */
async function slideVisibility() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Why visibility first");
  title(s, "You cannot optimize what you cannot see");
  sub(s, "Four questions the business must be able to answer — and the four capabilities that answer them.");

  const rows = [
    ["Which teams and products drive the spend?", "FiPieChart", "Cost allocation", "By team, product and environment — which depends on consistent tagging."],
    ["Is spend growing with the business, or faster?", "FiTrendingUp", "Unit economics", "Cost per customer, per transaction, per model call."],
    ["What are we paying for and not using?", "FiBarChart2", "Granular reporting", "By service and resource, over time — where trends and spikes show."],
    ["Can we act before the month closes?", "FiClock", "Fresh data", "Daily, not monthly. Monthly reporting cannot catch a regression."],
  ];
  let y = 2.32;
  for (const [q, ic, cap, desc] of rows) {
    card(s, { x: M, y, w: 12.13, h: 1.02, fill: TINT, shadow: false });
    s.addText(q, {
      x: M + 0.34, y, w: 5.1, h: 1.02, fontFace: BODY, fontSize: 14.5, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    await iconBadge(s, { x: 6.0, y: y + 0.26, d: 0.5, bg: WHITE, icon: ic, color: "B87B18" });
    s.addText(
      [
        { text: cap, options: { bold: true, fontSize: 14, color: INK, breakLine: true } },
        { text: desc, options: { fontSize: 12, color: MUTED } },
      ],
      { x: 6.64, y, w: 5.75, h: 1.02, fontFace: BODY, margin: 0, valign: "middle", lineSpacing: 16 }
    );
    y += 1.1;
  }

  card(s, { x: M, y: 6.72, w: 12.13, h: 0.62, fill: DARK_CARD, shadow: false });
  s.addText(
    [
      { text: "The goal:  ", options: { color: AMBER, bold: true } },
      { text: "move from “IT is overspending” to “Team X used Y, at cost Z, delivering A.”", options: { color: WHITE } },
    ],
    { x: M + 0.34, y: 6.72, w: 11.45, h: 0.62, fontFace: BODY, fontSize: 14, margin: 0, valign: "middle" }
  );

  note(s, "visibility");
}

/* ---------- merged: shared resources + commitments ---------- */
async function slideHardCases() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "The hard cases");
  title(s, "Two costs that resist a simple owner");
  sub(s, "Tagging solves most allocation. These two need a decision instead.");

  const cases = [
    {
      x: M, fill: TEAL_SOFT, accent: "1F6B5C", icon: "FiShare2",
      name: "Shared platforms",
      lead: "Databases, clusters and gateways serve many teams under one set of tags.",
      points: [
        "Split on measured consumption, not headcount — it survives the argument",
        "Freeze the method for the fiscal year and write it down",
        "Per-team attribution needs usage instrumentation, not tags",
      ],
    },
    {
      x: 6.83, fill: AMBER_SOFT, accent: "B87B18", icon: "FiPercent",
      name: "Commitments & discounts",
      lead: "Reserved capacity and savings plans mean the rate shown is not the rate paid.",
      points: [
        "Report coverage and utilization separately — they fail differently",
        "Show list and discounted price, and attribute the saving to who earned it",
        "An unused commitment is prepaid waste, invisible on a list-price report",
      ],
    },
  ];
  for (const c of cases) {
    card(s, { x: c.x, y: 2.32, w: 5.9, h: 3.55, fill: c.fill, shadow: false });
    await iconBadge(s, { x: c.x + 0.34, y: 2.58, d: 0.56, bg: WHITE, icon: c.icon, color: c.accent });
    s.addText(c.name, {
      x: c.x + 1.06, y: 2.56, w: 4.5, h: 0.6, fontFace: HEAD, fontSize: 19, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(c.lead, {
      x: c.x + 0.34, y: 3.28, w: 5.22, h: 0.6, fontFace: BODY, fontSize: 13,
      color: MUTED, margin: 0, valign: "top", lineSpacing: 17,
    });
    let py = 4.0;
    for (const p of c.points) {
      s.addShape(pres.ShapeType.ellipse, {
        x: c.x + 0.36, y: py + 0.14, w: 0.11, h: 0.11,
        fill: { color: c.accent }, line: { type: "none" },
      });
      s.addText(p, {
        x: c.x + 0.62, y: py, w: 4.94, h: 0.56, fontFace: BODY, fontSize: 12.5,
        color: INK, margin: 0, valign: "top", lineSpacing: 16,
      });
      py += 0.6;
    }
  }

  card(s, { x: M, y: 6.1, w: 12.13, h: 1.1, fill: DARK_CARD });
  s.addText(
    [
      { text: "Start with showback either way. ", options: { color: AMBER, bold: true } },
      { text: "Report each team's share for four to six weeks with nothing charged. It surfaces the allocation disputes while the stakes are low — then chargeback becomes a date rather than an argument.", options: { color: MUTED_D } },
    ],
    { x: M + 0.36, y: 6.1, w: 11.4, h: 1.1, fontFace: BODY, fontSize: 13.5, margin: 0,
      valign: "middle", lineSpacing: 19 }
  );

  note(s, "hard-cases");
}

/* ---------- new: the whole cost of a project ---------- */
async function slideProjectCost() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "What a project actually costs");
  title(s, "The model is one line on a longer bill");
  sub(s, "An AI feature is quoted at its token cost. It runs on a stack that bills every month regardless.");

  /* the stack */
  card(s, { x: M, y: 2.3, w: 5.5, h: 4.05, fill: TINT, shadow: false });
  s.addText("One project, billed in parts", {
    x: M + 0.34, y: 2.48, w: 4.8, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: MUTED, margin: 0, valign: "middle",
  });
  const layers = [
    ["Model / token spend", "the line everyone quotes", AMBER],
    ["Compute", "app services, containers, nodes", "6E7A88"],
    ["Databases", "SQL, Cosmos, managed Postgres", "6E7A88"],
    ["Cache & queues", "Redis, Service Bus, event hubs", "6E7A88"],
    ["Storage & backup", "documents, embeddings, retention", "6E7A88"],
    ["Network & gateway", "egress, private endpoints, APIM", "6E7A88"],
    ["Observability", "log and metric ingestion, retention", "6E7A88"],
  ];
  let ly = 2.9;
  for (const [name, desc, color] of layers) {
    s.addShape(pres.ShapeType.roundRect, {
      x: M + 0.34, y: ly + 0.08, w: 0.1, h: 0.32, rectRadius: 0.05,
      fill: { color }, line: { type: "none" },
    });
    s.addText(
      [
        { text: name + "   ", options: { bold: true, color: color === AMBER ? "6B4A0E" : INK } },
        { text: desc, options: { color: MUTED } },
      ],
      { x: M + 0.58, y: ly, w: 4.9, h: 0.46, fontFace: BODY, fontSize: 12.5, margin: 0, valign: "middle" }
    );
    ly += 0.47;
  }

  const rightX = 6.5;
  card(s, { x: rightX, y: 2.3, w: 6.23, h: 1.92, fill: DARK_CARD });
  s.addText("What gets left out of the estimate", {
    x: rightX + 0.34, y: 2.48, w: 5.5, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: AMBER, margin: 0, valign: "middle",
  });
  const forgotten = [
    "Non-production copies that never switch off",
    "Log and trace ingestion, which scales with traffic",
    "Egress and cross-region calls between the parts",
    "Retention — of documents, embeddings and backups",
  ];
  let fy = 2.86;
  for (const f of forgotten) {
    s.addShape(pres.ShapeType.ellipse, {
      x: rightX + 0.36, y: fy + 0.12, w: 0.1, h: 0.1,
      fill: { color: AMBER }, line: { type: "none" },
    });
    s.addText(f, {
      x: rightX + 0.6, y: fy, w: 5.4, h: 0.34, fontFace: BODY, fontSize: 12.5,
      color: MUTED_D, margin: 0, valign: "middle",
    });
    fy += 0.34;
  }

  card(s, { x: rightX, y: 4.42, w: 6.23, h: 1.93, fill: TEAL_SOFT, shadow: false });
  s.addText("Report the project, not the resource", {
    x: rightX + 0.34, y: 4.6, w: 5.5, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: "1F6B5C", margin: 0, valign: "middle",
  });
  s.addText(
    "One ApplicationID across every resource the project touches, so the review sees a single " +
    "number and a single owner. Then divide it by the unit that matters — cost per customer, per " +
    "order, per conversation — and the model share becomes a ratio anyone can argue with.",
    { x: rightX + 0.34, y: 4.96, w: 5.55, h: 1.3, fontFace: BODY, fontSize: 13,
      color: INK, margin: 0, valign: "top", lineSpacing: 18 }
  );

  s.addText(
    "A project quoted at its model cost alone will be wrong by the size of everything under it — and the surprise arrives at the first full month, not at the pilot.",
    { x: M, y: 6.5, w: 12.13, h: 0.5, fontFace: HEAD, fontSize: 14, italic: true,
      color: MUTED, margin: 0, valign: "middle" }
  );

  note(s, "project-cost");
}

/* ---------- merged: shift left + design questions ---------- */
async function slideShiftLeft() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Shift left");
  title(s, "A seat at the design table");
  sub(s, "Most of a workload's lifetime cost is settled once the architecture is agreed. FinOps belongs in that conversation, not in the postmortem.");

  const stages = ["Requirements", "Design", "Build", "Deploy", "Run", "Invoice"];
  const bandY = 2.72;
  const stageW = 1.94, gapW = 0.11;
  for (let i = 0; i < stages.length; i++) {
    const x = M + i * (stageW + gapW);
    const early = i < 2;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: bandY, w: stageW, h: 0.58, rectRadius: 0.08,
      fill: { color: early ? AMBER_SOFT : TINT }, line: { type: "none" },
    });
    s.addText(stages[i], {
      x, y: bandY, w: stageW, h: 0.58, fontFace: BODY, fontSize: 12.5, bold: early,
      color: early ? "6B4A0E" : MUTED, margin: 0, align: "center", valign: "middle",
    });
  }
  s.addText("Where FinOps belongs", {
    x: M, y: bandY - 0.38, w: 4.1, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.4, color: "B87B18", margin: 0, valign: "middle",
  });
  s.addText("Where FinOps usually arrives", {
    x: M + 4 * (stageW + gapW), y: bandY - 0.38, w: 3.93, h: 0.3, fontFace: BODY,
    fontSize: 11.5, bold: true, charSpacing: 1.4, color: MUTED, margin: 0,
    align: "right", valign: "middle",
  });

  card(s, { x: M, y: 3.72, w: 5.9, h: 2.5, fill: DARK_CARD });
  s.addText("The exchange in the room", {
    x: M + 0.34, y: 3.9, w: 5, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.4, color: AMBER, margin: 0, valign: "middle",
  });
  const exchange = [
    ["FinOps brings", "two or three priced options, a cost target, the allocation plan"],
    ["FinOps leaves with", "the real SLO, what is temporary, which unit carries the value"],
  ];
  let ey = 4.3;
  for (const [label, desc] of exchange) {
    s.addText(
      [
        { text: label, options: { bold: true, color: WHITE, breakLine: true } },
        { text: desc, options: { color: MUTED_D } },
      ],
      { x: M + 0.34, y: ey, w: 5.22, h: 0.9, fontFace: BODY, fontSize: 13, margin: 0,
        valign: "top", lineSpacing: 18 }
    );
    ey += 0.94;
  }

  card(s, { x: 6.83, y: 3.72, w: 5.9, h: 2.5, fill: TINT, shadow: false });
  s.addText("Six questions before the build starts", {
    x: 7.17, y: 3.9, w: 5, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.4, color: MUTED, margin: 0, valign: "middle",
  });
  const qs = [
    "Peak versus average — how spiky is the load?",
    "How much data, kept how long, leaving the region?",
    "What does the SLO genuinely require?",
    "What is temporary, and when does it switch off?",
    "For AI: tokens, cache rate, model tier",
    "Which owner, and which unit do we divide by?",
  ];
  let qy = 4.24;
  for (const q of qs) {
    s.addShape(pres.ShapeType.ellipse, {
      x: 7.19, y: qy + 0.1, w: 0.1, h: 0.1, fill: { color: "B87B18" }, line: { type: "none" },
    });
    s.addText(q, {
      x: 7.43, y: qy, w: 5.1, h: 0.32, fontFace: BODY, fontSize: 12.5,
      color: INK, margin: 0, valign: "middle",
    });
    qy += 0.32;
  }

  s.addText(
    "The output is a cost target recorded beside the latency and availability targets. It works where FinOps sits with engineers rather than auditing them.",
    { x: M, y: 6.44, w: 12.13, h: 0.5, fontFace: BODY, fontSize: 12.5,
      color: MUTED, margin: 0, valign: "middle" }
  );

  note(s, "shift-left");
}

/* ---------- merged: application ownership + who does what ---------- */
async function slideOwnership() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Ownership");
  title(s, "Every workload has a named owner");
  sub(s, "A person, not a distribution list. A group address answers nothing at 2am on a Sunday.");

  const duties = [
    ["FiCheckSquare", "Owns the budget", "Signs it off and explains the variance."],
    ["FiBell", "Answers the alerts", "The routing target for their workload."],
    ["FiCalendar", "Reviews monthly", "With their own numbers, not a summary."],
    ["FiTrash2", "Decommissions", "Nothing else retires unused resources."],
  ];
  const xs = [0.6, 3.7, 6.8, 9.9];
  for (let i = 0; i < duties.length; i++) {
    const [ic, name, desc] = duties[i];
    card(s, { x: xs[i], y: 2.3, w: 2.83, h: 1.95, fill: TINT, shadow: false });
    await iconBadge(s, { x: xs[i] + 0.28, y: 2.54, d: 0.5, bg: WHITE, icon: ic, color: "1F6B5C" });
    s.addText(name, {
      x: xs[i] + 0.28, y: 3.16, w: 2.3, h: 0.36, fontFace: HEAD, fontSize: 15, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: xs[i] + 0.28, y: 3.54, w: 2.3, h: 0.62, fontFace: BODY, fontSize: 12,
      color: MUTED, margin: 0, valign: "top", lineSpacing: 15,
    });
  }

  card(s, { x: M, y: 4.5, w: 7.3, h: 1.95, fill: TINT, shadow: false });
  s.addText("And who owns the practice", {
    x: M + 0.34, y: 4.68, w: 5, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.4, color: MUTED, margin: 0, valign: "middle",
  });
  const raci = [
    ["Finance", "budgets and allocation policy"],
    ["Platform / FinOps", "the standard, the data, the tooling"],
    ["Engineering", "guardrails, instrumentation, response"],
    ["Leadership", "commitments and the trade-offs"],
  ];
  let ry = 5.06;
  for (const [who, what] of raci) {
    s.addText(who, {
      x: M + 0.34, y: ry, w: 2.2, h: 0.32, fontFace: BODY, fontSize: 12.5, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(what, {
      x: M + 2.6, y: ry, w: 4.36, h: 0.32, fontFace: BODY, fontSize: 12.5,
      color: MUTED, margin: 0, valign: "middle",
    });
    ry += 0.34;
  }

  card(s, { x: 8.23, y: 4.5, w: 4.5, h: 1.95, fill: AMBER_SOFT, shadow: false });
  s.addText("Unowned is not unbudgeted", {
    x: 8.57, y: 4.68, w: 4, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.4, color: "6B4A0E", margin: 0, valign: "middle",
  });
  s.addText(
    "A resource with no owner is charged to the central budget — the one place cost is hardest " +
    "to challenge. Make ownership a deployment requirement, and give orphans a standing rule: " +
    "no owner, no renewal.",
    { x: 8.57, y: 5.04, w: 3.86, h: 1.3, fontFace: BODY, fontSize: 12.5,
      color: "6B4A0E", margin: 0, valign: "top", lineSpacing: 17 }
  );

  s.addText(
    "FinOps fails when it is one team's job — no single function above owns more than one line of it.",
    { x: M, y: 6.62, w: 12.13, h: 0.44, fontFace: BODY, fontSize: 12.5,
      color: MUTED, margin: 0, valign: "middle" }
  );

  note(s, "ownership");
}

/* ---------- merged: budgets + quotas + alert tiers ---------- */
async function slideControls() {
  const s = pres.addSlide();
  bg(s, DARK);
  kicker(s, "The controls");
  title(s, "A report is not a control", true);
  sub(s, "Three mechanisms, ordered by how fast each one acts on spend that is already running.", true);

  const controls = [
    ["FiSliders", "Quotas and rate limits", "seconds", "Token and request caps, gateway throttling, autoscale ceilings. The only control that stops spend in progress — and reversible in minutes, which is what makes it safe to set.", AMBER],
    ["FiBell", "Alerts, tiered by what they prevent", "minutes to days", "Usage-plane alerts page an owner. Billing-plane alerts go to a channel. Advisory alerts become tickets. Never page on a budget number — and alert on silence too, because a stopped feed looks like a good month.", AMBER],
    ["FiTrendingDown", "Budget thresholds", "within the month", "Notify, review, gate — measured against the elapsed month, so day 10 at 60% of budget is the alert. A flat 80% fires on day 24 of a healthy month and day 8 of a catastrophic one.", TEAL],
  ];
  let y = 2.42;
  for (const [ic, name, speed, desc, color] of controls) {
    card(s, { x: M, y, w: 12.13, h: 1.34, fill: DARK_CARD, shadow: false });
    await iconBadge(s, { x: M + 0.34, y: y + 0.34, d: 0.56, bg: "2E3A48", icon: ic, color });
    s.addText(name, {
      x: M + 1.06, y: y + 0.16, w: 4.4, h: 0.5, fontFace: HEAD, fontSize: 17, bold: true,
      color: WHITE, margin: 0, valign: "middle",
    });
    s.addText(speed, {
      x: M + 1.06, y: y + 0.66, w: 4.4, h: 0.4, fontFace: BODY, fontSize: 12, bold: true,
      color, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: M + 5.7, y: y + 0.2, w: 6.4, h: 1.0, fontFace: BODY, fontSize: 12.5,
      color: MUTED_D, margin: 0, valign: "middle", lineSpacing: 17,
    });
    y += 1.44;
  }

  s.addText(
    "“A cost alert cannot save you from a runaway job — by the time the billing data moves, the money is spent.”",
    { x: M, y: 6.78, w: 12.13, h: 0.5, fontFace: HEAD, fontSize: 14.5, italic: true,
      color: AMBER, margin: 0, valign: "middle" }
  );

  note(s, "controls");
}

/* ---------- merged: where to start + what it buys ---------- */
async function slidePathForward() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "The path forward");
  title(s, "Where to start, and what it buys");

  const steps = [
    ["01", "Tagging standard", "Agreed and enforced at deployment, with an owner per application.", true],
    ["02", "Biggest spend first", "Attack the largest categories. Perfect granularity everywhere is a trap.", false],
    ["03", "Guardrails on", "Quotas and budget thresholds before they are needed, not after.", false],
    ["04", "Finance in the room", "A monthly review with real numbers, and a date for chargeback.", false],
  ];
  const xs = [0.6, 3.7, 6.8, 9.9];
  for (let i = 0; i < steps.length; i++) {
    const [num, name, desc, hero] = steps[i];
    card(s, { x: xs[i], y: 2.15, w: 2.83, h: 2.4, fill: hero ? DARK_CARD : TINT, shadow: false });
    s.addText(num, {
      x: xs[i] + 0.28, y: 2.34, w: 1.2, h: 0.5, fontFace: HEAD, fontSize: 26, bold: true,
      color: hero ? AMBER : "B9C2CD", margin: 0, valign: "middle",
    });
    s.addText(name, {
      x: xs[i] + 0.28, y: 2.9, w: 2.3, h: 0.6, fontFace: HEAD, fontSize: 15, bold: true,
      color: hero ? WHITE : INK, margin: 0, valign: "top", lineSpacing: 20,
    });
    s.addText(desc, {
      x: xs[i] + 0.28, y: 3.52, w: 2.3, h: 0.86, fontFace: BODY, fontSize: 12,
      color: hero ? MUTED_D : MUTED, margin: 0, valign: "top", lineSpacing: 15,
    });
  }

  card(s, { x: M, y: 4.78, w: 5.9, h: 1.85, fill: TINT, shadow: false });
  s.addText("How we will know it is working", {
    x: M + 0.34, y: 4.96, w: 5, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.4, color: MUTED, margin: 0, valign: "middle",
  });
  const kpis = [
    ["Allocation coverage", "under 5%, reported weekly"],
    ["Time to attribute a spike", "hours, not days"],
    ["Findings owned and dated", "adoption, not accuracy"],
  ];
  let ky = 5.34;
  for (const [k, v] of kpis) {
    s.addText(k, {
      x: M + 0.34, y: ky, w: 2.6, h: 0.32, fontFace: BODY, fontSize: 12.5, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(v, {
      x: M + 3.0, y: ky, w: 2.56, h: 0.32, fontFace: BODY, fontSize: 12.5,
      color: MUTED, margin: 0, align: "right", valign: "middle",
    });
    ky += 0.36;
  }

  card(s, { x: 6.83, y: 4.78, w: 5.9, h: 1.85, fill: DARK_CARD });
  s.addText("What it buys", {
    x: 7.17, y: 4.96, w: 5, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.4, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText(
    "Not a smaller invoice — an invoice with nothing in it we have not already seen, explained " +
    "and decided about. Visibility makes ownership possible, ownership changes behaviour, and " +
    "changed behaviour is the only saving that survives the quarter.",
    { x: 7.17, y: 5.32, w: 5.22, h: 1.2, fontFace: BODY, fontSize: 13,
      color: WHITE, margin: 0, valign: "top", lineSpacing: 18 }
  );

  s.addText(
    "Two decisions today: who owns the tagging standard, and whether we are willing to have a limit that actually blocks.",
    { x: M, y: 6.78, w: 12.13, h: 0.46, fontFace: HEAD, fontSize: 14, italic: true,
      color: MUTED, margin: 0, valign: "middle" }
  );

  note(s, "path-forward");
}

/* ---------- main ---------- */
(async () => {
  pres = new pptxgen();
  kit.setPres(pres);
  pres.layout = "LAYOUT_WIDE";
  pres.author = "FinOps";
  pres.title = "FinOps: Gaining Visibility";
  pres.subject = AUDIENCE === "cfo"
    ? "Cloud financial management — CFO briefing"
    : "Cloud financial management — management briefing";

  await slideTitle();
  await slideProblem();
  await slideVisibility();
  await slideBlockers();
  await slideTagging();
  await slideHardCases();
  await slideProjectCost();
  await slideAiCost();
  await slideShiftLeft();
  await slideOwnership();
  await slideControls();
  await slideBillingShock();
  await slideTooling();
  await slidePathForward();
  await slideClosing();

  await pres.writeFile({ fileName: OUT });
  console.log("wrote " + OUT + "  (notes: " + AUDIENCE + ")");
})();
