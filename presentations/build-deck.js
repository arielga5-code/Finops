/*
 * FinOps: Gaining Visibility — management presentation generator.
 */
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const Fi = require("react-icons/fi");
const sharp = require("sharp");

const OUT = process.argv[2] || path.join(__dirname, "finops-gaining-visibility.pptx");

/* ---------- palette ---------- */
const DARK = "141A22";
const DARK_CARD = "1F2936";
const WHITE = "FFFFFF";
const TINT = "F1F3F6";
const INK = "1B2430";
const MUTED = "5C6675";
const MUTED_D = "9EABBA";
const AMBER = "E39B2C";
const AMBER_SOFT = "FBEFD8";
const TEAL = "2E8B7A";
const TEAL_SOFT = "DDEDE9";

const HEAD = "Cambria";
const BODY = "Calibri";

const W = 13.33, H = 7.5, M = 0.6;

/* ---------- icons ---------- */
const iconCache = {};
async function icon(name, hex) {
  const key = name + hex;
  if (iconCache[key]) return iconCache[key];
  const Comp = Fi[name];
  if (!Comp) throw new Error("unknown icon " + name);
  let svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Comp, { size: 256, strokeWidth: 2 })
  );
  svg = svg.replace(/currentColor/g, "#" + hex);
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  const data = "image/png;base64," + buf.toString("base64");
  iconCache[key] = data;
  return data;
}

const softShadow = () => ({
  type: "outer", color: "8C99A8", blur: 10, offset: 2, angle: 90, opacity: 0.16,
});

let pres;

/* ---------- primitives ---------- */
function bg(slide, color) {
  slide.background = { color };
}

function card(slide, o) {
  slide.addShape(pres.ShapeType.roundRect, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: { color: o.fill },
    rectRadius: o.radius === undefined ? 0.09 : o.radius,
    line: o.line ? { color: o.line, width: 1 } : { type: "none" },
    shadow: o.shadow === false ? undefined : softShadow(),
  });
}

async function iconBadge(slide, o) {
  const d = o.d || 0.62;
  slide.addShape(pres.ShapeType.ellipse, {
    x: o.x, y: o.y, w: d, h: d,
    fill: { color: o.bg },
    line: { type: "none" },
  });
  const s = d * 0.5;
  slide.addImage({
    data: await icon(o.icon, o.color),
    x: o.x + (d - s) / 2, y: o.y + (d - s) / 2, w: s, h: s,
  });
}

function kicker(slide, text, dark) {
  slide.addText(text.toUpperCase(), {
    x: M, y: 0.52, w: 8, h: 0.28,
    fontFace: BODY, fontSize: 11, bold: true, charSpacing: 2.2,
    color: AMBER, margin: 0, valign: "middle",
  });
}

function title(slide, text, dark, opts = {}) {
  slide.addText(text, {
    x: M, y: opts.y || 0.85, w: opts.w || 11.9, h: opts.h || 0.85,
    fontFace: HEAD, fontSize: opts.size || 34, bold: true,
    color: dark ? WHITE : INK, margin: 0, valign: "middle",
  });
}

function sub(slide, text, dark, o = {}) {
  slide.addText(text, {
    x: M, y: o.y || 1.68, w: o.w || 11.6, h: o.h || 0.4,
    fontFace: BODY, fontSize: o.size || 15,
    color: dark ? MUTED_D : MUTED, margin: 0, valign: "middle",
    italic: !!o.italic,
  });
}

function quoteBlock(slide, o) {
  card(slide, { x: o.x, y: o.y, w: o.w, h: o.h, fill: o.fill, shadow: o.shadow });
  slide.addText(o.text, {
    x: o.x + 0.32, y: o.y + 0.12, w: o.w - 0.64, h: o.h - 0.24,
    fontFace: HEAD, fontSize: o.size || 14, italic: true,
    color: o.color, margin: 0, valign: "middle", lineSpacing: o.lineSpacing || 20,
  });
}

