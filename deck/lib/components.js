/**
 * Slide building blocks.
 *
 * Every slide in this deck is assembled from these few primitives, which is
 * what keeps 40 slides looking like one deck. If you want to restyle the whole
 * presentation, change `theme.js`; if you want to change how a *kind* of slide
 * is laid out, change the function here.
 */

const { COLORS, SERIES, FONTS, SIZE, GEO } = require("./theme");

/* ------------------------------------------------------------------ *
 * Formatting
 * ------------------------------------------------------------------ */

const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");

/** $1.54M / $584K / $4,440 — the compact form used in the stat tiles. */
function money(n) {
  const a = Math.abs(n);
  if (a >= 1e6) return "$" + (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (a >= 1e4) return "$" + Math.round(n / 1e3) + "K";
  return usd(n);
}

const pct = (n, digits = 1) =>
  (n >= 0 ? "+" : "") + n.toFixed(digits) + "%";

/* ------------------------------------------------------------------ *
 * Data shaping
 * ------------------------------------------------------------------ */

const sum = (a) => a.reduce((t, v) => t + (v || 0), 0);

/**
 * Collapse a wide series list down to the `n` largest, rolling the tail into a
 * single "Other" series. Source workbooks routinely carry 30+ services per
 * chart; nobody can read a 30-colour stack.
 */
function topSeries(series, n = 7, otherLabel = "All other") {
  const ranked = [...series].sort((a, b) => sum(b.vals) - sum(a.vals));
  const head = ranked.slice(0, n);
  const tail = ranked.slice(n);
  if (!tail.length) return head;
  const len = head[0].vals.length;
  const other = {
    name: otherLabel,
    vals: Array.from({ length: len }, (_, i) => sum(tail.map((s) => s.vals[i] || 0))),
  };
  return [...head, other];
}

/** Month-over-month totals across every series. */
const totalsByPeriod = (series) =>
  series[0].vals.map((_, i) => sum(series.map((s) => s.vals[i] || 0)));

/** Percent change first period → last period, guarding divide-by-zero. */
function change(vals) {
  const first = vals.find((v) => v > 0);
  const last = vals[vals.length - 1];
  if (!first) return null;
  return ((last - first) / first) * 100;
}

/** Human phrasing for a percent change: "flat" reads better than "-0%". */
function changeLabel(ch, from, to) {
  if (ch === null) return "";
  if (Math.abs(ch) < 1) return `flat ${from}→${to}`;
  return `${pct(ch, 0)} ${from}→${to}`;
}

/* ------------------------------------------------------------------ *
 * Slide chrome
 * ------------------------------------------------------------------ */

/**
 * Paint the dark canvas.
 *
 * The slide-level background property alone is not enough: PowerPoint drops it
 * when a slide is copied into another deck, leaving near-white text on the
 * destination theme's white background. A full-bleed rectangle underneath
 * everything travels with the slide, so it survives copy-paste.
 */
function paintBackground(pres, s) {
  s.background = { color: COLORS.bg };
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: GEO.w, h: GEO.h,
    fill: { color: COLORS.bg },
    line: { color: COLORS.bg, width: 0 },
  });
}

/**
 * The standard content slide: coloured dot + uppercase eyebrow, big title on
 * the left, an optional right-aligned note, and an optional footnote.
 */
