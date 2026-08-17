/**
 * Deck engine — turns a content array into a .pptx.
 *
 * Shared by every deck in this folder (`build.js` for the operational review,
 * `build-cio.js` for the combined CIO briefing). Renderers live in the RENDER
 * map keyed by slide `kind`; add a kind here rather than special-casing an
 * existing one.
 */

const PptxGenJS = require("pptxgenjs");

const { COLORS, FONTS, SIZE, GEO } = require("./theme");
const C = require("./components");
const DATA = require("../data/charts.json");

/* ------------------------------------------------------------------ *
 * Chart data access
 * ------------------------------------------------------------------ */

function chartOf(id, spec = {}) {
  // A slide can carry its own series inline instead of pointing at the
  // extracted workbook data — used for figures that come from the CIO deck
  // rather than from the operational workbooks.
  if (spec && spec.inline) return { cats: spec.inline.cats, series: spec.inline.series };

  const raw = DATA[id];
  if (!raw) throw new Error(`Unknown chart id: ${id}`);
  let series = raw.series;
  if (spec.drop) series = series.filter((s) => !spec.drop.includes(s.name));
  if (spec.only) series = series.filter((s) => spec.only.includes(s.name));
  return { cats: raw.cats, series };
}

const seriesTotal = (s) => C.sum(s.vals);
const grandTotal = (c) => C.sum(c.series.map(seriesTotal));

/**
 * Resolve an `auto:*` token against the slide's charts.
 *   auto:total            auto:total:chart3        auto:total:chart43+chart42
 *   auto:last             auto:last:chart19
 *   auto:top              auto:topshare:chart11
 *   auto:change:chart17
 *   auto:series:Foundry Models        auto:series:chart34:Foundry Models
 */
function resolveAuto(token, defaultId, spec) {
  if (typeof token !== "string" || !token.startsWith("auto:")) return token;
  const [, op, ...rest] = token.split(":");
  const arg = rest.join(":");

  // Multi-chart sums: auto:total:chartA+chartB
  if (arg && arg.includes("+")) {
    const ids = arg.split("+");
    const t = C.sum(ids.map((id) => grandTotal(chartOf(id, spec))));
    return op === "total" ? C.money(t) : C.money(t);
  }

  let id = defaultId;
  let name = null;
  if (arg) {
    const parts = arg.split(":");
    if (DATA[parts[0]]) {
      id = parts[0];
      name = parts.slice(1).join(":") || null;
    } else {
      name = arg;
    }
  }
  const c = chartOf(id, spec);
  const ranked = [...c.series].sort((a, b) => seriesTotal(b) - seriesTotal(a));
  const total = grandTotal(c);

  switch (op) {
    case "total":
      return C.money(total);
    case "last": {
      const v = C.sum(c.series.map((s) => s.vals[s.vals.length - 1] || 0));
      return C.money(v);
    }
    case "top":
      return ranked[0].name;
    case "topshare":
      return ((seriesTotal(ranked[0]) / total) * 100).toFixed(0) + "% of the total";
    case "change": {
      const totals = C.totalsByPeriod(c.series);
      return C.changeLabel(C.change(totals), c.cats[0], c.cats[c.cats.length - 1]);
    }
    case "series": {
      const s = c.series.find((x) => x.name === name);
      return s ? C.money(seriesTotal(s)) : "—";
    }
    case "seriesshare": {
      const s = c.series.find((x) => x.name === name);
      return s ? ((seriesTotal(s) / total) * 100).toFixed(0) + "% of the total" : "—";
    }
    default:
      return token;
  }
}

const resolveStats = (stats, defaultId, spec) =>
  (stats || []).map((st) => ({
    ...st,
    value: resolveAuto(st.value, defaultId, spec),
    note: resolveAuto(st.note, defaultId, spec),
  }));

/* ------------------------------------------------------------------ *
 * Chart rendering
 * ------------------------------------------------------------------ */

