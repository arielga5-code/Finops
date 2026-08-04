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

async function slideWhatIsFinops() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Definition");
  title(s, "FinOps = Finance + DevOps");
  sub(s,
    "An operational framework and cultural practice for maximizing the business value of cloud investment. " +
    "Not a cost-cutting programme — a way to make the financial impact of technical choices visible to everyone.",
    false, { y: 1.72, w: 11.9, h: 0.62, size: 14.5 }
  );

  const phases = [
    ["FiSearch", "01", "Inform", "Build visibility. Understand who is spending what, where, and why.", true],
    ["FiSliders", "02", "Optimize", "Act on the insight. Rightsize, eliminate waste, manage commitments.", false],
    ["FiRefreshCw", "03", "Operate", "Embed cost awareness into daily engineering and business process.", false],
  ];
  const xs = [0.6, 4.74, 8.88];
  for (let i = 0; i < phases.length; i++) {
    const [ic, num, name, desc, hero] = phases[i];
    card(s, {
      x: xs[i], y: 2.7, w: 3.84, h: 2.65,
      fill: hero ? DARK_CARD : TINT,
    });
    await iconBadge(s, {
      x: xs[i] + 0.34, y: 3.0, d: 0.66,
      bg: hero ? AMBER : WHITE, icon: ic, color: hero ? "13202B" : "B87B18",
    });
    s.addText(num, {
      x: xs[i] + 2.6, y: 3.0, w: 0.9, h: 0.66, fontFace: HEAD, fontSize: 26, bold: true,
      color: hero ? "3B4A5A" : "C8D0DA", margin: 0, align: "right", valign: "middle",
    });
    s.addText(name, {
      x: xs[i] + 0.34, y: 3.82, w: 3.16, h: 0.42, fontFace: HEAD, fontSize: 22, bold: true,
      color: hero ? WHITE : INK, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: xs[i] + 0.34, y: 4.28, w: 3.16, h: 0.9, fontFace: BODY, fontSize: 13,
      color: hero ? MUTED_D : MUTED, margin: 0, valign: "top", lineSpacing: 17,
    });
  }

  s.addText("A continuous cycle, not a sequence of projects.", {
    x: M, y: 5.55, w: 6, h: 0.34, fontFace: BODY, fontSize: 12.5, color: MUTED, margin: 0, valign: "middle",
  });

  quoteBlock(s, {
    x: M, y: 6.05, w: 12.13, h: 0.82, fill: AMBER_SOFT, color: "6B4A0E", size: 16,
    text: "“Without visibility, nothing else in the practice works.”",
  });

  note(s, "what-is-finops");
}

