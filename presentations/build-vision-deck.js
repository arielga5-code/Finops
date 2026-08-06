/*
 * FinOps — the vision, in five slides.
 *
 * For a management audience with decision authority. The arc is deliberate:
 * where we are going, where we are today, how we see it, how we control it,
 * what is being asked for. Each idea appears exactly once.
 *
 * usage: node build-vision-deck.js [outfile.pptx]
 */
const path = require("path");
const pptxgen = require("pptxgenjs");
const kit = require("./deck-kit.js");
const {
  DARK, DARK_CARD, WHITE, TINT, INK, MUTED, MUTED_D,
  AMBER, AMBER_SOFT, TEAL, TEAL_SOFT, HEAD, BODY, M,
  bg, card, iconBadge, kicker, title, sub,
} = kit;

const NOTES = require("./notes-vision.js");
const OUT = process.argv[2] || path.join(__dirname, "finops-vision.pptx");

let pres;

function note(slide, n) {
  if (!NOTES[n]) throw new Error("missing note for slide " + n);
  slide.addNotes(NOTES[n]);
}

/* ---------- 1. where we are going ---------- */
async function slideVision() {
  const s = pres.addSlide();
  bg(s, DARK);
  s.addText("FINOPS — THE VISION", {
    x: M, y: 0.8, w: 7, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 2.4, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText("Every project has a name,\nan owner, a number and a limit.", {
    x: M, y: 1.3, w: 11.5, h: 1.8, fontFace: HEAD, fontSize: 36, bold: true,
    color: WHITE, margin: 0, valign: "top", lineSpacing: 46,
  });
  s.addText(
    "Not a cost-cutting programme. The spending control that every other budget line already has, " +
    "applied to the one where the decisions are made daily by people who never see the invoice.",
    { x: M, y: 3.24, w: 11.2, h: 0.8, fontFace: BODY, fontSize: 15.5, color: MUTED_D,
      margin: 0, valign: "top", lineSpacing: 22 }
  );

  const pillars = [
    ["FiTag", "Named", "One identifier per project, across every resource it touches."],
    ["FiUser", "Owned", "A named person who signs off the budget and answers the alert."],
    ["FiTrendingUp", "Measured", "A cost per customer or per transaction, refreshed daily."],
    ["FiLock", "Limited", "A ceiling that binds before the invoice does."],
  ];
  const xs = [0.6, 3.7, 6.8, 9.9];
  for (let i = 0; i < pillars.length; i++) {
    const [ic, name, desc] = pillars[i];
    card(s, { x: xs[i], y: 4.4, w: 2.83, h: 2.0, fill: DARK_CARD, shadow: false });
    await iconBadge(s, { x: xs[i] + 0.28, y: 4.66, d: 0.52, bg: "2E3A48", icon: ic, color: AMBER });
    s.addText(name, {
      x: xs[i] + 0.28, y: 5.3, w: 2.3, h: 0.36, fontFace: HEAD, fontSize: 18, bold: true,
      color: WHITE, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: xs[i] + 0.28, y: 5.7, w: 2.3, h: 0.62, fontFace: BODY, fontSize: 12,
      color: MUTED_D, margin: 0, valign: "top", lineSpacing: 15,
    });
  }

  s.addText("Presented to Executive Leadership  ·  Date ____________", {
    x: M, y: 6.72, w: 8, h: 0.34, fontFace: BODY, fontSize: 11.5,
    color: "5C6675", margin: 0, valign: "middle",
  });

  note(s, "vision");
}

/* ---------- 2. why now ---------- */
async function slideWhyNow() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Why now");
  title(s, "This is where the industry is already going");
  sub(s, "FinOps Foundation, State of FinOps 2026 (n \u2248 1,500 practitioners worldwide).");

  const stats = [
    ["78%", "of FinOps practices now report into the CTO/CIO organization", "up 18 points since 2023", AMBER, DARK_CARD, WHITE, MUTED_D],
    ["98%", "of practices now manage AI spend as a core operating cost", "SaaS 90% \u00b7 licensing 64% \u00b7 data centre 48%", "1F6B5C", TEAL_SOFT, INK, MUTED],
    ["#3", "governance ranks above optimization in 2026 priorities", "behind only AI cost management and AI-driven efficiency", "B87B18", AMBER_SOFT, INK, MUTED],
  ];
  const xs = [0.6, 4.74, 8.88];
  for (let i = 0; i < stats.length; i++) {
    const [big, line, footnote, bigColor, fill, textColor, footColor] = stats[i];
    card(s, { x: xs[i], y: 2.32, w: 3.84, h: 3.0, fill, shadow: false });
    s.addText(big, {
      x: xs[i] + 0.34, y: 2.6, w: 3.2, h: 1.0, fontFace: HEAD, fontSize: 46, bold: true,
      color: bigColor, margin: 0, valign: "middle",
    });
    s.addText(line, {
      x: xs[i] + 0.34, y: 3.68, w: 3.2, h: 1.0, fontFace: BODY, fontSize: 14,
      color: textColor, margin: 0, valign: "top", lineSpacing: 19,
    });
    s.addText(footnote, {
      x: xs[i] + 0.34, y: 4.7, w: 3.2, h: 0.5, fontFace: BODY, fontSize: 11.5,
      color: footColor, margin: 0, valign: "top", lineSpacing: 15,
    });
  }

  card(s, { x: M, y: 5.56, w: 12.13, h: 1.68, fill: DARK_CARD });
  s.addText("What it means for this organization", {
    x: M + 0.36, y: 5.74, w: 8, h: 0.32, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.6, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText(
    [
      { text: "Cost control has stopped being a finance report and become a technology capability \u2014 ", options: { bold: true, color: WHITE } },
      { text: "which puts it on this desk. The industry's own conclusion is that attacking waste after the fact has hit diminishing returns; the returns now come from ownership, governance and scope.", options: { color: MUTED_D } },
    ],
    { x: M + 0.36, y: 6.1, w: 11.4, h: 1.05, fontFace: BODY, fontSize: 13.5, margin: 0,
      valign: "top", lineSpacing: 20 }
  );

  note(s, "why-now");
}

/* ---------- 3. see it ---------- */
async function slideSeeIt() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "Step one — see it");
  title(s, "One number per project, with an owner on it");
  sub(s, "Two things have to be true: the cost can be traced to someone, and the project is priced whole.");

  card(s, { x: M, y: 2.32, w: 5.9, h: 3.5, fill: TINT, shadow: false });
  s.addText("Trace it to an owner", {
    x: M + 0.34, y: 2.5, w: 5, h: 0.32, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.6, color: MUTED, margin: 0, valign: "middle",
  });
  const chain = [
    ["Tag at creation", "Five tags, enforced by policy. Untagged means undeployed."],
    ["Allocate the spend", "Target under 5% unallocated, reported weekly."],
    ["Show teams their own numbers", "Four to six weeks before anything is charged."],
    ["Divide by the unit", "Cost per customer, per order, per conversation."],
  ];
  let cy = 2.94;
  for (let i = 0; i < chain.length; i++) {
    const [name, desc] = chain[i];
    s.addText(String(i + 1), {
      x: M + 0.34, y: cy, w: 0.34, h: 0.62, fontFace: HEAD, fontSize: 15, bold: true,
      color: AMBER, margin: 0, valign: "top",
    });
    s.addText(
      [
        { text: name, options: { bold: true, color: INK, breakLine: true } },
        { text: desc, options: { color: MUTED } },
      ],
      { x: M + 0.74, y: cy, w: 4.82, h: 0.68, fontFace: BODY, fontSize: 12.5, margin: 0,
        valign: "top", lineSpacing: 16 }
    );
    cy += 0.7;
  }

  card(s, { x: 6.83, y: 2.32, w: 5.9, h: 3.5, fill: DARK_CARD });
  const cardBottom = 2.32 + 3.5;
  s.addText("Price the project whole", {
    x: 7.17, y: 2.5, w: 5, h: 0.32, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.6, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText("An AI feature is quoted at its token cost. It runs on a stack that bills every month regardless.", {
    x: 7.17, y: 2.86, w: 5.22, h: 0.5, fontFace: BODY, fontSize: 12.5,
    color: MUTED_D, margin: 0, valign: "top", lineSpacing: 17,
  });
  const stack = [
    ["Model / tokens", "the line everyone quotes", AMBER],
    ["Compute, databases, cache", "app services, SQL, Redis, queues", "8C9AAC"],
    ["Storage, network, observability", "backups, egress, log ingestion", "8C9AAC"],
  ];
  let ly = 3.5;
  for (const [name, desc, color] of stack) {
    s.addShape(pres.ShapeType.roundRect, {
      x: 7.17, y: ly + 0.1, w: 0.09, h: 0.3, rectRadius: 0.04,
      fill: { color }, line: { type: "none" },
    });
    s.addText(
      [
        { text: name, options: { bold: true, color: color === AMBER ? AMBER : WHITE, breakLine: true } },
        { text: desc, options: { color: MUTED_D } },
      ],
      { x: 7.4, y: ly, w: 5.0, h: 0.56, fontFace: BODY, fontSize: 12.5, margin: 0,
        valign: "top", lineSpacing: 16 }
    );
    ly += 0.62;
  }
  s.addText("Every layer bills whether or not the model is called.", {
    x: 7.17, y: ly, w: 5.0, h: 0.3, fontFace: BODY, fontSize: 11.5, italic: true,
    color: MUTED_D, margin: 0, valign: "top",
  });

  card(s, { x: M, y: 6.02, w: 12.13, h: 1.0, fill: TEAL_SOFT, shadow: false });
  s.addText(
    [
      { text: "One ApplicationID across every resource a project touches. ", options: { bold: true } },
      { text: "The review then sees a single number with a single owner — and the model's share becomes a ratio anyone can argue with, rather than the headline.", options: {} },
    ],
    { x: M + 0.36, y: 6.02, w: 11.4, h: 1.0, fontFace: BODY, fontSize: 13.5,
      color: INK, margin: 0, valign: "middle", lineSpacing: 19 }
  );

  note(s, "see-it");
}

/* ---------- 4. control it ---------- */
async function slideControlIt() {
  const s = pres.addSlide();
  bg(s, DARK);
  kicker(s, "Step two — control it");
  title(s, "Two moments, and only one of them is cheap", true);
  sub(s, "At design, changing a cost is a conversation. After deployment, it is a migration.", true);

  const columns = [
    {
      x: M, tag: "At design — shift left", accent: AMBER,
      lead: "FinOps sits in the design and intake conversation, understanding what the project needs before the architecture is set.",
      items: [
        ["Priced options", "Two or three costed before one is chosen."],
        ["A cost target", "Recorded beside the latency and availability targets."],
        ["Enforced in the pipeline", "Tagging and budget rules as policy, not paperwork."],
      ],
    },
    {
      x: 6.83, tag: "At runtime — guardrails", accent: TEAL,
      lead: "Controls that act on spend already running, ordered by how fast each one takes effect.",
      items: [
        ["Quotas and rate limits", "Seconds. The only control that stops spend in progress."],
        ["Alerts routed to owners", "Minutes on usage data. Never a page on a budget number."],
        ["Budget thresholds", "Notify, review, gate — against the elapsed month."],
      ],
    },
  ];
  for (const col of columns) {
    card(s, { x: col.x, y: 2.32, w: 5.9, h: 3.9, fill: DARK_CARD, shadow: false });
    s.addText(col.tag.toUpperCase(), {
      x: col.x + 0.34, y: 2.5, w: 5.2, h: 0.32, fontFace: BODY, fontSize: 11.5, bold: true,
      charSpacing: 1.6, color: col.accent, margin: 0, valign: "middle",
    });
    s.addText(col.lead, {
      x: col.x + 0.34, y: 2.88, w: 5.22, h: 0.7, fontFace: BODY, fontSize: 12.5,
      color: MUTED_D, margin: 0, valign: "top", lineSpacing: 17,
    });
    let iy = 3.72;
    for (const [name, desc] of col.items) {
      s.addShape(pres.ShapeType.ellipse, {
        x: col.x + 0.36, y: iy + 0.14, w: 0.11, h: 0.11,
        fill: { color: col.accent }, line: { type: "none" },
      });
      s.addText(
        [
          { text: name, options: { bold: true, color: WHITE, breakLine: true } },
          { text: desc, options: { color: MUTED_D } },
        ],
        { x: col.x + 0.62, y: iy, w: 4.94, h: 0.74, fontFace: BODY, fontSize: 12.5, margin: 0,
          valign: "top", lineSpacing: 16 }
      );
      iy += 0.78;
    }
  }

  s.addText(
    "“A cost alert cannot save you from a runaway job — by the time the billing data moves, the money is spent.”",
    { x: M, y: 6.42, w: 12.13, h: 0.62, fontFace: HEAD, fontSize: 14.5, italic: true,
      color: AMBER, margin: 0, valign: "middle" }
  );

  note(s, "control-it");
}

/* ---------- 5. the ask ---------- */
async function slideAsk() {
  const s = pres.addSlide();
  bg(s, WHITE);
  kicker(s, "What we are asking for");
  title(s, "Ninety days, and two decisions today");

  const phases = [
    ["Weeks 1–4", "Name it", "Tag taxonomy published and enforced. An owner recorded for every application above a spend floor.", true],
    ["Weeks 5–8", "See it", "One number per project, showback to every team, and cost in the design review.", false],
    ["Weeks 9–12", "Hold it", "Quotas on the largest workloads, alerts routed to owners, monthly review with finance.", false],
  ];
  const xs = [0.6, 4.74, 8.88];
  for (let i = 0; i < phases.length; i++) {
    const [when, what, desc, hero] = phases[i];
    card(s, { x: xs[i], y: 2.15, w: 3.84, h: 2.35, fill: hero ? DARK_CARD : TINT, shadow: false });
    s.addText(when, {
      x: xs[i] + 0.34, y: 2.34, w: 3.2, h: 0.32, fontFace: BODY, fontSize: 11.5, bold: true,
      charSpacing: 1.6, color: hero ? AMBER : "B87B18", margin: 0, valign: "middle",
    });
    s.addText(what, {
      x: xs[i] + 0.34, y: 2.7, w: 3.2, h: 0.44, fontFace: HEAD, fontSize: 20, bold: true,
      color: hero ? WHITE : INK, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: xs[i] + 0.34, y: 3.24, w: 3.2, h: 1.0, fontFace: BODY, fontSize: 12.5,
      color: hero ? MUTED_D : MUTED, margin: 0, valign: "top", lineSpacing: 17,
    });
  }

  card(s, { x: M, y: 4.76, w: 5.9, h: 1.6, fill: TINT, shadow: false });
  s.addText("How we will know it is working", {
    x: M + 0.34, y: 4.94, w: 5, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.4, color: MUTED, margin: 0, valign: "middle",
  });
  const kpis = [
    ["Allocation coverage", "under 5%"],
    ["Time to attribute a spike", "hours, not days"],
    ["Cost per unit", "trending, per project"],
  ];
  let ky = 5.3;
  for (const [k, v] of kpis) {
    s.addText(k, {
      x: M + 0.34, y: ky, w: 3.0, h: 0.3, fontFace: BODY, fontSize: 12.5, bold: true,
      color: INK, margin: 0, valign: "middle",
    });
    s.addText(v, {
      x: M + 3.4, y: ky, w: 2.16, h: 0.3, fontFace: BODY, fontSize: 12.5,
      color: MUTED, margin: 0, align: "right", valign: "middle",
    });
    ky += 0.33;
  }

  card(s, { x: 6.83, y: 4.76, w: 5.9, h: 1.68, fill: DARK_CARD });
  s.addText("Decisions needed today", {
    x: 7.17, y: 4.94, w: 5, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true,
    charSpacing: 1.4, color: AMBER, margin: 0, valign: "middle",
  });
  s.addText(
    [
      { text: "1.  Who owns the tagging standard, and by when?", options: { breakLine: true } },
      { text: "2.  Are we willing to have a limit that blocks?" },
    ],
    { x: 7.17, y: 5.28, w: 5.3, h: 1.05, fontFace: BODY, fontSize: 13.5, bold: true,
      color: WHITE, margin: 0, valign: "top", lineSpacing: 22 }
  );

  s.addText(
    "No new headcount and no platform purchase in this plan. A tooling decision comes later, and only if allocation cannot be fixed at source.",
    { x: M, y: 6.56, w: 12.13, h: 0.5, fontFace: BODY, fontSize: 12.5,
      color: MUTED, margin: 0, valign: "middle" }
  );

  note(s, "ask");
}

(async () => {
  pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  kit.setPres(pres);
  pres.author = "FinOps";
  pres.title = "FinOps — the vision in five slides";
  pres.subject = "Cloud and AI cost: name it, own it, measure it, limit it";

  await slideVision();
  await slideWhyNow();
  await slideSeeIt();
  await slideControlIt();
  await slideAsk();

  await pres.writeFile({ fileName: OUT });
  console.log("wrote " + OUT);
})();