function slide(pres, opts = {}) {
  const s = pres.addSlide();
  paintBackground(pres, s);
  const accent = opts.accent || COLORS.cyan;

  if (opts.eyebrow) {
    s.addShape(pres.ShapeType.ellipse, {
      x: GEO.margin,
      y: GEO.eyebrowY + 0.035,
      w: 0.12,
      h: 0.12,
      fill: { color: accent },
      line: { color: accent, width: 0 },
    });
    s.addText(opts.eyebrow.toUpperCase(), {
      x: GEO.margin + 0.2,
      y: GEO.eyebrowY,
      w: 8,
      h: 0.26,
      fontFace: FONTS.head,
      fontSize: SIZE.eyebrow,
      bold: true,
      color: accent,
      charSpacing: 2,
      margin: 0,
      valign: "middle",
    });
  }

  if (opts.title) {
    // Keep the headline on one line: a wrapped title overruns into the body,
    // which starts at a fixed height on every slide.
    const tw = opts.note ? 8.4 : GEO.contentW;
    const base = opts.titleSize || SIZE.title;
    const tSize = Math.max(18, Math.min(base, (tw * 100) / String(opts.title).length));
    s.addText(opts.title, {
      x: GEO.margin,
      y: GEO.titleY,
      w: tw,
      h: 0.62,
      fontFace: FONTS.head,
      fontSize: tSize,
      bold: true,
      color: COLORS.text,
      margin: 0,
      valign: "middle",
    });
  }

  if (opts.note) {
    s.addText(opts.note, {
      x: 9.1,
      y: GEO.titleY - 0.06,
      w: GEO.w - 9.1 - GEO.margin,
      h: 0.72,
      fontFace: FONTS.body,
      fontSize: SIZE.caption,
      color: COLORS.muted,
      align: "right",
      margin: 0,
      valign: "top",
      lineSpacingMultiple: 1.15,
      rtlMode: !!opts.noteRtl,
    });
  }

  if (opts.foot) {
    // Lift the footnote when it runs to more than two lines, so a long one
    // grows upward into the empty band instead of off the bottom edge.
    const footLines = Math.max(
      1,
      Math.ceil(String(opts.foot).length / (GEO.contentW * 11.4))
    );
    const footH = footLines * 0.19 + 0.06;
    s.addText(opts.foot, {
      x: GEO.margin,
      y: Math.min(GEO.footY, GEO.h - 0.12 - footH),
      w: GEO.contentW,
      h: footH,
      fontFace: FONTS.body,
      fontSize: SIZE.footnote,
      color: COLORS.faint,
      margin: 0,
      valign: "top",
      lineSpacingMultiple: 1.15,
    });
  }

  return s;
}

/** Full-bleed divider that opens each part of the deck. */
function sectionSlide(pres, { kicker, title, sub, accent = COLORS.aws }) {
  const s = pres.addSlide();
  paintBackground(pres, s);

  // Two soft overlapping discs, bled off the right edge — the motif carried
  // from the CIO deck's cover.
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

  s.addText(kicker.toUpperCase(), {
    x: GEO.margin, y: 2.55, w: 9, h: 0.3,
    fontFace: FONTS.head, fontSize: SIZE.eyebrow, bold: true,
    color: accent, charSpacing: 3, margin: 0,
  });
  s.addText(title, {
    x: GEO.margin, y: 2.9, w: 9.2, h: 1.1,
    fontFace: FONTS.head, fontSize: 40, bold: true,
    color: COLORS.text, margin: 0, valign: "middle",
  });
  if (sub) {
    s.addText(sub, {
      x: GEO.margin, y: 4.05, w: 8.6, h: 0.5,
      fontFace: FONTS.body, fontSize: 15, color: COLORS.muted, margin: 0,
    });
  }
  return s;
}

/* ------------------------------------------------------------------ *
 * Panels
 * ------------------------------------------------------------------ */

/** Rounded panel. Returns the inner content box so callers can fill it. */
function card(pres, s, { x, y, w, h, title, sub, accent }) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.06,
    fill: { color: COLORS.card },
    line: { color: accent || COLORS.border, width: 1 },
  });
  let top = y + 0.16;
  if (title) {
    s.addText(title, {
      x: x + 0.22, y: top, w: w - 0.44, h: 0.28,
      fontFace: FONTS.head, fontSize: SIZE.cardTitle, bold: true,
      color: COLORS.text, margin: 0, valign: "middle",
    });
    top += 0.3;
  }
  if (sub) {
    s.addText(sub, {
      x: x + 0.22, y: top, w: w - 0.44, h: 0.24,
      fontFace: FONTS.body, fontSize: SIZE.cardSub, color: COLORS.muted,
      margin: 0, valign: "middle",
    });
    top += 0.26;
  }
  return { x: x + 0.22, y: top + 0.04, w: w - 0.44, h: y + h - top - 0.2 };
}

/**
 * Label / big number / coloured note, on the card background. The workhorse of
 * the deck — every "TOTAL COST $584K" annotation from the source becomes one.
 */