/* icon + label + description row */
async function iconRow(slide, o) {
  const d = o.d || 0.56;
  await iconBadge(slide, {
    x: o.x, y: o.y + (o.h - d) / 2, d,
    bg: o.badgeBg, icon: o.icon, color: o.iconColor,
  });
  const tx = o.x + d + 0.28;
  slide.addText(
    [
      { text: o.label, options: { bold: true, fontSize: o.labelSize || 15, color: o.labelColor, breakLine: true } },
      { text: o.desc, options: { fontSize: o.descSize || 12.5, color: o.descColor } },
    ],
    {
      x: tx, y: o.y, w: o.w - (d + 0.28), h: o.h,
      fontFace: BODY, margin: 0, valign: "middle", lineSpacing: o.lineSpacing || 16,
    }
  );
}

function dotGrid(slide, o) {
  const { x, y, cols, rows, gap, d } = o;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = o.lit(c, r);
      slide.addShape(pres.ShapeType.ellipse, {
        x: x + c * gap, y: y + r * gap, w: d, h: d,
        fill: { color: lit ? AMBER : o.dim },
        line: { type: "none" },
      });
    }
  }
}

/* ================= slides ================= */

async function slide1() {
  const s = pres.addSlide();
  bg(s, DARK);
  s.addText("MANAGEMENT BRIEFING", {
    x: M, y: 1.5, w: 7, h: 0.3, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 2.6, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText("FinOps:\nGaining Visibility", {
    x: M, y: 1.95, w: 7.6, h: 1.9, fontFace: HEAD, fontSize: 46, bold: true,
    color: WHITE, margin: 0, valign: "top", lineSpacing: 52,
  });
  s.addText("The foundation of cloud financial management", {
    x: M, y: 3.95, w: 7.4, h: 0.4, fontFace: BODY, fontSize: 19,
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

  s.addNotes(
    "Framing: this briefing is about the Inform phase of FinOps — visibility. " +
    "It is deliberately not an optimization pitch. The argument is that visibility is the " +
    "prerequisite that makes every later saving durable rather than one-off."
  );
  return s;
}

async function slide2() {
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

  s.addNotes(
    "Open with the lived experience rather than theory: the month-end surprise. " +
    "If you have one, use a real example of a bill that moved and could not be explained within 24 hours. " +
    "The point of the quote is that a dashboard is not the same thing as visibility — " +
    "visibility means an owner and a cause can be named."
  );
}

async function slide3() {
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

  s.addNotes(
    "Stress the 'Finance + DevOps' compound: this is an operating model that puts two functions in the " +
    "same conversation, not a tool purchase. Inform is highlighted because it is where this organization is, " +
    "and because the cycle repeats — each optimization round needs fresh visibility to target the next one."
  );
}

async function slide4() {
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

  s.addNotes(
    "These four questions are the acceptance test for the visibility programme. " +
    "Invite the room to answer them for our own estate right now — the gaps in the answers are the business case. " +
    "The bottom line matters most to a cost-conscious executive: without allocation, the only lever left is " +
    "an across-the-board cut, which lands hardest on whoever is least able to argue back rather than on actual waste."
  );
}

async function slide5() {
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

  s.addNotes(
    "Four capabilities, in dependency order: allocation makes reporting meaningful, reporting makes unit " +
    "economics computable, and freshness determines whether any of it is actionable. " +
    "Unit economics is the one that changes the conversation with the board — it separates 'spend is up' " +
    "from 'spend per customer is down', which are opposite stories told by the same invoice."
  );
}

async function slide6() {
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

  s.addNotes(
    "This is the honest slide: it says the goal is hard and names why. " +
    "The next four slides map one-to-one onto the first four blockers. " +
    "SaaS and marketplace spend has no dedicated solution slide because the fix is procurement discipline " +
    "rather than tooling — flag it as an action for finance, not engineering."
  );
}

async function slide7() {
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

  s.addNotes(
    "The one slide to take away if only one lands. Two decisions are needed from this room: " +
    "who owns the tag taxonomy, and whether we are willing to enforce it with policy that blocks " +
    "untagged resource creation. Enforcement at creation is nearly free; retrofitting a live estate is not. " +
    "The five minimum tags are a starting point — resist the urge to design thirty."
  );
}

async function slide8() {
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

  s.addNotes(
    "Worth naming our own shared platforms out loud here. " +
    "The caveat to flag: a shared platform carries one set of tags, so resource tags alone cannot split it — " +
    "per-team attribution needs either gateway-level keys or application-level instrumentation. " +
    "Decide which before promising anyone chargeback on a shared service."
  );
}

async function slide9() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Solution 3 — commitments & discounts");
  title(s, "Making Reserved Instances and Savings Plans visible");
  sub(s, "Discounts obscure true attribution: the price shown on a resource is not the price the business paid.");

  card(s, { x: M, y: 2.3, w: 3.85, h: 2.98, fill: DARK_CARD });
  s.addText("60–80%", {
    x: M + 0.3, y: 2.9, w: 3.25, h: 1.05, fontFace: HEAD, fontSize: 56, bold: true,
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

  s.addNotes(
    "Two failure modes to describe: under-coverage, where we pay on-demand rates for workloads that never " +
    "turn off; and over-commitment, where we buy for a peak that never returns. " +
    "The reporting fix is showing both prices — teams that only see the discounted rate cannot tell whether " +
    "the commitment is earning its keep, and teams that only see list price will not believe the savings claim."
  );
}

async function slide10() {
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

  s.addNotes(
    "Calibrate to our own footprint: if we are effectively single-cloud, the native tooling is sufficient and " +
    "a platform purchase is premature. The FOCUS point still matters even then — asking vendors for " +
    "FOCUS-compliant exports keeps the option open and makes any future migration cheap."
  );
}

async function slide11() {
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
      x: m.x + 1.12, y: 2.22, w: 2.0, h: 0.64, fontFace: HEAD, fontSize: 24, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(m.tag, {
      x: m.x + 3.2, y: 2.22, w: 2.36, h: 0.64, fontFace: BODY, fontSize: 11.5, bold: true,
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

  s.addNotes(
    "The sequencing is the message. Showback is a runway, not a lesser version of chargeback: it is where " +
    "allocation disputes get found and settled while the stakes are still low. " +
    "A chargeback launched on 60% tagging coverage produces an argument about the numbers instead of a " +
    "conversation about the spend, and that argument is expensive to unwind."
  );
}

async function slide12() {
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

  s.addNotes(
    "Use this as a maturity self-assessment rather than a wish list: mark each of the six as in place, " +
    "partial, or absent for our estate. Note that four of the six are visibility practices — " +
    "high performers are not distinguished by how aggressively they cut, but by how early and how precisely they see."
  );
}

async function slide13() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "The path forward");
  title(s, "Where to start");

  const steps = [
    ["01", "Set the tagging standard", "Agree a consistent taxonomy before investing in dashboards."],
    ["02", "Start with the biggest spend", "Attack the largest categories first. Don't chase perfect granularity everywhere."],
    ["03", "Get finance and engineering talking", "Bring both into the same conversation early, not as an afterthought."],
    ["04", "Choose tools that fit the footprint", "Native tooling for single-cloud; specialized platforms only for genuine multi-cloud."],
  ];
  const xs = [0.6, 3.70, 6.80, 9.90];
  for (let i = 0; i < steps.length; i++) {
    const [num, name, desc] = steps[i];
    card(s, { x: xs[i], y: 1.95, w: 2.83, h: 2.6, fill: i === 0 ? DARK_CARD : TINT, shadow: false });
    s.addText(num, {
      x: xs[i] + 0.28, y: 2.15, w: 1.2, h: 0.55, fontFace: HEAD, fontSize: 28, bold: true,
      color: i === 0 ? AMBER : "B9C2CD", margin: 0, valign: "middle",
    });
    s.addText(name, {
      x: xs[i] + 0.28, y: 2.78, w: 2.3, h: 0.72, fontFace: HEAD, fontSize: 16, bold: true,
      color: i === 0 ? WHITE : INK, margin: 0, valign: "top", lineSpacing: 20,
    });
    s.addText(desc, {
      x: xs[i] + 0.28, y: 3.52, w: 2.3, h: 0.9, fontFace: BODY, fontSize: 12,
      color: i === 0 ? MUTED_D : MUTED, margin: 0, valign: "top", lineSpacing: 15,
    });
  }

  card(s, { x: M, y: 4.85, w: 12.13, h: 2.05, fill: TINT, shadow: false });
  s.addText("Tooling options", {
    x: M + 0.36, y: 5.0, w: 4, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
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

  s.addNotes(
    "This is the ask. Step 1 is highlighted because it is the only one that cannot be parallelized — " +
    "everything downstream degrades if the taxonomy is still in flux. " +
    "Steps 2 and 4 are both arguments against over-engineering: pick the top spend categories and the " +
    "tooling that matches the estate we actually have, not the one we might have in three years."
  );
}

async function slide14() {
  const s = pres.addSlide();
  bg(s, DARK);
  kicker(s, "Key takeaways");
  title(s, "Visibility is not the goal — it is the foundation", true);

  const chain = [
    ["Visibility", "enables accountability", "Teams can only own what they can see."],
    ["Accountability", "drives behaviour", "Engineers make cost-conscious calls when they see the impact."],
    ["Behaviour", "creates culture", "Cost awareness becomes part of how we build, not a separate exercise."],
    ["Culture", "sustains savings", "Optimization becomes continuous rather than a one-time project."],
  ];
  const xs = [0.6, 3.70, 6.80, 9.90];
  for (let i = 0; i < chain.length; i++) {
    const [head, verb, desc] = chain[i];
    card(s, { x: xs[i], y: 2.15, w: 2.83, h: 2.35, fill: DARK_CARD, shadow: false });
    s.addText(head, {
      x: xs[i] + 0.28, y: 2.42, w: 2.3, h: 0.45, fontFace: HEAD, fontSize: 21, bold: true,
      color: AMBER, margin: 0, valign: "middle",
    });
    s.addText(verb, {
      x: xs[i] + 0.28, y: 2.9, w: 2.3, h: 0.4, fontFace: BODY, fontSize: 13.5, bold: true,
      color: WHITE, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: xs[i] + 0.28, y: 3.4, w: 2.3, h: 1.05, fontFace: BODY, fontSize: 12.5,
      color: MUTED_D, margin: 0, valign: "top", lineSpacing: 16,
    });
    if (i < chain.length - 1) {
      s.addShape(pres.ShapeType.rightArrow, {
        x: xs[i] + 2.88, y: 3.22, w: 0.21, h: 0.2,
        fill: { color: "3D4B5B" }, line: { type: "none" },
      });
    }
  }

  quoteBlock(s, {
    x: M, y: 4.95, w: 12.13, h: 1.3, fill: DARK_CARD, color: WHITE, size: 16, shadow: false,
    text: "“Organizations that invest in visibility first achieve more durable and targeted cost improvements " +
      "than those that jump straight to cuts.”",
  });

  s.addNotes(
    "Close on the causal chain rather than a summary of slides. Each link is a separate management " +
    "commitment: allocation data, published ownership, cost surfaced in the engineering workflow, and a " +
    "review cadence that keeps it alive. Ask for the first two today; the rest follow from them."
  );
}

async function slide15() {
  const s = pres.addSlide();
  bg(s, DARK);
  s.addText("Questions & discussion", {
    x: M, y: 1.85, w: 8, h: 0.9, fontFace: HEAD, fontSize: 40, bold: true,
    color: WHITE, margin: 0, valign: "middle",
  });
  s.addText("FinOps: Gaining Visibility — the foundation of cloud financial management", {
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

  s.addNotes(
    "Anticipate three questions. What will this cost — mostly effort, not licences, if we stay on native " +
    "tooling. How long until we see savings — allocation coverage improves in weeks, targeted savings follow " +
    "the first full month of clean data. Who owns it — name the tagging owner and the review cadence before " +
    "leaving the room, or nothing on the previous slides happens."
  );
}

/* ---------- main ---------- */
(async () => {
  pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "FinOps";
  pres.title = "FinOps: Gaining Visibility";
  pres.subject = "Cloud financial management — management briefing";

  await slide1();
  await slide2();
  await slide3();
  await slide4();
  await slide5();
  await slide6();
  await slide7();
  await slide8();
  await slide9();
  await slide10();
  await slide11();
  await slide12();
  await slide13();
  await slide14();
  await slide15();

  await pres.writeFile({ fileName: OUT });
  console.log("wrote " + OUT);
})();