function drawChart(pres, s, spec, box) {
  const c = chartOf(spec.id, spec);
  const series = spec.inline ? c.series : C.topSeries(c.series, spec.top || 7);

  if (spec.type === "rank") {
    const ranked = [...series].sort((a, b) => seriesTotal(a) - seriesTotal(b));
    C.rankChart(pres, s, {
      ...box,
      cats: ranked.map((x) => (x.name.length > 34 ? x.name.slice(0, 32) + "…" : x.name)),
      vals: ranked.map(seriesTotal),
      color: spec.color || COLORS.azure,
    });
    return;
  }
  if (spec.type === "line") {
    C.lineChart(pres, s, {
      ...box, cats: c.cats, series,
      legend: spec.legend !== false,
      colors: spec.colors,
    });
    return;
  }
  C.stackedChart(pres, s, { ...box, cats: c.cats, series, legend: spec.legend !== false });
}

function chartHeading(s, text, x, y, w) {
  s.addText(text, {
    x, y, w, h: 0.26,
    fontFace: FONTS.head, fontSize: SIZE.cardTitle, bold: true,
    color: COLORS.text, margin: 0, valign: "middle",
  });
}

/* ------------------------------------------------------------------ *
 * Slide renderers, one per `kind`
 * ------------------------------------------------------------------ */