function statTile(pres, s, { x, y, w, h = 1.18, label, value, note, accent = COLORS.cyan, boxed = true, valueSize = SIZE.stat }) {
  if (boxed) {
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w, h,
      rectRadius: 0.06,
      fill: { color: COLORS.card },
      line: { color: COLORS.border, width: 1 },
    });
  }
  const px = boxed ? x + 0.22 : x;
  const pw = w - (boxed ? 0.44 : 0);
  // The label must stay on one line — if it wraps it pushes into the value.
  const lab = String(label).toUpperCase();
  const labSize = Math.max(9.5, Math.min(SIZE.statLabel, (pw * 112) / Math.max(1, lab.length)));
  s.addText(lab, {
    x: px, y: y + 0.10, w: pw, h: 0.26,
    fontFace: FONTS.head, fontSize: labSize, bold: true,
    color: COLORS.muted, charSpacing: 1.2, margin: 0, valign: "middle",
  });
  // Values are not always short figures — "Direct Connect - Port Hours" also
  // lands here — so step the size down as the string gets longer. Bold Calibri
  // averages ~0.52em per character, i.e. pw*72/(0.52*chars) points to fit one
  // line; 130 is that constant with a little slack.
  const chars = String(value).length;
  const size = Math.max(13, Math.min(valueSize, (pw * 118) / chars));
  s.addText(value, {
    x: px, y: y + 0.32, w: pw, h: 0.48,
    fontFace: FONTS.head, fontSize: size, bold: true,
    color: COLORS.text, margin: 0, valign: "middle",
  });
  if (note) {
    s.addText(note, {
      x: px, y: y + 0.76, w: pw, h: 0.36,
      fontFace: FONTS.body, fontSize: SIZE.statNote, bold: true,
      color: accent, margin: 0, valign: "top", lineSpacingMultiple: 1.05,
    });
  }
}

/** A short bullet of narrative — the "Increase in X" callouts from the source. */
function noteList(pres, s, { x, y, w, items, accent = COLORS.aws, title }) {
  let cy = y;
  if (title) {
    s.addText(title.toUpperCase(), {
      x, y: cy, w, h: 0.24,
      fontFace: FONTS.head, fontSize: SIZE.statLabel, bold: true,
      color: COLORS.muted, charSpacing: 1.2, margin: 0, valign: "middle",
    });
    cy += 0.32;
  }
  // Advance by how many lines the text will actually take. Calibri at 10.5pt
  // fits roughly 13 characters per inch, so the wrap point scales with width
  // rather than being a fixed character count.
  const perLine = Math.max(18, Math.floor((w - 0.19) * 11));
  items.forEach((it) => {
    const lines = Math.max(1, Math.ceil(it.length / perLine));
    s.addShape(pres.ShapeType.rect, {
      x, y: cy + 0.09, w: 0.07, h: 0.07,
      fill: { color: accent }, line: { color: accent, width: 0 },
    });
    s.addText(it, {
      x: x + 0.19, y: cy, w: w - 0.19, h: lines * 0.2,
      fontFace: FONTS.body, fontSize: SIZE.body - 0.5, color: COLORS.text,
      margin: 0, valign: "top", lineSpacingMultiple: 1.1,
    });
    cy += lines * 0.24 + 0.14;
  });
  return cy;
}

/* ------------------------------------------------------------------ *
 * Tables
 * ------------------------------------------------------------------ */

/**
 * Dark table with a muted header row and zebra striping.
 * `cols`: [{ label, w, align, color }]  ·  `rows`: array of cell arrays.
 * A cell may be a string or { text, color, bold }.
 */
function table(pres, s, { x, y, w, cols, rows, fontSize = SIZE.table, rowH = 0.32 }) {
  const head = cols.map((c) => ({
    text: c.label,
    options: {
      bold: true,
      color: COLORS.muted,
      fill: { color: COLORS.cardAlt },
      align: c.align || "left",
      fontSize: SIZE.tableHead,
      charSpacing: 0.8,
    },
  }));

  const body = rows.map((r, i) =>
    r.map((cell, j) => {
      const c = typeof cell === "object" && cell !== null ? cell : { text: cell };
      return {
        text: String(c.text ?? ""),
        options: {
          color: c.color || COLORS.text,
          bold: c.bold ?? j === 0,
          align: cols[j].align || "left",
          fill: { color: i % 2 ? COLORS.cardAlt : COLORS.card },
          fontSize,
        },
      };
    })
  );

  s.addTable([head, ...body], {
    x, y, w,
    colW: cols.map((c) => c.w),
    rowH,
    border: { type: "solid", color: COLORS.border, pt: 0.5 },
    fontFace: FONTS.body,
    margin: [2, 6, 2, 6],
    valign: "middle",
    autoPage: false,
  });
}

