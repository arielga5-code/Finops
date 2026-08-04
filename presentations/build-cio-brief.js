/*
 * FinOps CIO brief — the five-slide cut.
 *
 * Same visual system as the full deck (see deck-kit.js), a fifth of the length.
 * Written for a single audience with decision authority: what the gap is, why
 * the discipline moved this year, the two things that close it, and what is
 * being asked for.
 *
 * usage: node build-cio-brief.js [outfile.pptx]
 */
const path = require("path");
const pptxgen = require("pptxgenjs");
const kit = require("./deck-kit.js");
const {
  DARK, DARK_CARD, WHITE, TINT, INK, MUTED, MUTED_D,
  AMBER, AMBER_SOFT, TEAL, TEAL_SOFT, HEAD, BODY, M,
  bg, card, iconBadge, kicker, title, sub, dotGrid,
} = kit;

const NOTES = require("./notes-cio.js");
const OUT = process.argv[2] || path.join(__dirname, "finops-cio-brief.pptx");

let pres;

function note(slide, n) {
  if (!NOTES[n]) throw new Error("missing note for slide " + n);
  slide.addNotes(NOTES[n]);
}

/* ---------- 1. the gap ---------- */
async function slideGap() {
  const s = pres.addSlide();
  bg(s, DARK);
  s.addText("FINOPS — EXECUTIVE BRIEF", {
    x: M, y: 0.72, w: 7, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 2.4, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText("We can see the bill.\nWe cannot see the spend.", {
    x: M, y: 1.2, w: 7.9, h: 1.5, fontFace: HEAD, fontSize: 34, bold: true,
    color: WHITE, margin: 0, valign: "top", lineSpacing: 42,
  });
  s.addText(
    "Cloud is the one large line where spending decisions are made daily, by people who " +
    "never see the invoice, with no approval step in between.",
    { x: M, y: 2.82, w: 7.6, h: 0.8, fontFace: BODY, fontSize: 15, color: MUTED_D,
      margin: 0, valign: "top", lineSpacing: 21 }
  );

  const gaps = [
    ["FiHelpCircle", "No owner on the change", "When the number moves, naming who caused it takes days — or never happens."],
    ["FiClock", "Data arrives after the fact", "Billing lands 24–48h late, so every cost alert reports rather than prevents."],
    ["FiSlash", "Nothing stops a runaway", "No quota, no ceiling, no gate. The first hard limit is the invoice."],
  ];
  let y = 3.92;
  for (const [ic, label, desc] of gaps) {
    await iconBadge(s, { x: M, y: y + 0.06, d: 0.5, bg: "2E3A48", icon: ic, color: AMBER });
    s.addText(
      [
        { text: label, options: { bold: true, fontSize: 14.5, color: WHITE, breakLine: true } },
        { text: desc, options: { fontSize: 12.5, color: MUTED_D } },
      ],
      { x: M + 0.74, y, w: 7.0, h: 0.78, fontFace: BODY, margin: 0, valign: "middle", lineSpacing: 17 }
    );
    y += 0.92;
  }

  card(s, { x: 8.6, y: 1.2, w: 4.13, h: 5.6, fill: DARK_CARD, shadow: false });
  s.addText("What this brief asks for", {
    x: 8.92, y: 1.46, w: 3.5, h: 0.32, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.8, color: AMBER, margin: 0, valign: "middle",
  });
  const asks = [
    ["01", "A mandatory tagging standard", "Enforced at deployment"],
    ["02", "A named owner per application", "A person, not a mailing list"],
    ["03", "Guardrails on by default", "Quotas and budget thresholds"],
  ];
  let ay = 1.95;
  for (const [num, ask, detail] of asks) {
    s.addText(num, {
      x: 8.92, y: ay, w: 0.7, h: 0.4, fontFace: HEAD, fontSize: 20, bold: true,
      color: AMBER, margin: 0, valign: "middle",
    });
    s.addText(ask, {
      x: 8.92, y: ay + 0.38, w: 3.5, h: 0.62, fontFace: HEAD, fontSize: 15, bold: true,
      color: WHITE, margin: 0, valign: "top", lineSpacing: 20,
    });
    s.addText(detail, {
      x: 8.92, y: ay + 1.02, w: 3.5, h: 0.42, fontFace: BODY, fontSize: 12.5,
      color: MUTED_D, margin: 0, valign: "top", lineSpacing: 16,
    });
    ay += 1.45;
  }

  s.addText("No new headcount or tooling spend.", {
    x: 8.92, y: 6.28, w: 3.5, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    color: TEAL_SOFT, margin: 0, valign: "middle",
  });

  note(s, "gap");
}

/* ---------- 2. why now ---------- */
async function slideWhyNow() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Why now");
  title(s, "The discipline moved this year — toward us");
  sub(s, "FinOps Foundation, State of FinOps 2026 (n ≈ 1,500 practitioners worldwide).");

  const stats = [
    ["78%", "of FinOps practices now report into the CTO/CIO organization", "up 18 points since 2023", AMBER, DARK_CARD, WHITE, MUTED_D],
    ["98%", "of practices now manage AI spend as a core operating cost", "SaaS 90% · licensing 64% · data centre 48%", "1F6B5C", TEAL_SOFT, INK, MUTED],
    ["#3", "governance ranks above optimization in 2026 priorities", "behind only AI cost management and AI-driven efficiency", "B87B18", AMBER_SOFT, INK, MUTED],
  ];
  const xs = [0.6, 4.74, 8.88];
  for (let i = 0; i < stats.length; i++) {
    const [big, line, footnote, bigColor, fill, textColor, footColor] = stats[i];
    card(s, { x: xs[i], y: 2.3, w: 3.84, h: 2.85, fill, shadow: false });
    s.addText(big, {
      x: xs[i] + 0.34, y: 2.55, w: 3.2, h: 0.95, fontFace: HEAD, fontSize: 44, bold: true,
      color: bigColor, margin: 0, valign: "middle",
    });
    s.addText(line, {
      x: xs[i] + 0.34, y: 3.58, w: 3.2, h: 0.95, fontFace: BODY, fontSize: 14,
      color: textColor, margin: 0, valign: "top", lineSpacing: 19,
    });
    s.addText(footnote, {
      x: xs[i] + 0.34, y: 4.55, w: 3.2, h: 0.5, fontFace: BODY, fontSize: 11.5,
      color: footColor, margin: 0, valign: "top", lineSpacing: 15,
    });
  }

  card(s, { x: M, y: 5.45, w: 12.13, h: 1.45, fill: TINT, shadow: false });
  s.addText("What it means for this organization", {
    x: M + 0.36, y: 5.62, w: 6, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: MUTED, margin: 0, valign: "middle",
  });
  s.addText(
    [
      { text: "Cost control has stopped being a finance report and become a technology capability — ", options: { color: INK, bold: true } },
      { text: "which puts it on this desk. The industry's own conclusion is that attacking waste after the fact has hit diminishing returns; the returns now come from governance, forecasting and scope.", options: { color: MUTED } },
    ],
    { x: M + 0.36, y: 5.96, w: 11.4, h: 0.8, fontFace: BODY, fontSize: 14, margin: 0,
      valign: "top", lineSpacing: 20 }
  );

  note(s, "why-now");
}

/* ---------- 3. visibility ---------- */
async function slideVisibility() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Part one — see it");
  title(s, "Allocation is the whole game");
  sub(s, "Every question worth asking about cloud spend reduces to one prerequisite: can this cost be traced to an owner?");

  /* the chain */
  const chain = [
    ["FiTag", "Tag at creation", "Five tags, enforced by policy. Untagged means undeployed."],
    ["FiPieChart", "Allocate the spend", "Target under 5% unallocated, tracked as a standing KPI."],
    ["FiEye", "Show teams their own numbers", "Showback for 4–6 weeks before anything hits a P&L."],
    ["FiTrendingUp", "Measure per unit", "Cost per customer or transaction — the only honest efficiency signal."],
  ];
  const xs = [0.6, 3.7, 6.8, 9.9];
  for (let i = 0; i < chain.length; i++) {
    const [ic, name, desc] = chain[i];
    card(s, { x: xs[i], y: 2.42, w: 2.83, h: 2.5, fill: i === 0 ? DARK_CARD : TINT, shadow: false });
    await iconBadge(s, {
      x: xs[i] + 0.28, y: 2.68, d: 0.58,
      bg: i === 0 ? AMBER : WHITE, icon: ic, color: i === 0 ? "13202B" : "B87B18",
    });
    s.addText(name, {
      x: xs[i] + 0.28, y: 3.38, w: 2.3, h: 0.72, fontFace: HEAD, fontSize: 15, bold: true,
      color: i === 0 ? WHITE : INK, margin: 0, valign: "top", lineSpacing: 20,
    });
    s.addText(desc, {
      x: xs[i] + 0.28, y: 4.06, w: 2.3, h: 0.78, fontFace: BODY, fontSize: 12,
      color: i === 0 ? MUTED_D : MUTED, margin: 0, valign: "top", lineSpacing: 15,
    });
    if (i < chain.length - 1) {
      s.addShape(pres.ShapeType.rightArrow, {
        x: xs[i] + 2.88, y: 3.58, w: 0.21, h: 0.2,
        fill: { color: "C3CBD5" }, line: { type: "none" },
      });
    }
  }

  card(s, { x: M, y: 5.2, w: 5.9, h: 1.7, fill: AMBER_SOFT, shadow: false });
  s.addText("The blocker, every time", {
    x: M + 0.34, y: 5.38, w: 4.5, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: "6B4A0E", margin: 0, valign: "middle",
  });
  s.addText(
    "Tagging is the most foundational habit in the practice and the most frequently skipped. " +
    "As an estate grows, coverage that was once adequate leaves a fifth of spend allocated to nobody.",
    { x: M + 0.34, y: 5.72, w: 5.22, h: 1.0, fontFace: BODY, fontSize: 13,
      color: "6B4A0E", margin: 0, valign: "top", lineSpacing: 17 }
  );

  card(s, { x: 6.83, y: 5.2, w: 5.9, h: 1.7, fill: DARK_CARD });
  s.addText("What changes when it works", {
    x: 7.17, y: 5.38, w: 4.5, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
    charSpacing: 1.8, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText(
    [
      { text: "From “IT is overspending”", options: { color: MUTED_D, italic: true, breakLine: true } },
      { text: "to “Team X used Y, at cost Z, delivering A.”", options: { color: WHITE, bold: true } },
    ],
    { x: 7.17, y: 5.76, w: 5.22, h: 0.95, fontFace: BODY, fontSize: 15, margin: 0,
      valign: "top", lineSpacing: 24 }
  );

  note(s, "visibility");
}

/* ---------- 4. governance ---------- */
async function slideGovernance() {
  const s = pres.addSlide();
  bg(s, DARK);
  kicker(s, "Part two — control it");
  title(s, "Four controls, and only one of them is fast", true);
  sub(s, "A report is not a control. These are, in the order they take effect.", true);

  const controls = [
    ["FiSliders", "Rate limits & quotas", "seconds", "The only control that can stop spend in progress: token and request caps, gateway throttling, autoscale ceilings.", AMBER],
    ["FiBell", "Tiered alerts", "minutes to days", "Usage-plane alerts page someone. Budget alerts go to a channel. Advisory alerts become tickets — never a page.", AMBER],
    ["FiUser", "Named application owners", "always on", "One person per workload who owns the budget, answers the alert and retires what is unused.", TEAL],
    ["FiTrendingDown", "Budget thresholds", "within the month", "Notify, review, gate — measured against elapsed month, so drift shows in week one rather than at close.", TEAL],
  ];
  const xs = [0.6, 6.83];
  const ys = [2.32, 4.42];
  for (let i = 0; i < controls.length; i++) {
    const [ic, name, speed, desc, color] = controls[i];
    const x = xs[i % 2], y = ys[Math.floor(i / 2)];
    card(s, { x, y, w: 5.9, h: 1.9, fill: DARK_CARD, shadow: false });
    await iconBadge(s, { x: x + 0.32, y: y + 0.3, d: 0.56, bg: "2E3A48", icon: ic, color });
    s.addText(name, {
      x: x + 1.04, y: y + 0.28, w: 3.1, h: 0.6, fontFace: HEAD, fontSize: 17, bold: true,
      color: WHITE, margin: 0, valign: "middle",
    });
    s.addText(speed, {
      x: x + 4.0, y: y + 0.28, w: 1.56, h: 0.6, fontFace: BODY, fontSize: 12, bold: true,
      color, margin: 0, align: "right", valign: "middle",
    });
    s.addText(desc, {
      x: x + 0.34, y: y + 0.96, w: 5.22, h: 0.82, fontFace: BODY, fontSize: 12.5,
      color: MUTED_D, margin: 0, valign: "top", lineSpacing: 16,
    });
  }

  s.addText(
    "“A cost alert cannot save you from a runaway job — by the time the billing data moves, " +
    "the money is spent. Only the usage plane is fast enough.”",
    { x: M, y: 6.5, w: 12.13, h: 0.62, fontFace: HEAD, fontSize: 14.5, italic: true,
      color: AMBER, margin: 0, valign: "middle" }
  );

  note(s, "governance");
}

/* ---------- 5. the ask ---------- */
async function slideAsk() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "The ask");
  title(s, "Ninety days, three decisions");

  const phases = [
    ["Weeks 1–4", "Standard and baseline", [
      "Publish the tag taxonomy and enforce it on new resources",
      "Name an owner for every application above a spend floor",
      "Report allocation coverage as a number, weekly",
    ], DARK_CARD, WHITE, MUTED_D, AMBER],
    ["Weeks 5–8", "Guardrails, showback", [
      "Quotas and autoscale ceilings on the top ten workloads",
      "Alert tiers wired to owners, not to a shared mailbox",
      "Showback: every team sees its own spend, nothing is charged",
    ], TINT, INK, MUTED, "B87B18"],
    ["Weeks 9–12", "Review and decide", [
      "Monthly review with finance in the room",
      "Unit-cost baseline for the two largest products",
      "Decide whether and when showback becomes chargeback",
    ], TINT, INK, MUTED, "B87B18"],
  ];
  const xs = [0.6, 4.74, 8.88];
  for (let i = 0; i < phases.length; i++) {
    const [when, what, items, fill, textColor, itemColor, accent] = phases[i];
    card(s, { x: xs[i], y: 1.95, w: 3.84, h: 3.5, fill, shadow: false });
    s.addText(when, {
      x: xs[i] + 0.34, y: 2.15, w: 3.2, h: 0.32, fontFace: BODY, fontSize: 11.5, bold: true,
      charSpacing: 1.6, color: accent, margin: 0, valign: "middle",
    });
    s.addText(what, {
      x: xs[i] + 0.34, y: 2.52, w: 3.2, h: 0.44, fontFace: HEAD, fontSize: 18, bold: true,
      color: textColor, margin: 0, valign: "middle",
    });
    let iy = 3.1;
    for (const item of items) {
      s.addShape(pres.ShapeType.ellipse, {
        x: xs[i] + 0.36, y: iy + 0.14, w: 0.11, h: 0.11,
        fill: { color: accent }, line: { type: "none" },
      });
      s.addText(item, {
        x: xs[i] + 0.62, y: iy, w: 2.94, h: 0.72, fontFace: BODY, fontSize: 12,
        color: itemColor, margin: 0, valign: "top", lineSpacing: 16,
      });
      iy += 0.75;
    }
  }

  card(s, { x: M, y: 5.7, w: 12.13, h: 1.2, fill: DARK_CARD });
  s.addText("Decisions needed today", {
    x: M + 0.36, y: 5.86, w: 4, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.8, color: AMBER, margin: 0, valign: "middle",
  });
  const decisions = [
    "Do we enforce tagging at deployment?",
    "Who owns the taxonomy — and by when?",
    "Are we willing to have a limit that actually blocks?",
  ];
  let dx = M + 0.36;
  for (const d of decisions) {
    s.addText(d, {
      x: dx, y: 6.2, w: 3.9, h: 0.5, fontFace: BODY, fontSize: 13.5, bold: true,
      color: WHITE, margin: 0, valign: "top", lineSpacing: 17,
    });
    dx += 4.0;
  }

  note(s, "ask");
}

(async () => {
  pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  kit.setPres(pres);
  pres.author = "FinOps";
  pres.title = "FinOps — CIO brief";
  pres.subject = "Cloud cost visibility and governance — five-slide executive cut";

  await slideGap();
  await slideWhyNow();
  await slideVisibility();
  await slideGovernance();
  await slideAsk();

  await pres.writeFile({ fileName: OUT });
  console.log("wrote " + OUT);
})();