const RENDER = {
  section(pres, spec) {
    C.sectionSlide(pres, spec);
  },

  /** Sign-off: the same disc motif, but everything centred and set large. */
  closing(pres, spec) {
    const s = pres.addSlide();
    C.paintBackground(pres, s);
    const accent = spec.accent || COLORS.cyan;

    s.addShape(pres.ShapeType.ellipse, {
      x: 8.6, y: -1.4, w: 6.4, h: 6.4,
      fill: { color: accent, transparency: 92 },
      line: { color: accent, width: 0, transparency: 100 },
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: 10.0, y: 2.6, w: 5.2, h: 5.2,
      fill: { color: COLORS.cyan, transparency: 93 },
      line: { color: COLORS.cyan, width: 0, transparency: 100 },
    });

    // Centre the whole block on the slide. With no kicker and no subtitle the
    // title alone sits dead centre; each optional line shifts it up to keep the
    // group balanced rather than the title itself.
    const titleH = 2.0;
    const above = spec.kicker ? 0.5 : 0;
    const below = spec.sub ? 0.55 : 0;
    const top = (GEO.h - (above + titleH + below)) / 2;

    if (spec.kicker) {
      s.addText(spec.kicker.toUpperCase(), {
        x: 0, y: top, w: GEO.w, h: 0.4,
        fontFace: FONTS.head, fontSize: 14, bold: true,
        color: accent, charSpacing: 3, margin: 0,
        align: "center", valign: "middle",
      });
    }
    s.addText(spec.title, {
      x: 0, y: top + above, w: GEO.w, h: titleH,
      fontFace: FONTS.head, fontSize: spec.titleSize || 110, bold: true,
      color: spec.titleColor || COLORS.text,
      margin: 0, align: "center", valign: "middle",
    });
    if (spec.sub) {
      s.addText(spec.sub, {
        x: 0, y: top + above + titleH, w: GEO.w, h: 0.5,
        fontFace: FONTS.body, fontSize: 15, color: COLORS.muted,
        margin: 0, align: "center", valign: "middle",
      });
    }
    return s;
  },

  agenda(pres, spec) {
    const s = C.slide(pres, {
      eyebrow: spec.eyebrow,
      accent: COLORS.cyan,
      title: spec.title,
      note: spec.note,
    });
    const cols = 4;
    const w = (GEO.contentW - 0.3 * (cols - 1)) / cols;
    const h = 1.55;
    spec.items.forEach((it, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = GEO.margin + col * (w + 0.3);
      const y = GEO.bodyTop + 0.35 + row * (h + 0.35);
      const inner = C.card(pres, s, { x, y, w, h });
      s.addText(String(i + 1).padStart(2, "0"), {
        x: inner.x, y: y + 0.18, w: inner.w, h: 0.32,
        fontFace: FONTS.head, fontSize: 20, bold: true,
        color: it.accent, margin: 0, valign: "middle",
      });
      s.addText(it.label, {
        x: inner.x, y: y + 0.56, w: inner.w, h: 0.3,
        fontFace: FONTS.head, fontSize: 15, bold: true,
        color: COLORS.text, margin: 0, valign: "middle",
      });
      s.addText(it.desc, {
        x: inner.x, y: y + 0.88, w: inner.w, h: 0.55,
        fontFace: FONTS.body, fontSize: 12, color: COLORS.muted,
        margin: 0, valign: "top", lineSpacingMultiple: 1.15,
      });
    });
  },

  chart(pres, spec) {
    const s = C.slide(pres, {
      eyebrow: spec.eyebrow, accent: spec.accent,
      title: spec.title, note: spec.note, foot: spec.foot,
    });

    const chartW = 8.05;
    chartHeading(s, spec.chartTitle || "", GEO.margin, GEO.bodyTop, chartW);
    drawChart(pres, s, spec.chart, {
      x: GEO.margin - 0.05, y: GEO.bodyTop + 0.3, w: chartW, h: 5.0,
    });

    const railX = GEO.margin + chartW + 0.3;
    const railW = GEO.w - railX - GEO.margin;
    let y = GEO.bodyTop;
    resolveStats(spec.stats, spec.chart.id, spec.chart).forEach((st) => {
      C.statTile(pres, s, { ...st, x: railX, y, w: railW, h: 1.2 });
      y += 1.34;
    });
    if (spec.notes) {
      C.noteList(pres, s, {
        x: railX + 0.02, y: y + 0.15, w: railW - 0.04,
        items: spec.notes.items, title: spec.notes.title, accent: spec.accent,
      });
    }
  },

  dualChart(pres, spec) {
    const s = C.slide(pres, {
      eyebrow: spec.eyebrow, accent: spec.accent,
      title: spec.title, note: spec.note, foot: spec.foot,
    });

    const stats = resolveStats(spec.stats, spec.charts[0].id, spec.charts[0]);
    const n = Math.max(stats.length, 1);
    const sw = (GEO.contentW - 0.25 * (n - 1)) / n;
    stats.forEach((st, i) => {
      C.statTile(pres, s, {
        ...st, x: GEO.margin + i * (sw + 0.25), y: GEO.bodyTop - 0.05, w: sw, h: 1.18,
      });
    });

    const top = GEO.bodyTop + 1.3;
    const cw = (GEO.contentW - 0.35) / 2;
    spec.charts.forEach((ch, i) => {
      const x = GEO.margin + i * (cw + 0.35);
      chartHeading(s, ch.title, x, top, cw);
      drawChart(pres, s, ch, { x: x - 0.05, y: top + 0.3, w: cw, h: 3.65 });
    });
  },

  table(pres, spec) {
    const s = C.slide(pres, {
      eyebrow: spec.eyebrow, accent: spec.accent,
      title: spec.title, note: spec.note, noteRtl: spec.noteRtl, foot: spec.foot,
    });

    const width = (t) => C.sum(t.cols.map((c) => c.w));
    const stats = resolveStats(spec.stats, null, {});
    const sideBySide =
      spec.tables.length === 2 && C.sum(spec.tables.map(width)) + 0.4 <= GEO.contentW;

    if (sideBySide) {
      let x = GEO.margin;
      let deepest = GEO.bodyTop;
      spec.tables.forEach((t) => {
        let y = GEO.bodyTop;
        if (t.title) {
          chartHeading(s, t.title, x, y, width(t));
          y += 0.3;
        }
        if (t.sub) {
          s.addText(t.sub, {
            x, y, w: width(t), h: 0.24,
            fontFace: FONTS.body, fontSize: SIZE.cardSub, color: COLORS.muted,
            margin: 0, valign: "middle",
          });
          y += 0.28;
        }
        deepest = Math.max(deepest, drawTable(pres, s, t, x, y));
        x += width(t) + 0.4;
      });
      // Stats become a strip under the tables — placed against the deepest of
      // the two, not pinned to the floor, so short tables do not leave a hole.
      if (stats.length) {
        const sw = (GEO.contentW - 0.25 * (stats.length - 1)) / stats.length;
        const sy = Math.min(Math.max(deepest + 0.4, 4.1), 5.55);
        stats.forEach((st, i) => {
          C.statTile(pres, s, {
            ...st, x: GEO.margin + i * (sw + 0.25), y: sy, w: sw, h: 1.18,
          });
        });
      }
      return;
    }

    // Single (or stacked) table on the left, stat rail on the right.
    const tw = Math.max(...spec.tables.map(width));
    const railX = GEO.margin + tw + 0.4;
    const railW = GEO.w - railX - GEO.margin;
    let y = GEO.bodyTop;
    spec.tables.forEach((t) => {
      if (t.title) {
        chartHeading(s, t.title, GEO.margin, y, tw);
        y += 0.3;
      }
      if (t.sub) {
        s.addText(t.sub, {
          x: GEO.margin, y, w: tw, h: 0.24,
          fontFace: FONTS.body, fontSize: SIZE.cardSub, color: COLORS.muted,
          margin: 0, valign: "middle",
        });
        y += 0.28;
      }
      y = drawTable(pres, s, t, GEO.margin, y) + 0.35;
    });

    if (!stats.length) return;

    if (railW > 1.8) {
      let sy = GEO.bodyTop;
      stats.forEach((st) => {
        C.statTile(pres, s, {
          ...st, x: railX, y: sy, w: railW, h: 1.2,
          valueSize: st.big ? 30 : SIZE.stat,
        });
        sy += 1.34;
      });
    } else {
      // Full-width table: the rail has nowhere to go, so run the stats under it.
      const sw = (GEO.contentW - 0.25 * (stats.length - 1)) / stats.length;
      const sy = Math.min(Math.max(y + 0.25, 4.1), 5.55);
      stats.forEach((st, i) => {
        C.statTile(pres, s, {
          ...st, x: GEO.margin + i * (sw + 0.25), y: sy, w: sw, h: 1.18,
        });
      });
    }
  },

  /* ---------------------------------------------------------------- *
   * Executive slide kinds
   * ---------------------------------------------------------------- */

  /** One dominant figure on the left, a breakdown of contributors on the right. */
  hero(pres, spec) {
    const s = C.slide(pres, {
      eyebrow: spec.eyebrow, accent: spec.accent,
      title: spec.title, note: spec.note, foot: spec.foot,
    });

    s.addText(spec.value, {
      x: GEO.margin, y: 1.85, w: 6.2, h: 1.5,
      fontFace: FONTS.head, fontSize: 96, bold: true,
      color: COLORS.text, margin: 0, valign: "middle",
    });
    s.addText(spec.valueLabel, {
      x: GEO.margin, y: 3.35, w: 6.2, h: 0.4,
      fontFace: FONTS.body, fontSize: 15, color: COLORS.muted,
      margin: 0, valign: "middle",
    });
    if (spec.delta) {
      s.addText(spec.delta, {
        x: GEO.margin, y: 3.78, w: 6.2, h: 0.4,
        fontFace: FONTS.head, fontSize: 17, bold: true,
        color: spec.deltaColor || COLORS.danger, margin: 0, valign: "middle",
      });
    }

    // Contributor cards down the right.
    const x = 7.1;
    const w = GEO.w - x - GEO.margin;
    let y = 1.7;
    (spec.parts || []).forEach((p) => {
      C.card(pres, s, { x, y, w, h: 1.0 });
      s.addText(p.label, {
        x: x + 0.22, y: y + 0.14, w: w - 0.44, h: 0.3,
        fontFace: FONTS.head, fontSize: 15, bold: true,
        color: p.accent, margin: 0, valign: "middle",
      });
      s.addText(p.value, {
        x: x + 0.22, y: y + 0.46, w: (w - 0.44) * 0.5, h: 0.38,
        fontFace: FONTS.head, fontSize: 22, bold: true,
        color: COLORS.text, margin: 0, valign: "middle",
      });
      s.addText(p.note, {
        x: x + 0.22 + (w - 0.44) * 0.5, y: y + 0.46, w: (w - 0.44) * 0.5, h: 0.38,
        fontFace: FONTS.body, fontSize: 12, color: COLORS.muted,
        margin: 0, valign: "middle", align: "right",
      });
      y += 1.15;
    });

    if (spec.points) {
      C.noteList(pres, s, {
        x: GEO.margin, y: 4.45, w: 6.2,
        items: spec.points, accent: spec.accent, title: spec.pointsTitle,
      });
    }
  },

  /**
   * The reconciliation slide: A − B = C across the top, then the line-by-line
   * delta underneath. Built for the $16,100 credit, reusable for any variance.
   */
  reconcile(pres, spec) {
    const s = C.slide(pres, {
      eyebrow: spec.eyebrow, accent: spec.accent,
      title: spec.title, note: spec.note, foot: spec.foot,
    });

    const n = spec.terms.length;
    const gap = 0.55;
    const w = (GEO.contentW - gap * (n - 1)) / n;
    spec.terms.forEach((t, i) => {
      const x = GEO.margin + i * (w + gap);
      C.card(pres, s, { x, y: GEO.bodyTop, w, h: 1.3, accent: t.accent });
      s.addText(t.label.toUpperCase(), {
        x: x + 0.22, y: GEO.bodyTop + 0.16, w: w - 0.44, h: 0.26,
        fontFace: FONTS.head, fontSize: SIZE.statLabel, bold: true,
        color: COLORS.muted, charSpacing: 1.2, margin: 0, valign: "middle",
      });
      s.addText(t.value, {
        x: x + 0.22, y: GEO.bodyTop + 0.46, w: w - 0.44, h: 0.5,
        fontFace: FONTS.head, fontSize: 30, bold: true,
        color: t.accent || COLORS.text, margin: 0, valign: "middle",
      });
      s.addText(t.note || "", {
        x: x + 0.22, y: GEO.bodyTop + 0.94, w: w - 0.44, h: 0.26,
        fontFace: FONTS.body, fontSize: 12, color: COLORS.muted,
        margin: 0, valign: "middle",
      });
      if (t.op) {
        s.addText(t.op, {
          x: x - gap, y: GEO.bodyTop + 0.4, w: gap, h: 0.5,
          fontFace: FONTS.head, fontSize: 24, bold: true,
          color: COLORS.muted, margin: 0, align: "center", valign: "middle",
        });
      }
    });

    let y = GEO.bodyTop + 1.75;
    if (spec.tableTitle) {
      chartHeading(s, spec.tableTitle, GEO.margin, y, GEO.contentW);
      y += 0.34;
    }
    if (spec.table) y = drawTable(pres, s, spec.table, GEO.margin, y);

    const stats = resolveStats(spec.stats, null, {});
    if (stats.length) {
      const sw = (GEO.contentW - 0.25 * (stats.length - 1)) / stats.length;
      const sy = Math.min(Math.max(y + 0.45, 4.3), 5.55);
      stats.forEach((st, i) => {
        C.statTile(pres, s, {
          ...st, x: GEO.margin + i * (sw + 0.25), y: sy, w: sw, h: 1.18,
        });
      });
    }
  },

  /** Left consumers → centre control point → right providers. */
  flow(pres, spec) {
    const s = C.slide(pres, {
      eyebrow: spec.eyebrow, accent: spec.accent,
      title: spec.title, note: spec.note, foot: spec.foot,
    });

    const colW = 3.35;
    const midW = GEO.contentW - colW * 2 - 0.7;
    const midX = GEO.margin + colW + 0.35;
    const top = GEO.bodyTop + 0.25;

    const column = (x, heading, items, accent) => {
      s.addText(heading.toUpperCase(), {
        x, y: top - 0.38, w: colW, h: 0.26,
        fontFace: FONTS.head, fontSize: 12, bold: true,
        color: COLORS.muted, charSpacing: 1.4, margin: 0, valign: "middle",
      });
      items.forEach((it, i) => {
        const y = top + i * 0.72;
        C.card(pres, s, { x, y, w: colW, h: 0.6 });
        s.addText(it, {
          x: x + 0.2, y, w: colW - 0.4, h: 0.6,
          fontFace: FONTS.body, fontSize: 13, color: COLORS.text,
          margin: 0, valign: "middle",
        });
        void accent;
      });
    };

    column(GEO.margin, spec.left.heading, spec.left.items, spec.accent);
    column(GEO.margin + colW + 0.35 + midW + 0.35, spec.right.heading, spec.right.items, spec.accent);

    // Centre control panel.
    const midH = Math.max(spec.left.items.length, spec.right.items.length) * 0.72 - 0.12;
    s.addShape(pres.ShapeType.roundRect, {
      x: midX, y: top, w: midW, h: midH,
      rectRadius: 0.06,
      fill: { color: COLORS.cardHi },
      line: { color: spec.accent, width: 1.25 },
    });
    s.addText(spec.centre.title, {
      x: midX + 0.2, y: top + 0.18, w: midW - 0.4, h: 0.36,
      fontFace: FONTS.head, fontSize: 17, bold: true,
      color: COLORS.text, margin: 0, valign: "middle", align: "center",
    });
    s.addText(spec.centre.sub, {
      x: midX + 0.2, y: top + 0.54, w: midW - 0.4, h: 0.28,
      fontFace: FONTS.body, fontSize: 12, color: COLORS.muted,
      margin: 0, valign: "middle", align: "center",
    });

    const chips = spec.centre.chips;
    const perRow = 2;
    const cw = (midW - 0.4 - 0.2) / perRow;
    chips.forEach((chip, i) => {
      const cx = midX + 0.2 + (i % perRow) * (cw + 0.2);
      const cy = top + 0.95 + Math.floor(i / perRow) * 0.5;
      s.addShape(pres.ShapeType.roundRect, {
        x: cx, y: cy, w: cw, h: 0.4,
        rectRadius: 0.1,
        fill: { color: COLORS.card },
        line: { color: COLORS.border, width: 0.75 },
      });
      s.addText(chip, {
        x: cx, y: cy, w: cw, h: 0.4,
        fontFace: FONTS.body, fontSize: 12, color: COLORS.text,
        margin: 0, valign: "middle", align: "center",
      });
    });

    if (spec.centre.foot) {
      s.addText(spec.centre.foot, {
        x: midX + 0.2, y: top + midH - 0.62, w: midW - 0.4, h: 0.5,
        fontFace: FONTS.body, fontSize: 11.5, color: COLORS.muted,
        margin: 0, valign: "middle", align: "center", lineSpacingMultiple: 1.1,
      });
    }
  },

  /** Numbered process cards, optionally badged as mandatory gates. */
  steps(pres, spec) {
    const s = C.slide(pres, {
      eyebrow: spec.eyebrow, accent: spec.accent,
      title: spec.title, note: spec.note, foot: spec.foot,
    });

    const cols = spec.cols || 4;
    const rows = Math.ceil(spec.items.length / cols);
    const w = (GEO.contentW - 0.28 * (cols - 1)) / cols;
    const h = rows > 1 ? 2.05 : 3.0;

    spec.items.forEach((it, i) => {
      const x = GEO.margin + (i % cols) * (w + 0.28);
      const y = GEO.bodyTop + 0.3 + Math.floor(i / cols) * (h + 0.28);
      C.card(pres, s, { x, y, w, h });

      s.addText(String(i + 1).padStart(2, "0"), {
        x: x + 0.22, y: y + 0.16, w: 0.9, h: 0.36,
        fontFace: FONTS.head, fontSize: 21, bold: true,
        color: it.gate ? spec.accent : COLORS.faint, margin: 0, valign: "middle",
      });
      if (it.gate) {
        s.addShape(pres.ShapeType.roundRect, {
          x: x + w - 0.92, y: y + 0.2, w: 0.7, h: 0.26,
          rectRadius: 0.13,
          fill: { color: "3D2B0C" },
          line: { color: spec.accent, width: 0.75 },
        });
        s.addText("GATE", {
          x: x + w - 0.92, y: y + 0.2, w: 0.7, h: 0.26,
          fontFace: FONTS.head, fontSize: 11, bold: true,
          color: spec.accent, margin: 0, align: "center", valign: "middle",
          charSpacing: 0.8,
        });
      }
      s.addText(it.label, {
        x: x + 0.22, y: y + 0.58, w: w - 0.44, h: 0.56,
        fontFace: FONTS.head, fontSize: 14, bold: true,
        color: COLORS.text, margin: 0, valign: "top",
      });
      s.addText(it.desc, {
        x: x + 0.22, y: y + 1.2, w: w - 0.44, h: h - 1.34,
        fontFace: FONTS.body, fontSize: 12, color: COLORS.muted,
        margin: 0, valign: "top", lineSpacingMultiple: 1.15,
      });
    });
  },

  /** Numbered criteria in two columns — "nothing ships without these". */
  criteria(pres, spec) {
    const s = C.slide(pres, {
      eyebrow: spec.eyebrow, accent: spec.accent,
      title: spec.title, note: spec.note, foot: spec.foot,
    });

    const cols = 2;
    const w = (GEO.contentW - 0.4) / cols;
    const perCol = Math.ceil(spec.items.length / cols);
    spec.items.forEach((it, i) => {
      const col = Math.floor(i / perCol);
      const row = i % perCol;
      const x = GEO.margin + col * (w + 0.4);
      const y = GEO.bodyTop + 0.25 + row * 0.72;

      s.addShape(pres.ShapeType.ellipse, {
        x, y: y + 0.08, w: 0.36, h: 0.36,
        fill: { color: COLORS.card },
        line: { color: spec.accent, width: 1 },
      });
      s.addText(String(i + 1), {
        x, y: y + 0.08, w: 0.36, h: 0.36,
        fontFace: FONTS.head, fontSize: 13, bold: true,
        color: spec.accent, margin: 0, align: "center", valign: "middle",
      });
      s.addText(it.label, {
        x: x + 0.5, y: y + 0.02, w: w - 0.5, h: 0.28,
        fontFace: FONTS.head, fontSize: 14, bold: true,
        color: COLORS.text, margin: 0, valign: "middle",
      });
      s.addText(it.desc, {
        x: x + 0.5, y: y + 0.3, w: w - 0.5, h: 0.4,
        fontFace: FONTS.body, fontSize: 12, color: COLORS.muted,
        margin: 0, valign: "top", lineSpacingMultiple: 1.1,
      });
    });

    if (spec.banner) {
      const y = GEO.bodyTop + 0.25 + perCol * 0.72 + 0.2;
      C.card(pres, s, { x: GEO.margin, y, w: GEO.contentW, h: 1.0, accent: spec.accent });
      s.addText(spec.banner.title, {
        x: GEO.margin + 0.25, y: y + 0.14, w: GEO.contentW - 0.5, h: 0.32,
        fontFace: FONTS.head, fontSize: 16, bold: true,
        color: COLORS.text, margin: 0, valign: "middle",
      });
      s.addText(spec.banner.text, {
        x: GEO.margin + 0.25, y: y + 0.46, w: GEO.contentW - 0.5, h: 0.44,
        fontFace: FONTS.body, fontSize: 12.5, color: COLORS.muted,
        margin: 0, valign: "top", lineSpacingMultiple: 1.15,
      });
    }
  },

  /** One very large figure with a paragraph beside it. */
  bigStat(pres, spec) {
    const s = C.slide(pres, {
      eyebrow: spec.eyebrow, accent: spec.accent,
      title: spec.title, note: spec.note, foot: spec.foot,
    });

    const stats = resolveStats(spec.stats, null, {});
    if (stats.length) {
      const sw = (GEO.contentW - 0.25 * (stats.length - 1)) / stats.length;
      stats.forEach((st, i) => {
        C.statTile(pres, s, {
          ...st, x: GEO.margin + i * (sw + 0.25), y: GEO.bodyTop, w: sw, h: 1.18,
        });
      });
    }

    const y = stats.length ? GEO.bodyTop + 1.35 : GEO.bodyTop + 0.2;
    C.card(pres, s, { x: GEO.margin, y, w: GEO.contentW, h: 1.85, accent: spec.accent });
    s.addText(spec.value, {
      x: GEO.margin + 0.35, y: y + 0.2, w: 3.4, h: 1.45,
      fontFace: FONTS.head, fontSize: 66, bold: true,
      color: spec.accent, margin: 0, valign: "middle",
    });
    s.addText(spec.text, {
      x: GEO.margin + 3.9, y: y + 0.28, w: GEO.contentW - 4.3, h: 1.3,
      fontFace: FONTS.body, fontSize: 15.5, color: COLORS.text,
      margin: 0, valign: "middle", lineSpacingMultiple: 1.25,
    });

    if (spec.points) {
      C.noteList(pres, s, {
        x: GEO.margin, y: y + 2.15, w: GEO.contentW,
        items: spec.points, accent: spec.accent, title: spec.pointsTitle,
      });
    }
  },
};