async function slideWhyVisibility() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Why visibility first");
  title(s, "You cannot optimize what you cannot see");
  sub(s, "Four questions the organization must be able to answer before any meaningful optimization begins.");

  const rows = [
    ["Which teams, products or features drive cloud spend?", "Accountability"],
    ["Is spend growing with the business — or faster than it?", "Efficiency signal"],
    ["Which resources are paid for but sitting unused?", "Waste identification"],
    ["Are costs allocated accurately enough to drive ownership?", "Behaviour change"],
  ];
  let y = 2.28;
  for (const [q, why] of rows) {
    card(s, { x: M, y, w: 12.13, h: 0.78, fill: TINT, shadow: false });
    s.addText(q, {
      x: M + 0.34, y, w: 8.0, h: 0.78, fontFace: BODY, fontSize: 15, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(why, {
      x: 9.1, y: y + 0.19, w: 3.3, h: 0.4, fontFace: BODY, fontSize: 12.5, bold: true,
      charSpacing: 0.8, color: TEAL, margin: 0, align: "right", valign: "middle",
    });
    y += 0.9;
  }

  card(s, { x: M, y: 6.02, w: 12.13, h: 0.92, fill: DARK_CARD });
  s.addText(
    [
      { text: "The risk of skipping visibility:  ", options: { bold: true, color: AMBER } },
      { text: "optimization becomes reactive and superficial — blanket cost-cutting instead of targeted action against real waste.", options: { color: WHITE } },
    ],
    { x: M + 0.34, y: 6.02, w: 11.45, h: 0.92, fontFace: BODY, fontSize: 14, margin: 0, valign: "middle" }
  );

  note(s, "why-visibility");
}

async function slideFramework() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "The visibility framework");
  title(s, "What “good visibility” looks like");

  const caps = [
    ["FiPieChart", "Cost allocation", "Breakdown by team, product, environment or business unit. Depends entirely on a consistent tagging strategy."],
    ["FiBarChart2", "Granular reporting", "Breakdown by service, resource type and time period — this is what reveals trends, spikes and anomalies."],
    ["FiTrendingUp", "Unit economics", "Cost per customer, per transaction, per active user. The measure of whether spend growth is healthy."],
    ["FiClock", "Near real-time data", "Monthly reporting is too slow. Cost data must arrive with enough immediacy to respond to anomalies."],
  ];
  const xs = [0.6, 6.83];
  const ys = [1.95, 3.72];
  for (let i = 0; i < caps.length; i++) {
    const [ic, name, desc] = caps[i];
    const x = xs[i % 2], y = ys[Math.floor(i / 2)];
    card(s, { x, y, w: 5.9, h: 1.62, fill: TINT, shadow: false });
    await iconBadge(s, { x: x + 0.32, y: y + 0.44, d: 0.7, bg: WHITE, icon: ic, color: "B87B18" });
    s.addText(name, {
      x: x + 1.2, y: y + 0.24, w: 4.4, h: 0.38, fontFace: HEAD, fontSize: 19, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: x + 1.2, y: y + 0.64, w: 4.42, h: 0.82, fontFace: BODY, fontSize: 12.5,
      color: MUTED, margin: 0, valign: "top", lineSpacing: 16,
    });
  }

  card(s, { x: M, y: 5.62, w: 12.13, h: 1.3, fill: DARK_CARD });
  s.addText("The goal", {
    x: M + 0.36, y: 5.78, w: 3, h: 0.3, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText(
    [
      { text: "Move from  ", options: { color: MUTED_D } },
      { text: "“IT is overspending”", options: { color: MUTED_D, italic: true } },
      { text: "  to  ", options: { color: MUTED_D } },
      { text: "“Team X used Y resources, costing $Z, delivering A value.”", options: { color: WHITE, bold: true } },
    ],
    { x: M + 0.36, y: 6.12, w: 11.4, h: 0.62, fontFace: BODY, fontSize: 16, margin: 0, valign: "middle" }
  );

  note(s, "framework");
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

async function slideSharedResources() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Solution 2 — shared resources");
  title(s, "Attributing costs that belong to everyone");
  sub(s, "Shared databases, Kubernetes clusters and networking are the hardest costs to assign to a single owner.");

  const approaches = [
    ["FiCpu", "Attribute-based allocation", "Identify consumption at runtime and allocate on actual usage rather than an arbitrary key."],
    ["FiGitMerge", "Define a splitting strategy", "Pick one consistent method — proportional usage, team count, or a business metric — and publish it."],
    ["FiEye", "Start with showback", "Report each team's share of shared cost without billing it. Builds awareness and surfaces disputes early."],
    ["FiCreditCard", "Progress to chargeback", "Bill teams on actual consumption once the usage patterns are understood and trusted."],
  ];
  const xs = [0.6, 6.83];
  const ys = [2.3, 4.0];
  for (let i = 0; i < approaches.length; i++) {
    const [ic, name, desc] = approaches[i];
    const x = xs[i % 2], y = ys[Math.floor(i / 2)];
    card(s, { x, y, w: 5.9, h: 1.55, fill: TEAL_SOFT, shadow: false });
    await iconBadge(s, { x: x + 0.32, y: y + 0.28, d: 0.6, bg: WHITE, icon: ic, color: "1F6B5C" });
    s.addText(name, {
      x: x + 1.06, y: y + 0.24, w: 4.5, h: 0.4, fontFace: HEAD, fontSize: 18, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: x + 0.34, y: y + 0.72, w: 5.22, h: 0.78, fontFace: BODY, fontSize: 12.5,
      color: MUTED, margin: 0, valign: "top", lineSpacing: 16,
    });
  }

  quoteBlock(s, {
    x: M, y: 5.95, w: 12.13, h: 0.95, fill: DARK_CARD, color: WHITE, size: 15,
    text: "“A thoughtful chargeback model often drives more intentional decisions and long-term discipline.”",
  });

  note(s, "shared-resources");
}

async function slideCommitments() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Solution 3 — commitments & discounts");
  title(s, "Making the price we actually pay visible");
  sub(s, "Discounts obscure true attribution: the price shown on a resource is not the price the business paid.");

  card(s, { x: M, y: 2.3, w: 3.85, h: 2.98, fill: DARK_CARD });
  s.addText("60–80%", {
    x: M + 0.28, y: 2.86, w: 3.3, h: 1.05, fontFace: HEAD, fontSize: 46, bold: true,
    color: AMBER, margin: 0, valign: "middle",
  });
  s.addText("Target commitment coverage on stable, predictable workloads.", {
    x: M + 0.32, y: 4.05, w: 3.2, h: 1.0, fontFace: BODY, fontSize: 14,
    color: MUTED_D, margin: 0, valign: "top", lineSpacing: 19,
  });

  const actions = [
    ["FiLayers", "Separate discount from list price", "Show MSRP and the discounted price side by side, with the attributed saving alongside."],
    ["FiGift", "Attribute savings to the beneficiary", "If a team consumes the resources that earned the discount, that team should see the saving."],
    ["FiTarget", "Track commitment coverage", "Know what share of steady-state spend sits under a commitment, and where the gaps are."],
    ["FiActivity", "Monitor utilization", "An unused commitment is not a discount — it is prepaid waste."],
  ];
  let y = 2.3;
  for (const [ic, label, desc] of actions) {
    card(s, { x: 4.88, y, w: 7.85, h: 0.7, fill: TINT, shadow: false });
    await iconBadge(s, { x: 5.12, y: y + 0.11, d: 0.48, bg: WHITE, icon: ic, color: "B87B18" });
    s.addText(
      [
        { text: label + "   ", options: { bold: true, color: INK, fontSize: 14 } },
        { text: desc, options: { color: MUTED, fontSize: 12 } },
      ],
      { x: 5.78, y, w: 6.8, h: 0.7, fontFace: BODY, margin: 0, valign: "middle", lineSpacing: 16 }
    );
    y += 0.76;
  }

  quoteBlock(s, {
    x: M, y: 5.62, w: 12.13, h: 0.85, fill: AMBER_SOFT, color: "6B4A0E", size: 15,
    text: "A commitment nobody uses is the most expensive form of waste — it is locked in, and it is invisible on a list-price report.",
  });

  note(s, "commitments");
}

async function slideMultiCloud() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Solution 4 — multi-cloud visibility");
  title(s, "One view across every provider");
  sub(s, "AWS Cost Explorer, Azure Cost Management and GCP Billing are capable — but each sees only its own silo.");

  const cols = [
    ["FiDatabase", "Centralized platform", "Ingest, normalize and enrich cost data from every provider into a single store."],
    ["FiCheckSquare", "Adopt the FOCUS standard", "The FinOps Open Cost and Usage Specification normalizes cloud billing into a vendor-agnostic schema."],
    ["FiMonitor", "Unified dashboard", "One place for analysis, reporting and optimization — across all clouds and vendors."],
  ];
  const xs = [0.6, 4.74, 8.88];
  for (let i = 0; i < cols.length; i++) {
    const [ic, name, desc] = cols[i];
    card(s, { x: xs[i], y: 2.35, w: 3.84, h: 2.7, fill: TINT, shadow: false });
    await iconBadge(s, { x: xs[i] + 0.34, y: 2.65, d: 0.7, bg: WHITE, icon: ic, color: "1F6B5C" });
    s.addText(name, {
      x: xs[i] + 0.34, y: 3.5, w: 3.16, h: 0.42, fontFace: HEAD, fontSize: 19, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: xs[i] + 0.34, y: 3.96, w: 3.16, h: 0.95, fontFace: BODY, fontSize: 12.5,
      color: MUTED, margin: 0, valign: "top", lineSpacing: 16,
    });
  }

  quoteBlock(s, {
    x: M, y: 5.35, w: 12.13, h: 1.35, fill: DARK_CARD, color: WHITE, size: 15,
    text: "“FOCUS enables consistent reporting across vendors, so leadership can analyze the whole environment " +
      "instead of looking at each cloud or vendor in a silo.”",
  });

  note(s, "multi-cloud");
}