/* ------------------------------------------------------------------ *
 * Charts
 * ------------------------------------------------------------------ */

const axisStyle = {
  catAxisLabelColor: COLORS.muted,
  catAxisLabelFontSize: 12,
  catAxisLabelFontFace: FONTS.body,
  catAxisLineShow: false,
  valAxisLabelColor: COLORS.muted,
  valAxisLabelFontSize: 12,
  valAxisLabelFontFace: FONTS.body,
  valAxisLineShow: false,
  valGridLine: { color: COLORS.border, size: 0.5 },
  catGridLine: { style: "none" },
  chartColors: SERIES,
  varyColors: false, // otherwise a single-series chart gets a colour per bar
  showTitle: false,
  plotArea: { fill: { color: COLORS.bg } },
  chartArea: { fill: { color: COLORS.bg } },
};

const legendStyle = {
  showLegend: true,
  legendPos: "b",
  legendColor: COLORS.muted,
  legendFontSize: 11,
  legendFontFace: FONTS.body,
};

/** Stacked columns over months — the default shape for "spend by X, by month". */
function stackedChart(pres, s, { x, y, w, h, series, cats, legend = true, valFmt = '"$"#,##0' }) {
  // With a single series pptxgenjs hands each *point* the next palette colour,
  // which reads as three unrelated bars. Pin it to one colour instead.
  const colors = series.length === 1 ? [SERIES[0]] : SERIES;
  s.addChart(
    pres.ChartType.bar,
    series.map((ser) => ({ name: ser.name, labels: cats, values: ser.vals })),
    {
      x, y, w, h,
      barDir: "col",
      barGrouping: "stacked",
      barGapWidthPct: 55,
      valAxisLabelFormatCode: valFmt,
      ...axisStyle,
      chartColors: colors,
      ...(legend ? legendStyle : { showLegend: false }),
    }
  );
}

/** Single-series columns with the value printed above each bar. */
function columnChart(pres, s, { x, y, w, h, name, cats, vals, color = COLORS.azure, valFmt = '"$"#,##0' }) {
  s.addChart(
    pres.ChartType.bar,
    [{ name, labels: cats, values: vals }],
    {
      x, y, w, h,
      barDir: "col",
      barGapWidthPct: 60,
      chartColors: [color],
      showValue: true,
      dataLabelPosition: "outEnd",
      dataLabelColor: COLORS.text,
      dataLabelFontSize: 11,
      dataLabelFontFace: FONTS.body,
      dataLabelFormatCode: valFmt,
      valAxisLabelFormatCode: valFmt,
      ...axisStyle,
      showLegend: false,
    }
  );
}

/** Trend line, used where the story is the slope rather than the mix. */
function lineChart(pres, s, { x, y, w, h, series, cats, legend = true, colors, valFmt = '"$"#,##0' }) {
  s.addChart(
    pres.ChartType.line,
    series.map((ser) => ({ name: ser.name, labels: cats, values: ser.vals })),
    {
      x, y, w, h,
      lineDataSymbol: "circle",
      lineDataSymbolSize: 6,
      lineSize: 2.5,
      valAxisLabelFormatCode: valFmt,
      ...axisStyle,
      chartColors: colors || SERIES,
      ...(legend ? legendStyle : { showLegend: false }),
    }
  );
}

/** Horizontal ranking bars — for "which service costs most" cuts. */
function rankChart(pres, s, { x, y, w, h, cats, vals, color = COLORS.azure, valFmt = '"$"#,##0' }) {
  s.addChart(
    pres.ChartType.bar,
    [{ name: "Total", labels: cats, values: vals }],
    {
      x, y, w, h,
      barDir: "bar",
      barGapWidthPct: 45,
      chartColors: [color],
      showValue: true,
      dataLabelPosition: "outEnd",
      dataLabelColor: COLORS.text,
      dataLabelFontSize: 11,
      dataLabelFontFace: FONTS.body,
      dataLabelFormatCode: valFmt,
      valAxisLabelFormatCode: valFmt,
      ...axisStyle,
      showLegend: false,
    }
  );
}

module.exports = {
  usd, money, pct, sum, topSeries, totalsByPeriod, change, changeLabel,
  paintBackground, slide, sectionSlide, card, statTile, noteList, table,
  stackedChart, columnChart, lineChart, rankChart,
};