/**
 * Draws one table block; returns the y coordinate just below it.
 *
 * The returned height accounts for cells that wrap. PowerPoint grows a row to
 * fit its content, so assuming every row is exactly `rowH` tall understates a
 * table with long labels — and whatever is placed underneath then lands on top
 * of it.
 */
function drawTable(pres, s, t, x, y) {
  const rowH = t.rowH || 0.32;
  const fontSize = t.fontSize || SIZE.table;
  C.table(pres, s, {
    x, y,
    w: C.sum(t.cols.map((c) => c.w)),
    cols: t.cols,
    rows: t.rtl ? t.rows.map(rtlRow) : t.rows,
    rowH,
    fontSize,
  });

  // ~12 characters per inch at 12pt Calibri, scaling with the font size.
  const perInch = 144 / fontSize;
  const lineH = (fontSize / 72) * 1.25;
  const heightOf = (row) => {
    const lines = Math.max(
      1,
      ...row.map((cell, j) => {
        const text = String((cell && cell.text !== undefined ? cell.text : cell) ?? "");
        const cap = Math.max(6, (t.cols[j].w - 0.18) * perInch);
        return Math.ceil(text.length / cap);
      })
    );
    return Math.max(rowH, lines * lineH + 0.14);
  };

  const header = Math.max(rowH, lineH + 0.14);
  return y + header + C.sum(t.rows.map(heightOf));
}

