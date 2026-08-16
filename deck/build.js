#!/usr/bin/env node
/**
 * Builds Cloud_FinOps_Harel_2026.pptx from `content.js` + `data/charts.json`.
 *
 *   node build.js [outfile.pptx]
 *
 * The renderers below turn each entry in `content.js` into a slide. They are
 * deliberately small: if a slide needs a shape none of them draws, add a new
 * `kind` here rather than special-casing an existing one.
 */

const path = require("path");
const PptxGenJS = require("pptxgenjs");

const { COLORS, FONTS, SIZE, GEO } = require("./lib/theme");
const C = require("./lib/components");
const content = require("./content");
const DATA = require("./data/charts.json");

const OUT = process.argv[2] || path.join(__dirname, "Cloud_FinOps_Harel_2026.pptx");

/* ------------------------------------------------------------------ *
 * Chart data access
 * ------------------------------------------------------------------ */

function chartOf(id, spec = {}) {
  const raw = DATA[id];
  if (!raw) throw new Error(`Unknown chart id: ${id}`);
  let series = raw.series;
  if (spec.drop) series = series.filter((s) => !spec.drop.includes(s.name));
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
  const series = C.topSeries(c.series, spec.top || 7);

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
    C.lineChart(pres, s, { ...box, cats: c.cats, series });
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

  closing(pres, spec) {
    const s = C.sectionSlide(pres, { ...spec, title: spec.title, sub: spec.sub });
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
        fontFace: FONTS.head, fontSize: 18, bold: true,
        color: it.accent, margin: 0, valign: "middle",
      });
      s.addText(it.label, {
        x: inner.x, y: y + 0.56, w: inner.w, h: 0.3,
        fontFace: FONTS.head, fontSize: 13, bold: true,
        color: COLORS.text, margin: 0, valign: "middle",
      });
      s.addText(it.desc, {
        x: inner.x, y: y + 0.88, w: inner.w, h: 0.55,
        fontFace: FONTS.body, fontSize: 9.5, color: COLORS.muted,
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
      C.statTile(pres, s, { ...st, x: railX, y, w: railW, h: 1.1 });
      y += 1.25;
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
        ...st, x: GEO.margin + i * (sw + 0.25), y: GEO.bodyTop - 0.05, w: sw, h: 1.05,
      });
    });

    const top = GEO.bodyTop + 1.2;
    const cw = (GEO.contentW - 0.35) / 2;
    spec.charts.forEach((ch, i) => {
      const x = GEO.margin + i * (cw + 0.35);
      chartHeading(s, ch.title, x, top, cw);
      drawChart(pres, s, ch, { x: x - 0.05, y: top + 0.3, w: cw, h: 3.75 });
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
        const sy = Math.min(Math.max(deepest + 0.5, 4.2), 5.7);
        stats.forEach((st, i) => {
          C.statTile(pres, s, {
            ...st, x: GEO.margin + i * (sw + 0.25), y: sy, w: sw, h: 1.05,
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
          ...st, x: railX, y: sy, w: railW, h: 1.1,
          valueSize: st.big ? 30 : SIZE.stat,
        });
        sy += 1.25;
      });
    } else {
      // Full-width table: the rail has nowhere to go, so run the stats under it.
      const sw = (GEO.contentW - 0.25 * (stats.length - 1)) / stats.length;
      const sy = Math.min(Math.max(y + 0.25, 4.2), 5.7);
      stats.forEach((st, i) => {
        C.statTile(pres, s, {
          ...st, x: GEO.margin + i * (sw + 0.25), y: sy, w: sw, h: 1.05,
        });
      });
    }
  },
};

/** Draws one table block; returns the y coordinate just below it. */
function drawTable(pres, s, t, x, y) {
  const rowH = t.rowH || 0.235;
  C.table(pres, s, {
    x, y,
    w: C.sum(t.cols.map((c) => c.w)),
    cols: t.cols,
    rows: t.rtl ? t.rows.map(rtlRow) : t.rows,
    rowH,
    fontSize: t.fontSize || SIZE.table,
  });
  return y + rowH * (t.rows.length + 1);
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

function build() {
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 — must be set before any slide
  pres.author = "Cloud Infrastructure, DevOps & Databases";
  pres.company = "Harel Insurance";
  pres.title = "Cloud FinOps — Harel, 2026";

  content.forEach((spec, i) => {
    const fn = RENDER[spec.kind];
    if (!fn) throw new Error(`Slide ${i + 1}: unknown kind "${spec.kind}"`);
    fn(pres, spec);
  });

  return pres.writeFile({ fileName: OUT }).then(() => {
    console.log(`Wrote ${OUT} — ${content.length} slides`);
  });
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