async function slideShowbackChargeback() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Building accountability");
  title(s, "Showback, then chargeback");

  const models = [
    {
      x: 0.6, fill: TEAL_SOFT, badge: TEAL, name: "Showback", icon: "FiEye",
      tag: "The visibility layer",
      what: "Teams see their spend. No money changes hands.",
      best: ["Early FinOps practice", "Tagging coverage of 70–85%", "Building awareness and trust"],
    },
    {
      x: 6.83, fill: AMBER_SOFT, badge: AMBER, name: "Chargeback", icon: "FiCreditCard",
      tag: "The real consequence",
      what: "Costs are billed back to business units and hit their P&L.",
      best: ["Mature, trusted allocation", "Budget-owner accountability", "Driving behaviour change"],
    },
  ];
  for (const m of models) {
    card(s, { x: m.x, y: 1.95, w: 5.9, h: 3.35, fill: m.fill, shadow: false });
    await iconBadge(s, { x: m.x + 0.34, y: 2.22, d: 0.64, bg: WHITE, icon: m.icon, color: m.badge === TEAL ? "1F6B5C" : "B87B18" });
    s.addText(m.name, {
      x: m.x + 1.12, y: 2.22, w: 2.6, h: 0.64, fontFace: HEAD, fontSize: 21, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(m.tag, {
      x: m.x + 3.75, y: 2.22, w: 1.81, h: 0.64, fontFace: BODY, fontSize: 11.5, bold: true,
      charSpacing: 1.4, color: MUTED, margin: 0, align: "right", valign: "middle",
    });
    s.addText(m.what, {
      x: m.x + 0.34, y: 3.0, w: 5.22, h: 0.6, fontFace: BODY, fontSize: 14.5,
      color: INK, margin: 0, valign: "top", lineSpacing: 19,
    });
    s.addText("Best for", {
      x: m.x + 0.34, y: 3.62, w: 3, h: 0.3, fontFace: BODY, fontSize: 11, bold: true,
      charSpacing: 1.6, color: MUTED, margin: 0, valign: "middle",
    });
    s.addText(
      m.best.map((b, i) => ({ text: b, options: { bullet: true, breakLine: i < m.best.length - 1 } })),
      { x: m.x + 0.42, y: 3.95, w: 5.1, h: 1.15, fontFace: BODY, fontSize: 13, color: MUTED, margin: 0, paraSpaceAfter: 5 }
    );
  }

  card(s, { x: M, y: 5.6, w: 12.13, h: 0.8, fill: DARK_CARD });
  s.addText(
    [
      { text: "Recommendation:  ", options: { bold: true, color: AMBER } },
      { text: "start with showback to build tagging discipline and trust. Move to chargeback once allocation is accurate and finance is ready.", options: { color: WHITE } },
    ],
    { x: M + 0.34, y: 5.6, w: 11.45, h: 0.8, fontFace: BODY, fontSize: 14.5, margin: 0, valign: "middle" }
  );
  s.addText(
    "“Most teams skip this runway and pay for it later with a chargeback rollout that nobody trusts.”",
    { x: M, y: 6.5, w: 12.13, h: 0.42, fontFace: HEAD, fontSize: 14, italic: true, color: MUTED, margin: 0, valign: "middle" }
  );

  note(s, "showback-chargeback");
}

async function slideBestPractices() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "2025–2026 best practices");
  title(s, "What high-performing FinOps teams do");
  sub(s, "Drawn from the 2025 State of FinOps report — the practices that consistently precede durable savings.");

  const items = [
    ["FiPieChart", "Clean allocation", "100% of spend allocated. No “unallocated” bucket left to argue about."],
    ["FiSunrise", "Daily visibility", "Cost data refreshed daily, not monthly. Monthly is too slow to catch a regression."],
    ["FiUsers", "Shared KPIs", "One agreed set of metrics across finance and engineering, reviewed together."],
    ["FiChevronsLeft", "Shift-left cost visibility", "Cost checks during design and development — treated like performance and security."],
    ["FiBell", "Anomaly alerts", "Real-time alerts routed to the owner of the spend, not to a shared mailbox."],
    ["FiLock", "Automated guardrails", "Policy-as-code that prevents costly deployments before they happen."],
  ];
  const xs = [0.6, 4.74, 8.88];
  const ys = [2.32, 4.6];
  for (let i = 0; i < items.length; i++) {
    const [ic, name, desc] = items[i];
    const x = xs[i % 3], y = ys[Math.floor(i / 3)];
    card(s, { x, y, w: 3.84, h: 1.95, fill: TINT, shadow: false });
    await iconBadge(s, { x: x + 0.32, y: y + 0.28, d: 0.6, bg: WHITE, icon: ic, color: "B87B18" });
    s.addText(name, {
      x: x + 1.04, y: y + 0.28, w: 2.6, h: 0.6, fontFace: HEAD, fontSize: 17, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: x + 0.32, y: y + 1.02, w: 3.2, h: 0.85, fontFace: BODY, fontSize: 12.5,
      color: MUTED, margin: 0, valign: "top", lineSpacing: 16,
    });
  }

  note(s, "best-practices");
}

/* ================= part two — governance ================= */