/** Hebrew tables: mark every cell right-to-left so bidi text lays out correctly. */
const rtlRow = (row) =>
  row.map((cell) => {
    const c = typeof cell === "object" && cell !== null ? cell : { text: cell };
    return { ...c, rtlMode: true };
  });

/* ------------------------------------------------------------------ *
 * Build
 * ------------------------------------------------------------------ */

/** Renders `content` and writes it to `outFile`. */
function buildDeck(content, outFile, meta = {}) {
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 — must be set before any slide
  pres.author = meta.author || "Cloud Infrastructure, DevOps & Databases";
  pres.company = meta.company || "Harel Insurance";
  pres.title = meta.title || "Cloud FinOps — Harel, 2026";

  content.forEach((spec, i) => {
    const fn = RENDER[spec.kind];
    if (!fn) throw new Error(`Slide ${i + 1}: unknown kind "${spec.kind}"`);
    fn(pres, spec);

    // Presenter notes. Named `speakerNotes` because the `chart` kind already
    // uses `notes` for the bullet list drawn on the slide itself.
    if (spec.speakerNotes) {
      pres.slides[pres.slides.length - 1].addNotes(spec.speakerNotes);
    }
  });

  return pres.writeFile({ fileName: outFile }).then(() => {
    console.log(`Wrote ${outFile} — ${content.length} slides`);
  });
}

module.exports = { buildDeck, RENDER, resolveAuto, resolveStats, chartOf, drawChart, chartHeading, drawTable };
