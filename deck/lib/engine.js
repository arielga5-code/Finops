/**
 * Deck engine, turns a content array into a .pptx.
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
  // extracted workbook data, used for figures that come from the CIO deck
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
      return s ? C.money(seriesTotal(s)) : "-";
    }
    case "seriesshare": {
      const s = c.series.find((x) => x.name === name);
      return s ? ((seriesTotal(s) / total) * 100).toFixed(0) + "% of the total" : "-";
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
      cats: ranked.map((x) => (x.name.length > 34 ? x.name.slice(0, 32) + "..." : x.name)),
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
  C.stackedChart(pres, s, {
    ...box, cats: c.cats, series,
    legend: spec.legend !== false,
    colors: spec.colors,
    grouping: spec.grouping,
    valFmt: spec.valFmt,
    dataLabels: spec.dataLabels,
  });
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
      // Stats become a strip under the tables, placed against the deepest of
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
   * The reconciliation slide: A - B = C across the top, then the line-by-line
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

  /** Left consumers to centre control point to right providers. */
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
        fontFace: FONTS.body, fontSize: SIZE.footnote, color: COLORS.muted,
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
          fontFace: FONTS.head, fontSize: SIZE.statLabel, bold: true,
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

  /**
   * Numbered criteria in two columns, "nothing ships without these".
   *
   * Row height, circle size and every font here are derived from how much
   * vertical room the slide actually has for this item count, rather than
   * fixed, a short list (few items, both columns even) used to leave a band
   * of empty canvas below the banner, which is dead space on a screen meant to
   * be read from across a room. Whatever height is left now goes into larger
   * type and a taller banner instead.
   *
   * An item may carry an optional `tip`, a third, shorter line under the
   * description, in the accent colour, for a practitioner detail that
   * supports the criterion rather than defining it. Present on every item or
   * none; a slide does not mix the two.
   */
  criteria(pres, spec) {
    const s = C.slide(pres, {
      eyebrow: spec.eyebrow, accent: spec.accent,
      title: spec.title, note: spec.note, foot: spec.foot,
    });

    const cols = 2;
    const gap = 0.4;
    const w = (GEO.contentW - gap) / cols;
    const perCol = Math.ceil(spec.items.length / cols);
    const hasTip = spec.items.some((it) => it.tip);

    const top = GEO.bodyTop + 0.25;
    const available = GEO.footY - 0.1 - top;
    const bannerH = spec.banner
      ? Math.min(1.55, Math.max(1.05, available * 0.26))
      : 0;
    const bannerGap = spec.banner ? 0.3 : 0;
    const pitch = (available - bannerH - bannerGap) / perCol;

    // Circle and type scale off the pitch we ended up with, clamped so a very
    // short list doesn't blow up and a very long one never shrinks below the
    // deck's 12pt floor.
    const scale = Math.max(0.85, Math.min(1.7, pitch / 0.72));
    const circleD = Math.max(0.36, Math.min(0.56, 0.36 * scale));
    const numSize = Math.max(13, Math.min(20, 13 * scale));
    let labelSize = Math.max(14, Math.min(21, 14 * scale));
    let descSize = Math.max(12, Math.min(16, 12 * scale));
    let tipSize = Math.max(12, Math.min(14, 12 * scale));

    // Each row stacks label, description and (if present) a tip line, and the
    // three must fit inside one `pitch` regardless of what the clamps above
    // picked, a longer item list, or adding tips to a slide that did not have
    // them, changes pitch independently of font size. Rather than hand-tune
    // constants for one item count, size every block from its own font size
    // using the table renderer's line-height convention, then if the stack
    // does not fit, shrink all three fonts by the one factor that makes it
    // fit and lay out again. Two passes, never more: height is linear in font
    // size, so the second pass lands exactly.
    //
    // Tips are written and reviewed as one-liners (see content-cio.js), so the
    // reservation is one line plus a small pad rather than a full second line
    //, reserving two, "just in case", was costing every row nearly half an
    // inch and dragging label and description down with it whenever a tip was
    // present. The 12pt floor below is what actually protects a tip that runs
    // long in a future edit; it wraps a little tight rather than shrinking
    // under the deck's type-scale minimum.
    const lineH = (pt) => (pt / 72) * 1.25;
    const descLines = hasTip ? 1 : 2;
    const rowGap = 0.05;
    const stackH = () =>
      lineH(labelSize) + rowGap + lineH(descSize) * descLines +
      (hasTip ? rowGap + lineH(tipSize) + 0.04 : 0);

    const room = pitch - 0.1; // leave a sliver between rows
    const over = stackH() / room;
    if (over > 1) {
      labelSize = Math.max(13, labelSize / over);
      descSize = Math.max(12, descSize / over);
      tipSize = Math.max(12, tipSize / over);
    }

    spec.items.forEach((it, i) => {
      const col = Math.floor(i / perCol);
      const row = i % perCol;
      const x = GEO.margin + col * (w + gap);
      const y = top + row * pitch;
      const textW = w - (circleD + 0.16);
      const textX = x + circleD + 0.16;

      s.addShape(pres.ShapeType.ellipse, {
        x, y: y + 0.06, w: circleD, h: circleD,
        fill: { color: COLORS.card },
        line: { color: spec.accent, width: 1.25 },
      });
      s.addText(String(i + 1), {
        x, y: y + 0.06, w: circleD, h: circleD,
        fontFace: FONTS.head, fontSize: numSize, bold: true,
        color: spec.accent, margin: 0, align: "center", valign: "middle",
      });

      const labelH = lineH(labelSize);
      const descH = lineH(descSize) * descLines;
      s.addText(it.label, {
        x: textX, y, w: textW, h: labelH,
        fontFace: FONTS.head, fontSize: labelSize, bold: true,
        color: COLORS.text, margin: 0, valign: "middle",
      });
      s.addText(it.desc, {
        x: textX, y: y + labelH + rowGap, w: textW, h: descH,
        fontFace: FONTS.body, fontSize: descSize, color: COLORS.muted,
        margin: 0, valign: "top", lineSpacingMultiple: 1.12,
      });
      if (it.tip) {
        // A two-run array here (bold "Tip:" + a plain run) is what pptxgenjs's
        // own docs show for mixed formatting, but the library emits a
        // paragraph-properties block once per run instead of once per
        // paragraph, malformed OOXML that PowerPoint tolerates and
        // LibreOffice does not: it silently drops the whole line. One run,
        // one style, renders correctly everywhere; "Tip:" leans on the colon
        // and the italic rather than on bolding.
        s.addText(`Tip: ${it.tip}`, {
          x: textX, y: y + labelH + rowGap + descH + rowGap, w: textW, h: lineH(tipSize) + 0.04,
          fontFace: FONTS.body, fontSize: tipSize, color: spec.accent, italic: true,
          margin: 0, valign: "top", lineSpacingMultiple: 1.05,
        });
      }
    });

    if (spec.banner) {
      const y = top + perCol * pitch + bannerGap;
      C.card(pres, s, { x: GEO.margin, y, w: GEO.contentW, h: bannerH, accent: spec.accent });
      const bTitleSize = Math.max(16, Math.min(22, 16 * scale));
      const bTextSize = Math.max(12.5, Math.min(16, 12.5 * scale));
      const pad = 0.28;
      const titleH = lineH(bTitleSize) + 0.08;
      s.addText(spec.banner.title, {
        x: GEO.margin + pad, y: y + pad - 0.12, w: GEO.contentW - pad * 2, h: titleH,
        fontFace: FONTS.head, fontSize: bTitleSize, bold: true,
        color: COLORS.text, margin: 0, valign: "middle",
      });
      s.addText(spec.banner.text, {
        x: GEO.margin + pad, y: y + pad - 0.12 + titleH,
        w: GEO.contentW - pad * 2, h: bannerH - (pad - 0.12 + titleH) - 0.16,
        fontFace: FONTS.body, fontSize: bTextSize, color: COLORS.muted,
        margin: 0, valign: "top", lineSpacingMultiple: 1.18,
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

  /**
   * One column per platform, ranked, under a strip that shows how the total
   * divides between them. Each column carries the period total, the share, the
   * first and last month side by side, and the growth between the two, the
   * growth is the point of the slide, so it gets the badge.
   */
  platforms(pres, spec) {
    const s = C.slide(pres, {
      eyebrow: spec.eyebrow, accent: spec.accent,
      title: spec.title, note: spec.note, foot: spec.foot,
    });

    const items = spec.items;
    const total = C.sum(items.map((it) => it.total));

    // Share strip: the whole bill as one bar, split in the same order as the
    // columns beneath it, so the eye can size a platform before reading a
    // figure. Segments below ~0.3" would collapse into a smear, so they get a
    // floor and the rest are scaled into what is left.
    const stripY = GEO.bodyTop;
    const minSeg = 0.28;
    const gap = 0.05;
    const spare = GEO.contentW - gap * (items.length - 1);
    const raw = items.map((it) => (it.total / total) * spare);
    const lifted = raw.map((w) => Math.max(minSeg, w));
    const scale = (spare - C.sum(lifted.filter((w) => w === minSeg))) /
      Math.max(0.01, C.sum(lifted.filter((w) => w !== minSeg)));
    let sx = GEO.margin;
    items.forEach((it, i) => {
      const w = lifted[i] === minSeg ? minSeg : lifted[i] * scale;
      s.addShape(pres.ShapeType.rect, {
        x: sx, y: stripY, w, h: 0.2,
        fill: { color: it.color },
        line: { color: it.color, width: 0 },
      });
      sx += w + gap;
    });

    const top = stripY + 0.42;
    const h = 4.35;
    const cw = (GEO.contentW - 0.22 * (items.length - 1)) / items.length;
    const pad = 0.2;

    items.forEach((it, i) => {
      const x = GEO.margin + i * (cw + 0.22);
      const iw = cw - pad * 2;
      s.addShape(pres.ShapeType.roundRect, {
        x, y: top, w: cw, h,
        rectRadius: 0.06,
        fill: { color: COLORS.card },
        line: { color: COLORS.border, width: 1 },
      });
      // A rule in the platform's own colour, so the column and its segment in
      // the strip above read as the same thing.
      s.addShape(pres.ShapeType.rect, {
        x, y: top, w: cw, h: 0.05,
        fill: { color: it.color },
        line: { color: it.color, width: 0 },
      });

      s.addText(it.name.toUpperCase(), {
        x: x + pad, y: top + 0.18, w: iw, h: 0.48,
        fontFace: FONTS.head, fontSize: SIZE.statLabel, bold: true,
        color: COLORS.muted, charSpacing: 1.1, margin: 0, valign: "top",
        lineSpacingMultiple: 1.05,
      });
      s.addText(C.usd(it.total), {
        x: x + pad, y: top + 0.72, w: iw, h: 0.5,
        fontFace: FONTS.head, fontSize: SIZE.stat, bold: true,
        color: COLORS.text, margin: 0, valign: "middle",
      });
      s.addText(`${((it.total / total) * 100).toFixed(1)}% of billed AI`, {
        x: x + pad, y: top + 1.22, w: iw, h: 0.26,
        fontFace: FONTS.body, fontSize: SIZE.statNote, bold: true,
        color: it.color, margin: 0, valign: "middle",
      });

      s.addShape(pres.ShapeType.rect, {
        x: x + pad, y: top + 1.6, w: iw, h: 0.01,
        fill: { color: COLORS.border },
        line: { color: COLORS.border, width: 0 },
      });

      // First and last month on one row each: the two numbers the growth badge
      // is derived from, so nobody has to take the percentage on trust.
      [[spec.firstLabel, it.first], [spec.lastLabel, it.last]].forEach(([lab, v], j) => {
        const ly = top + 1.74 + j * 0.42;
        s.addText(lab.toUpperCase(), {
          x: x + pad, y: ly, w: iw * 0.5, h: 0.3,
          fontFace: FONTS.head, fontSize: SIZE.statLabel, bold: true,
          color: COLORS.faint, charSpacing: 1, margin: 0, valign: "middle",
        });
        s.addText(v ? C.usd(v) : "-", {
          x: x + pad + iw * 0.5, y: ly, w: iw * 0.5, h: 0.3,
          fontFace: FONTS.head, fontSize: SIZE.body, bold: true,
          color: v ? COLORS.text : COLORS.faint, margin: 0,
          align: "right", valign: "middle",
        });
      });

      const badgeY = top + 2.68;
      s.addShape(pres.ShapeType.roundRect, {
        x: x + pad, y: badgeY, w: iw, h: 0.36,
        rectRadius: 0.1,
        fill: { color: COLORS.cardHi },
        line: { color: it.color, width: 1 },
      });
      s.addText(it.badge, {
        x: x + pad, y: badgeY, w: iw, h: 0.36,
        fontFace: FONTS.head, fontSize: SIZE.statNote, bold: true,
        color: it.color, margin: 0, align: "center", valign: "middle",
      });

      s.addText(it.desc, {
        x: x + pad, y: badgeY + 0.5, w: iw, h: h - (badgeY - top) - 0.66,
        fontFace: FONTS.body, fontSize: SIZE.cardSub, color: COLORS.muted,
        margin: 0, valign: "top", lineSpacingMultiple: 1.15,
      });
    });
  },

  /**
   * Two columns wired to each other with nothing in between, the "before"
   * picture for the gateway slide. The mesh is the argument: every consumer
   * reaches every provider directly, so no single point can see the spend.
   */
  mesh(pres, spec) {
    const s = C.slide(pres, {
      eyebrow: spec.eyebrow, accent: spec.accent,
      title: spec.title, note: spec.note, foot: spec.foot,
    });

    const colW = 3.0;
    const leftX = GEO.margin;
    const rightX = leftX + colW + 1.1;
    const panelX = rightX + colW + 0.4;
    const panelW = GEO.w - GEO.margin - panelX;
    const top = GEO.bodyTop + 0.5;

    // The two columns need not be the same length, and the longer one sets the
    // spacing for both. Both the card height and the gap between cards are
    // fitted to whatever height is left after the stat strip, so adding a
    // provider tightens the rows instead of pushing the strip off the bottom,
    // and dropping the strip lets the columns grow into the space rather than
    // leaving a band of nothing under them. The gap is capped at 0.3" so a
    // short list does not drift apart into unrelated cards.
    const rows = Math.max(spec.left.items.length, spec.right.items.length);
    const statsH = (spec.stats || []).length ? 1.43 : 0;
    const band = GEO.footY - 0.1 - statsH - top;
    const cardH = Math.min(0.74, band / rows - 0.08);
    const pitch = Math.min(cardH + 0.3, (band - cardH) / Math.max(1, rows - 1));

    const column = (x, heading, items, color) => {
      s.addText(heading.toUpperCase(), {
        x, y: top - 0.4, w: colW, h: 0.28,
        fontFace: FONTS.head, fontSize: SIZE.statLabel, bold: true,
        color: COLORS.muted, charSpacing: 1.4, margin: 0, valign: "middle",
      });
      items.forEach((it, i) => {
        const y = top + i * pitch;
        s.addShape(pres.ShapeType.roundRect, {
          x, y, w: colW, h: cardH,
          rectRadius: 0.06,
          fill: { color: COLORS.card },
          line: { color: COLORS.border, width: 1 },
        });
        s.addText(it, {
          x: x + 0.2, y, w: colW - 0.4, h: cardH,
          fontFace: FONTS.body, fontSize: SIZE.body, color: color || COLORS.text,
          margin: 0, valign: "middle",
        });
      });
    };

    // Wires first, so the cards sit on top of them.
    const x1 = leftX + colW;
    const wireW = rightX - x1;
    spec.left.items.forEach((_, i) => {
      spec.right.items.forEach((__, j) => {
        const y1 = top + i * pitch + cardH / 2;
        const y2 = top + j * pitch + cardH / 2;
        s.addShape(pres.ShapeType.line, {
          x: x1, y: Math.min(y1, y2), w: wireW, h: Math.abs(y2 - y1) || 0.004,
          flipV: y2 < y1,
          line: { color: spec.accent, width: 0.75, transparency: 58 },
        });
      });
    });

    column(leftX, spec.left.heading, spec.left.items);
    column(rightX, spec.right.heading, spec.right.items, COLORS.cyan);

    // The panel restates the mesh in words, for the reader who does not want
    // to count the wires. It is sized to finish level with the columns beside
    // it rather than to its own content, so the two blocks read as one band.
    const panelRows = spec.panel.items;
    const colBottom = top + (rows - 1) * pitch + cardH;
    const panelH = Math.max(0.62 + panelRows.length * 0.5, colBottom - GEO.bodyTop);
    const rowPitch = (panelH - 0.62) / panelRows.length;
    s.addShape(pres.ShapeType.roundRect, {
      x: panelX, y: GEO.bodyTop, w: panelW, h: panelH,
      rectRadius: 0.06,
      fill: { color: COLORS.card },
      line: { color: COLORS.border, width: 1 },
    });
    s.addShape(pres.ShapeType.rect, {
      x: panelX, y: GEO.bodyTop, w: panelW, h: 0.05,
      fill: { color: spec.accent },
      line: { color: spec.accent, width: 0 },
    });
    s.addText(spec.panel.title.toUpperCase(), {
      x: panelX + 0.24, y: GEO.bodyTop + 0.18, w: panelW - 0.48, h: 0.3,
      fontFace: FONTS.head, fontSize: SIZE.statLabel, bold: true,
      color: spec.accent, charSpacing: 1.4, margin: 0, valign: "middle",
    });
    panelRows.forEach((it, i) => {
      const y = GEO.bodyTop + 0.56 + i * rowPitch;
      if (i) {
        s.addShape(pres.ShapeType.rect, {
          x: panelX + 0.24, y, w: panelW - 0.48, h: 0.01,
          fill: { color: COLORS.border },
          line: { color: COLORS.border, width: 0 },
        });
      }
      s.addText(it, {
        x: panelX + 0.24, y: y + 0.04, w: panelW - 0.48, h: rowPitch - 0.06,
        fontFace: FONTS.body, fontSize: SIZE.body, color: COLORS.text,
        margin: 0, valign: "middle",
      });
    });

    const stats = resolveStats(spec.stats, null, {});
    if (stats.length) {
      const sw = (GEO.contentW - 0.25 * (stats.length - 1)) / stats.length;
      const sy = Math.max(colBottom + 0.25, GEO.bodyTop + panelH + 0.25);
      stats.forEach((st, i) => {
        C.statTile(pres, s, {
          ...st, x: GEO.margin + i * (sw + 0.25), y: sy, w: sw, h: 1.18,
        });
      });
    }
  },

  /**
   * One total, split two ways, then the lines that make it up.
   *
   * The bar across the top is the argument, its two segments are drawn to
   * scale, so the split is read before any figure is. The rows beneath are the
   * largest contributors on a single shared scale, each in the colour of the
   * band it belongs to, which is what shows the two kinds of spend interleaved
   * rather than neatly stacked.
   *
   * Deliberately sparse: a percentage per band, a figure per row, nothing else.
   * The full meter table belongs in the appendix, not in front of a CIO.
   */
  splitBars(pres, spec) {
    const s = C.slide(pres, {
      eyebrow: spec.eyebrow, accent: spec.accent,
      title: spec.title, note: spec.note, foot: spec.foot,
    });

    const total = C.sum(spec.bands.map((b) => b.value));
    const gap = 0.06;
    const barY = GEO.bodyTop + 0.05;
    const barH = 0.86;

    let x = GEO.margin;
    spec.bands.forEach((b, i) => {
      const w = (GEO.contentW - gap * (spec.bands.length - 1)) * (b.value / total);
      s.addShape(pres.ShapeType.roundRect, {
        x, y: barY, w, h: barH,
        rectRadius: 0.05,
        fill: { color: b.color },
        line: { color: b.color, width: 0 },
      });
      // Set on the band itself. The bar is dark enough for the deck's near-white
      // to sit on it, and putting the figure inside means the segment width and
      // the number it stands for cannot be read apart.
      s.addText(`${((b.value / total) * 100).toFixed(1)}%`, {
        x: x + 0.24, y: barY + 0.08, w: w - 0.48, h: 0.46,
        fontFace: FONTS.head, fontSize: 30, bold: true,
        color: COLORS.bg, margin: 0, valign: "middle",
      });
      s.addText(b.label.toUpperCase(), {
        x: x + 0.24, y: barY + 0.52, w: w - 0.48, h: 0.26,
        fontFace: FONTS.head, fontSize: SIZE.statLabel, bold: true,
        color: COLORS.bg, charSpacing: 1.2, margin: 0, valign: "middle",
      });
      s.addText(`${C.usd(b.value)}, ${b.note}`, {
        x: x + 0.24, y: barY + barH + 0.1, w: w - 0.24, h: 0.28,
        fontFace: FONTS.body, fontSize: SIZE.caption, color: COLORS.muted,
        margin: 0, valign: "middle",
      });
      x += w + gap;
    });

    // The rows, on a panel of their own so the bars read as one block rather
    // than as loose marks floating on the canvas.
    const headY = barY + barH + 0.55;
    chartHeading(s, spec.rowsTitle, GEO.margin, headY, GEO.contentW);

    const labelW = 3.1;
    const valueW = 1.15;
    const trackX = GEO.margin + labelW + 0.2;
    const trackW = GEO.w - GEO.margin - valueW - 0.15 - trackX;
    const max = Math.max(...spec.items.map((it) => it.value));
    const top = headY + 0.42;
    const pitch = 0.42;

    spec.items.forEach((it, i) => {
      const y = top + i * pitch;
      s.addText(it.name, {
        x: GEO.margin, y, w: labelW, h: 0.32,
        fontFace: FONTS.body, fontSize: SIZE.body, color: COLORS.text,
        margin: 0, valign: "middle",
      });
      // A faint track behind every bar, so a short line still reads as a share
      // of the same whole rather than as a stub floating in space.
      s.addShape(pres.ShapeType.roundRect, {
        x: trackX, y: y + 0.08, w: trackW, h: 0.16,
        rectRadius: 0.08,
        fill: { color: COLORS.cardAlt },
        line: { color: COLORS.border, width: 0.5 },
      });
      s.addShape(pres.ShapeType.roundRect, {
        x: trackX, y: y + 0.08, w: Math.max(0.16, trackW * (it.value / max)), h: 0.16,
        rectRadius: 0.08,
        fill: { color: it.color },
        line: { color: it.color, width: 0 },
      });
      s.addText(C.usd(it.value), {
        x: GEO.w - GEO.margin - valueW, y, w: valueW, h: 0.32,
        fontFace: FONTS.head, fontSize: SIZE.table, bold: true,
        color: COLORS.text, margin: 0, align: "right", valign: "middle",
      });
    });

    if (spec.callout) {
      const y = top + spec.items.length * pitch + 0.2;
      C.card(pres, s, { x: GEO.margin, y, w: GEO.contentW, h: 0.85, accent: spec.accent });
      s.addText(spec.callout.title, {
        x: GEO.margin + 0.25, y: y + 0.12, w: GEO.contentW - 0.5, h: 0.32,
        fontFace: FONTS.head, fontSize: 16, bold: true,
        color: COLORS.text, margin: 0, valign: "middle",
      });
      s.addText(spec.callout.text, {
        x: GEO.margin + 0.25, y: y + 0.42, w: GEO.contentW - 0.5, h: 0.36,
        fontFace: FONTS.body, fontSize: SIZE.body, color: COLORS.muted,
        margin: 0, valign: "middle",
      });
    }
  },

  /**
   * One thick horizontal bar per item, name and growth above it, split into two
   * coloured segments to scale, total printed at the end.
   *
   * Built for a short list, a handful of projects, not a meter table, so each
   * row gets real height. That is the whole design brief: the previous version
   * of this slide was a seven-month stacked column with four series and every
   * label under 8pt; this trades the month-by-month detail (which lives on the
   * slide it came from) for one comparison read at a glance, how big is each
   * item, and what is it made of.
   */
  projectBars(pres, spec) {
    const s = C.slide(pres, {
      eyebrow: spec.eyebrow, accent: spec.accent,
      title: spec.title, note: spec.note, foot: spec.foot,
    });

    let top = GEO.bodyTop;
    const stats = resolveStats(spec.stats, null, {});
    if (stats.length) {
      const sw = (GEO.contentW - 0.25 * (stats.length - 1)) / stats.length;
      stats.forEach((st, i) => {
        C.statTile(pres, s, {
          ...st, x: GEO.margin + i * (sw + 0.25), y: top, w: sw, h: 1.05,
        });
      });
      top += 1.28;
    }

    if (spec.rowsTitle) {
      chartHeading(s, spec.rowsTitle, GEO.margin, top, GEO.contentW);
      if (spec.legend) {
        let lx = GEO.w - GEO.margin;
        [...spec.legend].reverse().forEach((it) => {
          const tw = it.label.length * 0.072 + 0.05;
          lx -= tw;
          s.addText(it.label, {
            x: lx, y: top, w: tw, h: 0.26,
            fontFace: FONTS.body, fontSize: SIZE.caption, color: COLORS.muted,
            margin: 0, align: "right", valign: "middle",
          });
          lx -= 0.22;
          s.addShape(pres.ShapeType.rect, {
            x: lx, y: top + 0.06, w: 0.14, h: 0.14,
            fill: { color: it.color }, line: { color: it.color, width: 0 },
          });
          lx -= 0.18;
        });
      }
      top += 0.4;
    }

    const items = spec.items;
    const max = Math.max(...items.map((it) => it.total), 1);
    // The total sits in its own column to the right of the bar track, not
    // chasing the end of the bar, the largest item's bar fills the whole
    // track, and a label placed past its end would run off the slide.
    const totalW = 1.35, totalGap = 0.15;
    const barMaxW = GEO.contentW - totalW - totalGap;

    // Row height is derived from the space actually available, not fixed, so
    // four items on their own slide get large, deliberate bars while a longer
    // list still fits without spilling into the footnote. Everything below the
    // name is squeezed proportionally out of what is left.
    const nameH = 0.3, gapToBar = 0.08, gapToCaption = 0.05, captionH = 0.22;
    const pitch = Math.min(1.55, (GEO.footY - 0.12 - top) / items.length);
    const barH = Math.max(
      0.32,
      Math.min(0.85, pitch - nameH - gapToBar - gapToCaption - captionH)
    );

    items.forEach((it, i) => {
      const y = top + i * pitch;

      s.addText(it.name, {
        x: GEO.margin, y, w: GEO.contentW - 2.6, h: nameH,
        fontFace: FONTS.head, fontSize: 16, bold: true,
        color: COLORS.text, margin: 0, valign: "middle",
      });
      if (it.badge) {
        s.addText(it.badge, {
          x: GEO.w - GEO.margin - 2.4, y, w: 2.4, h: nameH,
          fontFace: FONTS.body, fontSize: SIZE.caption, bold: true,
          color: COLORS.muted, margin: 0, align: "right", valign: "middle",
        });
      }

      const barY = y + nameH + gapToBar;
      // A faint track at full width first, so a small project still reads as a
      // share of the same scale rather than as an isolated stub.
      s.addShape(pres.ShapeType.rect, {
        x: GEO.margin, y: barY, w: barMaxW, h: barH,
        fill: { color: COLORS.cardAlt },
        line: { color: COLORS.border, width: 0.75 },
      });

      const barW = Math.max(0.02, barMaxW * (it.total / max));
      const infraW = it.total ? barW * (it.infra / it.total) : 0;
      const aiW = barW - infraW;
      if (infraW > 0.015) {
        s.addShape(pres.ShapeType.rect, {
          x: GEO.margin, y: barY, w: infraW, h: barH,
          fill: { color: COLORS.azure },
          line: { color: COLORS.azure, width: 0 },
        });
      }
      if (aiW > 0.015) {
        s.addShape(pres.ShapeType.rect, {
          x: GEO.margin + infraW, y: barY, w: aiW, h: barH,
          fill: { color: COLORS.ai },
          line: { color: COLORS.ai, width: 0 },
        });
      }

      s.addText(C.usd(it.total), {
        x: GEO.margin + barMaxW + totalGap, y: barY, w: totalW, h: barH,
        fontFace: FONTS.head, fontSize: 18, bold: true,
        color: COLORS.text, margin: 0, valign: "middle",
      });

      const share = it.total ? Math.round((it.infra / it.total) * 100) : 0;
      s.addText(
        it.total === 0
          ? "no spend"
          : it.infra === 0
          ? "entirely AI, no infrastructure"
          : it.infra === it.total
          ? "entirely infrastructure"
          : `${share}% infrastructure, ${100 - share}% AI`,
        {
          x: GEO.margin, y: barY + barH + gapToCaption, w: barMaxW, h: captionH,
          fontFace: FONTS.body, fontSize: SIZE.caption, color: COLORS.muted,
          margin: 0, valign: "middle",
        }
      );
    });
  },
};

/**
 * Draws one table block; returns the y coordinate just below it.
 *
 * The returned height accounts for cells that wrap. PowerPoint grows a row to
 * fit its content, so assuming every row is exactly `rowH` tall understates a
 * table with long labels, and whatever is placed underneath then lands on top
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
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5, must be set before any slide
  pres.author = meta.author || "Cloud Infrastructure, DevOps & Databases";
  pres.company = meta.company || "Harel Insurance";
  pres.title = meta.title || "Cloud FinOps - Harel, 2026";

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
    console.log(`Wrote ${outFile}, ${content.length} slides`);
  });
}

module.exports = { buildDeck, RENDER, resolveAuto, resolveStats, chartOf, drawChart, chartHeading, drawTable };