async function slideGovernanceIntro() {
  const s = pres.addSlide();
  bg(s, DARK);
  s.addText("PART TWO", {
    x: M, y: 1.35, w: 6, h: 0.3, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 2.6, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText("Governance", {
    x: M, y: 1.75, w: 6.6, h: 1.0, fontFace: HEAD, fontSize: 42, bold: true,
    color: WHITE, margin: 0, valign: "middle",
  });
  s.addText(
    "Visibility tells you what happened. Governance decides what is allowed to happen — " +
    "who owns the spend, what it may reach, and what stops it automatically.",
    { x: M, y: 2.9, w: 6.3, h: 1.1, fontFace: BODY, fontSize: 15.5, color: MUTED_D,
      margin: 0, valign: "top", lineSpacing: 22 }
  );
  s.addText(
    "Reporting is not a control. Every item on the right exists because someone found " +
    "that out the expensive way.",
    { x: M, y: 4.25, w: 6.3, h: 0.8, fontFace: HEAD, fontSize: 14.5, italic: true,
      color: AMBER, margin: 0, valign: "top", lineSpacing: 21 }
  );

  const pillars = [
    ["01", "Application ownership", "A named owner for every workload"],
    ["02", "Budget controls", "Thresholds that trigger before month-end"],
    ["03", "Rate limits & quotas", "The only control fast enough to stop spend"],
    ["04", "Automated alerts", "Routed to the person who can act"],
    ["05", "Shared responsibility", "Who decides, who builds, who pays"],
  ];
  let y = 1.5;
  for (const [num, name, desc] of pillars) {
    card(s, { x: 7.3, y, w: 5.43, h: 0.86, fill: DARK_CARD, shadow: false });
    s.addText(num, {
      x: 7.56, y, w: 0.6, h: 0.86, fontFace: HEAD, fontSize: 19, bold: true,
      color: AMBER, margin: 0, valign: "middle",
    });
    s.addText(
      [
        { text: name, options: { bold: true, fontSize: 14.5, color: WHITE, breakLine: true } },
        { text: desc, options: { fontSize: 12, color: MUTED_D } },
      ],
      { x: 8.24, y, w: 4.3, h: 0.86, fontFace: BODY, margin: 0, valign: "middle", lineSpacing: 16 }
    );
    y += 0.96;
  }

  note(s, "governance-intro");
}

async function slideAppOwnership() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Governance 1 — application ownership");
  title(s, "Every workload has a named owner");

  card(s, { x: M, y: 1.95, w: 4.1, h: 3.3, fill: DARK_CARD });
  await iconBadge(s, { x: M + 0.34, y: 2.24, d: 0.66, bg: AMBER, icon: "FiUser", color: "13202B" });
  s.addText("Owner of record", {
    x: M + 0.34, y: 3.05, w: 3.4, h: 0.34, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText(
    "A named person, not a distribution list and not “the platform team”. " +
    "A group address means nobody answers the alert at 2am on a Sunday.",
    { x: M + 0.34, y: 3.42, w: 3.42, h: 1.6, fontFace: HEAD, fontSize: 14.5, italic: true,
      color: WHITE, margin: 0, valign: "top", lineSpacing: 21 }
  );

  const duties = [
    ["FiCheckSquare", "Owns the budget", "Signs off the application's budget and explains the variance when it moves."],
    ["FiBell", "Answers the alerts", "Named as the routing target for anomalies and threshold breaches on their workload."],
    ["FiCalendar", "Reviews monthly", "Attends the monthly review with their own numbers, not a summary of everyone's."],
    ["FiTrash2", "Decommissions", "Retires what is no longer used. Nothing else in the estate does this by itself."],
  ];
  let y = 1.95;
  for (const [ic, label, desc] of duties) {
    await iconRow(s, {
      x: 5.1, y, w: 7.63, h: 0.78, icon: ic, badgeBg: TEAL_SOFT, iconColor: "1F6B5C",
      label, desc, labelColor: INK, descColor: MUTED, d: 0.5, labelSize: 14.5, descSize: 12.5,
    });
    y += 0.85;
  }

  card(s, { x: M, y: 5.52, w: 12.13, h: 1.32, fill: AMBER_SOFT, shadow: false });
  s.addText("Unowned is not unowned", {
    x: M + 0.36, y: 5.68, w: 5, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: "6B4A0E", margin: 0, valign: "middle",
  });
  s.addText(
    "Every resource without an owner already has one — the central budget. Make ownership a " +
    "deployment requirement rather than a reporting field, and give orphaned resources a " +
    "standing rule: no owner, no renewal.",
    { x: M + 0.36, y: 6.0, w: 11.4, h: 0.72, fontFace: BODY, fontSize: 14,
      color: "6B4A0E", margin: 0, valign: "top", lineSpacing: 19 }
  );

  note(s, "app-ownership");
}

async function slideBudgetControls() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Governance 2 — budget controls");
  title(s, "Thresholds that fire before month-end");
  sub(s, "A budget nobody is warned about is a number in a spreadsheet, not a control.");

  const steps = [
    ["FiEye", "Notify", "Burn ahead of plan",
      "Proportional to the month elapsed. Goes to the team channel.", TEAL_SOFT, "1F6B5C"],
    ["FiAlertTriangle", "Review", "Forecast exceeds budget",
      "Projected month-end overrun. Owner and finance review within days.", AMBER_SOFT, "B87B18"],
    ["FiLock", "Gate", "Hard ceiling reached",
      "New spend needs explicit approval, or the quota is capped.", "F6E0DC", "A6432F"],
  ];
  const xs = [0.6, 4.74, 8.88];
  for (let i = 0; i < steps.length; i++) {
    const [ic, name, trigger, desc, fill, iconColor] = steps[i];
    card(s, { x: xs[i], y: 2.3, w: 3.84, h: 2.35, fill, shadow: false });
    await iconBadge(s, { x: xs[i] + 0.32, y: 2.58, d: 0.6, bg: WHITE, icon: ic, color: iconColor });
    s.addText(name, {
      x: xs[i] + 1.04, y: 2.58, w: 2.5, h: 0.6, fontFace: HEAD, fontSize: 20, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(trigger, {
      x: xs[i] + 0.32, y: 3.32, w: 3.2, h: 0.34, fontFace: BODY, fontSize: 12.5, bold: true,
      color: iconColor, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: xs[i] + 0.32, y: 3.7, w: 3.2, h: 0.8, fontFace: BODY, fontSize: 12.5,
      color: MUTED, margin: 0, valign: "top", lineSpacing: 16,
    });
    if (i < steps.length - 1) {
      s.addShape(pres.ShapeType.rightArrow, {
        x: xs[i] + 3.9, y: 3.38, w: 0.22, h: 0.2,
        fill: { color: "C3CBD5" }, line: { type: "none" },
      });
    }
  }

  card(s, { x: M, y: 4.95, w: 12.13, h: 1.95, fill: DARK_CARD });
  s.addText("Make it proportional, not flat", {
    x: M + 0.36, y: 5.12, w: 6, h: 0.34, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText(
    [
      { text: "Day 10 of a 30-day month should be near a third of budget. At 60%, that is the alert. ", options: { color: WHITE } },
      { text: "A flat “80% of budget” threshold fires on day 24 of a healthy month and day 8 of a catastrophic one — with equal urgency, and therefore equal indifference.", options: { color: MUTED_D } },
    ],
    { x: M + 0.36, y: 5.5, w: 11.4, h: 1.2, fontFace: BODY, fontSize: 14, margin: 0,
      valign: "top", lineSpacing: 21 }
  );

  note(s, "budget-controls");
}

async function slideRateLimits() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Governance 3 — rate limits & quotas");
  title(s, "The only control fast enough to stop spend");

  card(s, { x: M, y: 1.9, w: 5.55, h: 2.62, fill: TINT, shadow: false });
  s.addText("How fast each signal moves", {
    x: M + 0.34, y: 2.06, w: 4.8, h: 0.34, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: MUTED, margin: 0, valign: "middle",
  });
  const signals = [
    ["Billing data", "24–48h behind", 2.9, "C3CBD5"],
    ["Utilization metrics", "~5 minutes", 0.82, AMBER],
    ["Application telemetry", "seconds", 0.3, TEAL],
  ];
  let sy = 2.52;
  for (const [name, latency, barW, color] of signals) {
    s.addText(name, {
      x: M + 0.34, y: sy, w: 2.0, h: 0.34, fontFace: BODY, fontSize: 12.5,
      color: INK, margin: 0, valign: "middle",
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: M + 2.42, y: sy + 0.1, w: barW, h: 0.16, rectRadius: 0.08,
      fill: { color }, line: { type: "none" },
    });
    s.addText(latency, {
      x: M + 0.34, y: sy + 0.3, w: 4.8, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
      color: MUTED, margin: 0, valign: "middle",
    });
    sy += 0.66;
  }

  quoteBlock(s, {
    x: 6.53, y: 1.9, w: 6.2, h: 2.62, fill: DARK_CARD, color: WHITE, size: 15,
    text: "“A cost alert cannot save you from a runaway job. By the time actual cost moves, " +
      "you have already spent the money.”",
  });

  const controls = [
    ["FiSliders", "Per-deployment quotas", "Cap tokens or requests per minute on each deployment."],
    ["FiFilter", "Gateway throttling", "Rate-limit per consumer key, so one client cannot drain the shared pool."],
    ["FiMaximize2", "Autoscale ceilings", "A maximum instance count on every scale set. Scaling is not a budget."],
    ["FiPower", "Non-prod shutdown", "Scheduled stop outside working hours — the cheapest saving available."],
  ];
  const cxs = [0.6, 6.83];
  const cys = [4.8, 6.0];
  for (let i = 0; i < controls.length; i++) {
    const [ic, label, desc] = controls[i];
    await iconRow(s, {
      x: cxs[i % 2], y: cys[Math.floor(i / 2)], w: 5.9, h: 1.0, icon: ic,
      badgeBg: AMBER_SOFT, iconColor: "B87B18",
      label, desc, labelColor: INK, descColor: MUTED, d: 0.5, labelSize: 14, descSize: 12,
    });
  }

  note(s, "rate-limits");
}

async function slideAutomatedAlerts() {
  const s = pres.addSlide();
  bg(s, DARK);
  kicker(s, "Governance 4 — automated alerts");
  title(s, "Three tiers, three destinations", true);
  sub(s, "Sort alerts by what they can actually prevent — then route them accordingly.", true);

  const head = ["Tier", "Built on", "Latency", "Routes to"];
  const cols = [0.94, 3.5, 6.9, 9.0];
  const widths = [2.4, 3.2, 1.9, 3.3];
  for (let i = 0; i < head.length; i++) {
    s.addText(head[i], {
      x: cols[i], y: 2.3, w: widths[i], h: 0.3, fontFace: BODY, fontSize: 11, bold: true,
      charSpacing: 1.6, color: AMBER, margin: 0, valign: "middle",
    });
  }

  const tiers = [
    ["Protective", "Tokens, utilization, error rates", "minutes", "On-call — page it", AMBER],
    ["Budget", "Billing data", "24–48 hours", "Team channel, weekly digest", TEAL],
    ["Advisory", "Billing plus forecast", "daily", "A ticket. Never a page.", "8C9AAC"],
  ];
  let y = 2.72;
  for (const [name, built, lat, route, color] of tiers) {
    card(s, { x: M, y, w: 12.13, h: 0.92, fill: DARK_CARD, shadow: false });
    s.addText(name, {
      x: cols[0], y, w: widths[0], h: 0.92, fontFace: HEAD, fontSize: 18, bold: true,
      color, margin: 0, valign: "middle",
    });
    s.addText(built, {
      x: cols[1], y, w: widths[1], h: 0.92, fontFace: BODY, fontSize: 13,
      color: WHITE, margin: 0, valign: "middle",
    });
    s.addText(lat, {
      x: cols[2], y, w: widths[2], h: 0.92, fontFace: BODY, fontSize: 13, bold: true,
      color: MUTED_D, margin: 0, valign: "middle",
    });
    s.addText(route, {
      x: cols[3], y, w: widths[3], h: 0.92, fontFace: BODY, fontSize: 13,
      color: MUTED_D, margin: 0, valign: "middle",
    });
    y += 1.02;
  }

  const rules = [
    ["FiSlash", "Never page on a budget threshold", "You are waking someone about a fact they cannot change."],
    ["FiVolume2", "A muted alert is worse than none", "It leaves the false confidence that something is watching."],
    ["FiWifiOff", "Alert on silence too", "A stopped data feed reads exactly like a healthy month."],
  ];
  const rxs = [0.6, 4.74, 8.88];
  for (let i = 0; i < rules.length; i++) {
    const [ic, label, desc] = rules[i];
    card(s, { x: rxs[i], y: 5.9, w: 3.84, h: 1.15, fill: "1A222C", shadow: false });
    await iconBadge(s, { x: rxs[i] + 0.28, y: 6.14, d: 0.46, bg: "2E3A48", icon: ic, color: AMBER });
    s.addText(
      [
        { text: label, options: { bold: true, fontSize: 12.5, color: WHITE, breakLine: true } },
        { text: desc, options: { fontSize: 11, color: MUTED_D } },
      ],
      { x: rxs[i] + 0.86, y: 5.98, w: 2.8, h: 1.0, fontFace: BODY, margin: 0, valign: "middle", lineSpacing: 14 }
    );
  }

  note(s, "automated-alerts");
}

async function slideSharedResponsibility() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Governance 5 — shared responsibility");
  title(s, "Who decides, who builds, who pays");
  sub(s, "FinOps fails when it is one team's job. These are the four parties and what each one owns.");

  const parties = ["Finance", "FinOps / Platform", "Engineering", "Leadership"];
  const rows = [
    ["Budgets & allocation policy", 1, 0, 0, 2],
    ["Tagging & ownership standard", 2, 1, 0, 0],
    ["Guardrails, quotas & alerts", 0, 1, 2, 0],
    ["Responding to an alert", 0, 2, 1, 0],
    ["Commitment & tooling spend", 2, 2, 0, 1],
  ];

  const labelW = 4.0;
  const colW = 1.95;
  const colX = (i) => M + labelW + 0.15 + i * (colW + 0.13);

  for (let i = 0; i < parties.length; i++) {
    s.addText(parties[i], {
      x: colX(i), y: 2.32, w: colW, h: 0.36, fontFace: BODY, fontSize: 12, bold: true,
      charSpacing: 0.8, color: MUTED, margin: 0, align: "center", valign: "middle",
    });
  }

  let y = 2.78;
  for (const row of rows) {
    const [label, ...marks] = row;
    card(s, { x: M, y, w: 12.13, h: 0.72, fill: TINT, shadow: false });
    s.addText(label, {
      x: M + 0.34, y, w: labelW - 0.2, h: 0.72, fontFace: BODY, fontSize: 14, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    for (let i = 0; i < marks.length; i++) {
      if (marks[i] === 0) continue;
      const owns = marks[i] === 1;
      const d = owns ? 0.34 : 0.22;
      s.addShape(pres.ShapeType.ellipse, {
        x: colX(i) + (colW - d) / 2, y: y + (0.72 - d) / 2, w: d, h: d,
        fill: { color: owns ? AMBER : "C3CBD5" }, line: { type: "none" },
      });
    }
    y += 0.8;
  }

  s.addShape(pres.ShapeType.ellipse, {
    x: M, y: 6.86, w: 0.2, h: 0.2, fill: { color: AMBER }, line: { type: "none" },
  });
  s.addText("Accountable — the decision stops here", {
    x: M + 0.3, y: 6.78, w: 4.2, h: 0.36, fontFace: BODY, fontSize: 12,
    color: MUTED, margin: 0, valign: "middle",
  });
  s.addShape(pres.ShapeType.ellipse, {
    x: 5.2, y: 6.9, w: 0.14, h: 0.14, fill: { color: "C3CBD5" }, line: { type: "none" },
  });
  s.addText("Contributes — does the work, does not decide", {
    x: 5.46, y: 6.78, w: 5.0, h: 0.36, fontFace: BODY, fontSize: 12,
    color: MUTED, margin: 0, valign: "middle",
  });

  note(s, "shared-responsibility");
}

async function slideShiftLeft() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Governance — shift left");
  title(s, "Shift left is a seat at the design table");
  sub(s, "Not a tool. A change in when FinOps shows up — and the earlier it is, the less of the bill is already decided.");

  /* where FinOps enters the lifecycle */
  const stages = ["Requirements", "Design", "Build", "Deploy", "Run", "Invoice"];
  const bandY = 2.9;
  const stageW = 1.94;
  const gap = 0.11;
  const startX = M;
  for (let i = 0; i < stages.length; i++) {
    const x = startX + i * (stageW + gap);
    const early = i < 2;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: bandY, w: stageW, h: 0.62, rectRadius: 0.08,
      fill: { color: early ? AMBER_SOFT : TINT }, line: { type: "none" },
    });
    s.addText(stages[i], {
      x, y: bandY, w: stageW, h: 0.62, fontFace: BODY, fontSize: 13,
      bold: early, color: early ? "6B4A0E" : MUTED, margin: 0,
      align: "center", valign: "middle",
    });
  }

  s.addText("Where FinOps belongs", {
    x: startX, y: bandY - 0.42, w: 4.1, h: 0.34, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.4, color: "B87B18", margin: 0, valign: "middle",
  });
  s.addText("Where FinOps usually arrives", {
    x: startX + 4 * (stageW + gap), y: bandY + 0.72, w: 3.93, h: 0.34,
    fontFace: BODY, fontSize: 12, bold: true, charSpacing: 1.4,
    color: MUTED, margin: 0, align: "right", valign: "middle",
  });
  s.addText("Most of the lifetime cost is committed here.", {
    x: startX, y: bandY + 0.72, w: 6.0, h: 0.34, fontFace: BODY, fontSize: 12.5,
    color: INK, margin: 0, valign: "middle",
  });

  /* the two-way exchange */
  const columns = [
    {
      x: M, fill: DARK_CARD, tag: "What FinOps brings to the room", tagColor: AMBER,
      textColor: WHITE, descColor: MUTED_D,
      items: [
        ["Two or three options, priced", "The choice gets made with the number visible."],
        ["A cost target for the workload", "Recorded beside latency and availability."],
        ["The allocation plan", "Which tags, which cost centre, which unit."],
      ],
    },
    {
      x: 6.83, fill: TINT, tag: "What FinOps needs to learn from the team", tagColor: "1F6B5C",
      textColor: INK, descColor: MUTED,
      items: [
        ["What the project actually needs", "Scale, growth, retention, and the real SLO."],
        ["What is temporary", "An end date set now costs nothing to honour later."],
        ["Where the business value sits", "Per customer, per order, per model call."],
      ],
    },
  ];
  for (const col of columns) {
    card(s, { x: col.x, y: 4.28, w: 5.9, h: 2.32, fill: col.fill, shadow: false });
    s.addText(col.tag.toUpperCase(), {
      x: col.x + 0.34, y: 4.46, w: 5.2, h: 0.3, fontFace: BODY, fontSize: 11, bold: true,
      charSpacing: 1.4, color: col.tagColor, margin: 0, valign: "middle",
    });
    let y = 4.86;
    for (const [label, desc] of col.items) {
      s.addShape(pres.ShapeType.ellipse, {
        x: col.x + 0.36, y: y + 0.16, w: 0.11, h: 0.11,
        fill: { color: col.tagColor }, line: { type: "none" },
      });
      s.addText(
        [
          { text: label + "  ", options: { bold: true, color: col.textColor } },
          { text: desc, options: { color: col.descColor } },
        ],
        { x: col.x + 0.62, y, w: 4.94, h: 0.56, fontFace: BODY, fontSize: 12.5,
          margin: 0, valign: "top", lineSpacing: 16 }
      );
      y += 0.58;
    }
  }

  s.addText(
    "The FinOps Framework names this: Architecting & Workload Placement, and Onboarding Workloads — " +
    "cost, usage and impact decision support during design and intake.",
    { x: M, y: 6.72, w: 12.13, h: 0.5, fontFace: BODY, fontSize: 12.5,
      color: MUTED, margin: 0, valign: "middle" }
  );

  note(s, "shift-left");
}

async function slideDesignQuestions() {
  const s = pres.addSlide();
  bg(s, DARK);
  kicker(s, "Governance — shift left in practice");
  title(s, "Six questions, asked before the build starts", true);
  sub(s, "None of them is a finance question. All of them decide the bill.", true);

  const questions = [
    ["FiActivity", "Shape of the load", "Peak versus average, and how spiky? Sizing for a peak that lasts an hour a week is the most common overspend."],
    ["FiDatabase", "Data volume and retention", "How much is stored, for how long, and how much leaves the region? Egress and retention rarely appear in the estimate."],
    ["FiShield", "What the SLO actually requires", "Multi-region and multi-AZ are priced choices. Ask which one the business will genuinely pay for."],
    ["FiClock", "What is temporary", "Non-production with no end date becomes permanent. An expiry set on day one is free; removing it later is a project."],
    ["FiCpu", "For AI workloads", "Tokens per request, cache hit rate, model tier, and whether provisioned throughput is justified by the traffic."],
    ["FiTag", "Owner and unit", "Which cost centre carries it, and what unit we will divide the cost by once it is live."],
  ];
  const xs = [0.6, 4.74, 8.88];
  const ys = [2.32, 4.52];
  for (let i = 0; i < questions.length; i++) {
    const [ic, label, desc] = questions[i];
    const x = xs[i % 3], y = ys[Math.floor(i / 3)];
    card(s, { x, y, w: 3.84, h: 2.05, fill: DARK_CARD, shadow: false });
    await iconBadge(s, { x: x + 0.32, y: y + 0.28, d: 0.5, bg: "2E3A48", icon: ic, color: AMBER });
    s.addText(label, {
      x: x + 0.96, y: y + 0.26, w: 2.7, h: 0.54, fontFace: HEAD, fontSize: 15, bold: true,
      color: WHITE, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: x + 0.32, y: y + 0.92, w: 3.2, h: 1.05, fontFace: BODY, fontSize: 12,
      color: MUTED_D, margin: 0, valign: "top", lineSpacing: 16,
    });
  }

  s.addText(
    [
      { text: "The output is a number attached to the design: ", options: { color: AMBER, bold: true } },
      { text: "an estimate, and a cost target recorded beside the latency and availability targets. A cost diff on the pull request and policy as code keep it honest afterwards.", options: { color: MUTED_D } },
    ],
    { x: M, y: 6.74, w: 12.13, h: 0.6, fontFace: BODY, fontSize: 12.5, margin: 0,
      valign: "top", lineSpacing: 18 }
  );

  note(s, "design-questions");
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

async function slideShipIt() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Operate — running the practice");
  title(s, "Ship the insight, don't just publish it");
  sub(s, "A report tells someone a number. Only a change in what they do next reaches the bill.");

  /* finding to realized saving */
  const steps = [
    ["Finding", "the dashboard flags it"],
    ["Named owner", "one person, not a team"],
    ["Sized", "what it is worth"],
    ["Target date", "when, not someday"],
    ["Reviewed", "did it happen"],
    ["Realized", "measured on the bill"],
  ];
  const chipW = 1.86, chipGap = 0.19;
  for (let i = 0; i < steps.length; i++) {
    const [name, desc] = steps[i];
    const x = M + i * (chipW + chipGap);
    const last = i === steps.length - 1;
    card(s, {
      x, y: 2.5, w: chipW, h: 1.05,
      fill: last ? DARK_CARD : TINT, shadow: false,
    });
    s.addText(name, {
      x, y: 2.62, w: chipW, h: 0.36, fontFace: BODY, fontSize: 13.5, bold: true,
      color: last ? AMBER : INK, margin: 0, align: "center", valign: "middle",
    });
    s.addText(desc, {
      x: x + 0.1, y: 2.98, w: chipW - 0.2, h: 0.44, fontFace: BODY, fontSize: 11,
      color: last ? MUTED_D : MUTED, margin: 0, align: "center", valign: "top", lineSpacing: 14,
    });
    if (!last) {
      s.addShape(pres.ShapeType.rightArrow, {
        x: x + chipW + 0.02, y: 2.94, w: 0.15, h: 0.16,
        fill: { color: "C3CBD5" }, line: { type: "none" },
      });
    }
  }
  s.addText("A recommendation without an owner and a date is an opinion.", {
    x: M, y: 3.68, w: 12.13, h: 0.34, fontFace: BODY, fontSize: 12.5,
    color: MUTED, margin: 0, valign: "middle",
  });

  /* report vs product */
  card(s, { x: M, y: 4.28, w: 5.9, h: 2.45, fill: TINT, shadow: false });
  s.addText("The difference that matters", {
    x: M + 0.34, y: 4.46, w: 5, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: MUTED, margin: 0, valign: "middle",
  });
  const contrast = [
    ["A report", "is finished when the number is right.", MUTED],
    ["A product", "is finished when someone behaves differently.", INK],
  ];
  let cy = 4.84;
  for (const [label, desc, color] of contrast) {
    s.addText(
      [
        { text: label + "  ", options: { bold: true, color: color === INK ? INK : MUTED } },
        { text: desc, options: { color: MUTED } },
      ],
      { x: M + 0.34, y: cy, w: 5.22, h: 0.58, fontFace: BODY, fontSize: 14, margin: 0,
        valign: "top", lineSpacing: 19 }
    );
    cy += 0.6;
  }
  s.addText(
    "Build for the engineer who wants the three things worth fixing this sprint — the finance " +
    "report improves as a by-product.",
    { x: M + 0.34, y: 6.04, w: 5.22, h: 0.5, fontFace: BODY, fontSize: 12.5,
      color: INK, margin: 0, valign: "top", lineSpacing: 16 }
  );

  /* the measures */
  card(s, { x: 6.83, y: 4.28, w: 5.9, h: 2.45, fill: DARK_CARD });
  s.addText("Measure adoption, not accuracy", {
    x: 7.17, y: 4.46, w: 5, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: AMBER, margin: 0, valign: "middle",
  });
  const measures = [
    ["Findings with an owner and a date", "The share that became work."],
    ["Realized against identified saving", "Only the first reaches an invoice."],
    ["Time from finding to owner", "Days, not weeks — and trending down."],
  ];
  let my = 4.86;
  for (const [label, desc] of measures) {
    s.addShape(pres.ShapeType.ellipse, {
      x: 7.19, y: my + 0.16, w: 0.11, h: 0.11,
      fill: { color: AMBER }, line: { type: "none" },
    });
    s.addText(
      [
        { text: label, options: { bold: true, color: WHITE, breakLine: true } },
        { text: desc, options: { color: MUTED_D } },
      ],
      { x: 7.45, y: my, w: 4.98, h: 0.5, fontFace: BODY, fontSize: 12.5, margin: 0,
        valign: "top", lineSpacing: 16 }
    );
    my += 0.56;
  }

  s.addText(
    "The goal is a better decision, not a lower bill — the lower bill is what a better decision looks like a quarter later.",
    { x: M, y: 6.86, w: 12.13, h: 0.44, fontFace: HEAD, fontSize: 14, italic: true,
      color: MUTED, margin: 0, valign: "middle" }
  );

  note(s, "ship-it");
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

async function slidePathForward() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "The path forward");
  title(s, "Where to start");

  const steps = [
    ["01", "Set the tagging standard", "Agree a consistent taxonomy before investing in dashboards."],
    ["02", "Start with the biggest spend", "Attack the largest categories first. Don't chase perfect granularity everywhere."],
    ["03", "Get finance and engineering talking", "Bring both into the conversation early, not as an afterthought."],
    ["04", "Set guardrails early", "Owners, budget thresholds and quotas cost little to add — and stop the expensive surprises."],
  ];
  const xs = [0.6, 3.70, 6.80, 9.90];
  for (let i = 0; i < steps.length; i++) {
    const [num, name, desc] = steps[i];
    card(s, { x: xs[i], y: 1.95, w: 2.83, h: 2.65, fill: i === 0 ? DARK_CARD : TINT, shadow: false });
    s.addText(num, {
      x: xs[i] + 0.28, y: 2.15, w: 1.2, h: 0.55, fontFace: HEAD, fontSize: 28, bold: true,
      color: i === 0 ? AMBER : "B9C2CD", margin: 0, valign: "middle",
    });
    s.addText(name, {
      x: xs[i] + 0.26, y: 2.76, w: 2.34, h: 0.86, fontFace: HEAD, fontSize: 15, bold: true,
      color: i === 0 ? WHITE : INK, margin: 0, valign: "top", lineSpacing: 20,
    });
    s.addText(desc, {
      x: xs[i] + 0.26, y: 3.66, w: 2.34, h: 0.82, fontFace: BODY, fontSize: 12,
      color: i === 0 ? MUTED_D : MUTED, margin: 0, valign: "top", lineSpacing: 15,
    });
  }

  card(s, { x: M, y: 4.85, w: 12.13, h: 2.05, fill: TINT, shadow: false });
  s.addText("Tooling — match the footprint, not the ambition", {
    x: M + 0.36, y: 5.0, w: 6.6, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: MUTED, margin: 0, valign: "middle",
  });
  const tools = [
    ["Native", "AWS Cost Explorer  ·  Azure Cost Management  ·  GCP Billing", TEAL],
    ["Third-party", "CloudHealth  ·  Apptio  ·  Vantage  ·  nOps  ·  Finout  ·  CoreStack", "B87B18"],
    ["Standard", "FOCUS-compliant platforms for multi-cloud reporting", INK],
  ];
  let ty = 5.4;
  for (const [label, list, color] of tools) {
    s.addText(label, {
      x: M + 0.36, y: ty, w: 1.9, h: 0.42, fontFace: BODY, fontSize: 13.5, bold: true,
      color, margin: 0, valign: "middle",
    });
    s.addText(list, {
      x: M + 2.3, y: ty, w: 9.4, h: 0.42, fontFace: BODY, fontSize: 13.5,
      color: MUTED, margin: 0, valign: "middle",
    });
    ty += 0.45;
  }

  note(s, "path-forward");
}

async function slideTakeaways() {
  const s = pres.addSlide();
  bg(s, DARK);
  kicker(s, "Key takeaways");
  title(s, "Visibility is the foundation, not the goal", true);

  const chain = [
    ["Visibility", "enables accountability", "Teams can only own what they can see."],
    ["Accountability", "drives behaviour", "Engineers make cost-conscious calls when they see the impact."],
    ["Behaviour", "creates culture", "Cost awareness becomes part of how we build, not a separate exercise."],
    ["Culture", "sustains savings", "Optimization becomes continuous rather than a one-time project."],
  ];
  const xs = [0.6, 3.70, 6.80, 9.90];
  for (let i = 0; i < chain.length; i++) {
    const [head, verb, desc] = chain[i];
    card(s, { x: xs[i], y: 2.15, w: 2.83, h: 2.5, fill: DARK_CARD, shadow: false });
    s.addText(head, {
      x: xs[i] + 0.26, y: 2.4, w: 2.32, h: 0.42, fontFace: HEAD, fontSize: 18, bold: true,
      color: AMBER, margin: 0, valign: "middle",
    });
    s.addText(verb, {
      x: xs[i] + 0.26, y: 2.86, w: 2.32, h: 0.5, fontFace: BODY, fontSize: 13, bold: true,
      color: WHITE, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: xs[i] + 0.26, y: 3.45, w: 2.32, h: 1.1, fontFace: BODY, fontSize: 12.5,
      color: MUTED_D, margin: 0, valign: "top", lineSpacing: 16,
    });
    if (i < chain.length - 1) {
      s.addShape(pres.ShapeType.rightArrow, {
        x: xs[i] + 2.88, y: 3.28, w: 0.21, h: 0.2,
        fill: { color: "3D4B5B" }, line: { type: "none" },
      });
    }
  }

  quoteBlock(s, {
    x: M, y: 4.95, w: 12.13, h: 1.3, fill: DARK_CARD, color: WHITE, size: 16, shadow: false,
    text: "“Organizations that invest in visibility first achieve more durable and targeted cost improvements " +
      "than those that jump straight to cuts.”",
  });

  note(s, "takeaways");
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
  await slideWhatIsFinops();
  await slideWhyVisibility();
  await slideFramework();
  await slideBlockers();
  await slideTagging();
  await slideSharedResources();
  await slideCommitments();
  await slideMultiCloud();
  await slideShowbackChargeback();
  await slideBestPractices();

  await slideGovernanceIntro();
  await slideAppOwnership();
  await slideBudgetControls();
  await slideRateLimits();
  await slideAutomatedAlerts();
  await slideSharedResponsibility();
  await slideShiftLeft();
  await slideDesignQuestions();
  await slideBillingShock();
  await slideAiCost();
  await slideShipIt();
  await slideTooling();

  await slidePathForward();
  await slideTakeaways();
  await slideClosing();

  await pres.writeFile({ fileName: OUT });
  console.log("wrote " + OUT + "  (notes: " + AUDIENCE + ")");
})();
