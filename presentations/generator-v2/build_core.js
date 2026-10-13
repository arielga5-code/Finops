// ---------------------------------------------------------------------------
// Harel Cloud FinOps FY2026 — executive deck
// Shared theme, layout and component library
// ---------------------------------------------------------------------------
const pptxgen = require('pptxgenjs');
const fs = require('fs');

const SC = __dirname + '/';
const DATA = JSON.parse(fs.readFileSync(SC + 'deck_data.json', 'utf8'));
const A = SC + 'assets/';

const THEME = {
  name: 'Harel Cloud FinOps',
  headFontFace: 'Cambria',
  bodyFontFace: 'Arial',
  colors: {
    dk1: '0B1B2E', lt1: 'FFFFFF',
    dk2: '5B6B7E', lt2: 'EEF2F7',
    accent1: '00A878', accent2: '0F7DC2', accent3: 'F2A900',
    accent4: '7C5CFF', accent5: 'D7263D', accent6: '13324F',
    hlink: '0F7DC2', folHlink: '7C5CFF'
  }
};

// hex mirror of the theme, for options that accept hex only
const P = {
  navy: '0B1B2E', steel: '13324F', slate: '27496B', muted: '5B6B7E',
  surface: 'EEF2F7', white: 'FFFFFF', line: 'D6DEE8',
  green: '00A878', blue: '0F7DC2', gold: 'F2A900',
  violet: '7C5CFF', red: 'D7263D', grey: 'C3CDD9',
  dimText: '93A3B5'
};
const SERIES = [P.blue, P.green, P.gold, P.violet, P.slate, P.grey];

// geometry
const SW = 13.333, SH = 7.5, M = 0.62;
const CW = SW - 2 * M;          // 12.093 content width
const TOP = 1.72;               // top of content area
const BOT = 6.58;               // bottom of content area
const CH = BOT - TOP;           // 5.06 content height

// Shared slide geometry. Every slide of a given type takes its frame from here
// so positions cannot drift between sections.
const G = {
  // chart on the left, rail of supporting detail on the right
  chart:     { x: M - 0.12, y: TOP - 0.06, w: 7.90, h: 4.50 },
  rail:      { x: 8.72,     y: TOP - 0.06, w: 3.99, h: 4.50 },
  railHeadY: TOP + 0.16,
  railListY: TOP + 0.58,
  railRowH:  0.42,
  railRows:  8,            // more than this overflows the rail
  railChipY: TOP + 4.06,
  // three headline tiles across the top, chart and panel beneath
  tileY:     TOP,
  tileH:     1.62,
  tileGap:   0.25,
  subHeadY:  TOP + 1.90,
  lowChart:  { x: M - 0.12, y: TOP + 2.24, w: 7.50, h: 2.50 },
  lowPanel:  { x: 8.42,     y: TOP + 1.90, w: 4.29, h: 2.84 },
  // stacked stat tiles beside a full-height chart
  statRail:  { x: 8.72, w: 3.99, h: 1.44, pitch: 1.60 },
  // two side-by-side halves
  halfW:     (CW - 0.30) / 2
};
const tileW = n => (CW - (n - 1) * G.tileGap) / n;
const tileX = (i, n) => M + i * (tileW(n) + G.tileGap);

// ---------------------------------------------------------------------------
// formatting
// ---------------------------------------------------------------------------
const money = n => {
  const a = Math.abs(n);
  if (a >= 1e6) return '$' + (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M';
  if (a >= 1e3) return '$' + Math.round(n / 1e3) + 'K';
  return '$' + Math.round(n);
};
const money1 = n => '$' + (n / 1e6).toFixed(2) + 'M';
const k = n => '$' + Math.round(n / 1e3) + 'K';
const pct = n => (n >= 0 ? '+' : '') + Math.round(n) + '%';
const sum = a => a.reduce((x, y) => x + (y || 0), 0);

/** top-n series of a {name:[monthly]} map, remainder folded into `otherLabel` */
function topN(rows, n, otherLabel = 'All other') {
  const e = Object.entries(rows).filter(([nm]) => nm)
    .sort((a, b) => sum(b[1]) - sum(a[1]));
  const head = e.slice(0, n);
  const tail = e.slice(n);
  if (tail.length) {
    const len = head.length ? head[0][1].length : 0;
    const agg = Array.from({ length: len }, (_, i) => sum(tail.map(t => t[1][i] || 0)));
    head.push([otherLabel, agg]);
  }
  return head;
}

// ---------------------------------------------------------------------------
// presentation + layouts
// ---------------------------------------------------------------------------
function newDeck() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.author = 'Cloud Infrastructure, DevOps & Databases';
  pres.company = 'Harel Insurance &amp; Finance';
  pres.subject = 'Cloud FinOps FY2026 cost summary';
  pres.title = 'Cloud FinOps FY2026';

  const footText = 'Cloud FinOps  ·  FY2026 year to date, January to September 2026';

  // ---- light content layout ------------------------------------------------
  pres.defineSlideMaster({
    title: 'CONTENT',
    background: { color: 'FFFFFF' },
    objects: [
      { text: { text: footText, options: {
          x: 1.74, y: 7.04, w: 7.4, h: 0.3, fontSize: 9, color: P.dimText,
          align: 'left', valign: 'middle', margin: 0, isTextBox: true } } },
      { image: { x: M, y: 7.0, w: 0.94, h: 0.406, path: A + 'harel_dark.png',
                 altText: 'Harel Insurance and Finance logo' } },
      { text: { text: '', options: {
          x: 11.6, y: 7.04, w: 1.11, h: 0.3, fontSize: 10, color: P.muted,
          align: 'right', valign: 'middle', margin: 0, isTextBox: true } } }
    ],
    slideNumber: { x: 12.3, y: 7.04, w: 0.42, h: 0.3, fontSize: 10,
                   color: P.muted, align: 'right', valign: 'middle', fontFace: 'Arial' }
  });

  // ---- dark content layout -------------------------------------------------
  pres.defineSlideMaster({
    title: 'CONTENT_DARK',
    background: { color: P.navy },
    objects: [
      { text: { text: footText, options: {
          x: 1.74, y: 7.04, w: 7.4, h: 0.3, fontSize: 9, color: '6E8299',
          align: 'left', valign: 'middle', margin: 0, isTextBox: true } } },
      { image: { x: M, y: 7.0, w: 0.94, h: 0.406, path: A + 'harel_light.png',
                 altText: 'Harel Insurance and Finance logo' } }
    ],
    slideNumber: { x: 12.3, y: 7.04, w: 0.42, h: 0.3, fontSize: 10,
                   color: '6E8299', align: 'right', valign: 'middle', fontFace: 'Arial' }
  });

  // ---- section divider -----------------------------------------------------
  pres.defineSlideMaster({
    title: 'DIVIDER',
    background: { color: P.navy },
    objects: [
      { image: { x: M, y: 7.0, w: 0.94, h: 0.406, path: A + 'harel_light.png',
                 altText: 'Harel Insurance and Finance logo' } }
    ],
    slideNumber: { x: 12.3, y: 7.04, w: 0.42, h: 0.3, fontSize: 10,
                   color: '6E8299', align: 'right', valign: 'middle', fontFace: 'Arial' }
  });

  // ---- full-bleed statement slide (title / closing) ------------------------
  pres.defineSlideMaster({ title: 'STATEMENT', background: { color: P.navy } });

  return pres;
}

// ---------------------------------------------------------------------------
// components
// ---------------------------------------------------------------------------

// action titles must stay on one line at 28pt across the 12.09" content width
const TITLE_MAX = 64;
const LONG_TITLES = [];

/** eyebrow + action title block at the top of a content slide */
function head(slide, kicker, title, opts = {}) {
  const dark = !!opts.dark;
  const accent = opts.accent || P.green;
  slide.addShape('ellipse', { x: M, y: 0.52, w: 0.115, h: 0.115,
    fill: { color: accent }, line: { type: 'none' }, objectName: 'kicker-dot' });
  slide.addText(kicker.toUpperCase(), {
    x: M + 0.22, y: 0.4, w: CW - 0.22, h: 0.34, fontSize: 11.5, bold: true,
    charSpacing: 1.6, color: dark ? '8FA7BF' : P.muted, fontFace: 'Arial',
    align: 'left', valign: 'middle', margin: 0, isTextBox: true, objectName: 'kicker'
  });
  const size = opts.titleSize || 28;
  if (size >= 26 && title.length > TITLE_MAX) LONG_TITLES.push(title.length + ' — ' + title);
  slide.addText(title, {
    x: M, y: 0.76, w: opts.titleW || CW, h: 0.82, fontSize: size,
    bold: true, color: dark ? 'FFFFFF' : P.navy, fontFace: 'Cambria',
    align: 'left', valign: 'middle', margin: 0, isTextBox: true,
    fit: 'shrink', objectName: 'action-title'
  });
}

/** small muted note anchored just under the content area */
function note(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x !== undefined ? opts.x : M, y: opts.y !== undefined ? opts.y : BOT + 0.08,
    w: opts.w || CW, h: 0.3, fontSize: opts.fontSize || 10,
    color: opts.color || (opts.dark ? '7E93AB' : P.dimText),
    italic: true, align: opts.align || 'left', valign: 'top', margin: 0,
    isTextBox: true, objectName: 'note'
  });
}

/** headline statistic in a soft tinted card */
function stat(slide, o) {
  const dark = !!o.dark;
  const accent = o.accent || P.blue;
  slide.addShape('roundRect', {
    x: o.x, y: o.y, w: o.w, h: o.h, rectRadius: 0.06,
    fill: { color: dark ? P.steel : P.surface },
    line: { type: 'none' }, objectName: 'stat-card-' + (o.label || '').slice(0, 14)
  });
  slide.addShape('ellipse', { x: o.x + 0.26, y: o.y + 0.3, w: 0.1, h: 0.1,
    fill: { color: accent }, line: { type: 'none' }, objectName: 'stat-dot' });
  slide.addText((o.label || '').toUpperCase(), {
    x: o.x + 0.46, y: o.y + 0.19, w: o.w - 0.7, h: 0.32, fontSize: 10, bold: true,
    charSpacing: 1.1, color: dark ? '9FB3C8' : P.muted, fontFace: 'Arial',
    align: 'left', valign: 'middle', margin: 0, isTextBox: true
  });
  slide.addText(o.value, {
    x: o.x + 0.26, y: o.y + 0.5, w: o.w - 0.5, h: o.valueH || 0.78,
    fontSize: o.valueSize || 38, bold: true,
    color: o.valueColor || (dark ? 'FFFFFF' : P.navy), fontFace: 'Arial',
    align: 'left', valign: 'middle', margin: 0, isTextBox: true
  });
  if (o.sub) {
    slide.addText(o.sub, {
      x: o.x + 0.26, y: o.y + (o.valueH || 0.78) + 0.48, w: o.w - 0.5, h: o.subH || 0.5,
      fontSize: o.subSize || 11.5, color: o.subColor || (dark ? 'A9BCCF' : P.muted),
      fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true
    });
  }
}

/** plain tinted panel used to group content */
function panel(slide, o) {
  slide.addShape('roundRect', {
    x: o.x, y: o.y, w: o.w, h: o.h, rectRadius: o.r || 0.06,
    fill: { color: o.fill || P.surface }, line: o.line || { type: 'none' },
    objectName: o.name || 'panel'
  });
}

/** status / category chip */
function chip(slide, o) {
  slide.addShape('roundRect', {
    x: o.x, y: o.y, w: o.w, h: o.h || 0.3, rectRadius: 0.12,
    fill: { color: o.fill }, line: { type: 'none' }, objectName: 'chip'
  });
  slide.addText(o.text, {
    x: o.x, y: o.y, w: o.w, h: o.h || 0.3, fontSize: o.fontSize || 10, bold: true,
    color: o.color || 'FFFFFF', fontFace: 'Arial', align: 'center', valign: 'middle',
    margin: 0, isTextBox: true
  });
}

/** icon-free numbered row used for lists of findings / actions */
function bulletRow(slide, o) {
  const accent = o.accent || P.blue;
  slide.addShape('ellipse', { x: o.x, y: o.y + 0.04, w: 0.3, h: 0.3,
    fill: { color: accent }, line: { type: 'none' }, objectName: 'num-badge' });
  slide.addText(String(o.n), { x: o.x, y: o.y + 0.04, w: 0.3, h: 0.3, fontSize: 12,
    bold: true, color: 'FFFFFF', fontFace: 'Arial', align: 'center', valign: 'middle',
    margin: 0, isTextBox: true });
  const tH = o.titleH || 0.32;
  slide.addText(o.title, { x: o.x + 0.46, y: o.y, w: o.w - 0.46, h: tH,
    fontSize: o.titleSize || 15, bold: true, color: o.dark ? 'FFFFFF' : P.navy,
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
  if (o.body) {
    slide.addText(o.body, { x: o.x + 0.46, y: o.y + tH + 0.02, w: o.w - 0.46, h: o.bodyH || 0.5,
      fontSize: o.bodySize || 12.5, color: o.dark ? 'A9BCCF' : P.muted, fontFace: 'Arial',
      align: 'left', valign: 'top', margin: 0, isTextBox: true });
  }
}

/**
 * Ranked horizontal bars drawn as shapes — far more legible on a projector
 * than a native bar chart with long category labels.
 * items: [label, value, colour?]
 */
function rankList(slide, o) {
  const items = o.items;
  const max = Math.max(...items.map(i => i[1]));
  const rowH = o.rowH || 0.52;
  const labelW = o.labelW || 2.6;
  const valueW = o.valueW || 0.92;
  const barW = o.w - labelW - valueW - 0.2;
  items.forEach((it, i) => {
    const y = o.y + i * rowH;
    slide.addText(it[0], {
      x: o.x, y: y, w: labelW, h: rowH - 0.08, fontSize: o.fontSize || 11,
      color: o.dark ? 'D4DEE8' : P.navy, fontFace: 'Arial', align: 'left',
      valign: 'middle', margin: 0, isTextBox: true
    });
    const bw = Math.max((it[1] / max) * barW, 0.03);
    slide.addShape('rect', {
      x: o.x + labelW + 0.1, y: y + (rowH - 0.08) / 2 - 0.075, w: bw, h: 0.15,
      fill: { color: it[2] || P.blue }, line: { type: 'none' },
      objectName: 'rank-bar-' + i
    });
    slide.addText(o.fmt ? o.fmt(it[1]) : k(it[1]), {
      x: o.x + o.w - valueW, y: y, w: valueW, h: rowH - 0.08,
      fontSize: (o.fontSize || 11) + 0.5, bold: true,
      color: o.dark ? 'FFFFFF' : P.navy, fontFace: 'Arial', align: 'right',
      valign: 'middle', margin: 0, isTextBox: true
    });
  });
}

/**
 * Period metric card, adapted from the reference deck: the latest month's
 * value, how it moved against the month before, and the headline total as the
 * source deck reported it. Gives every chart one number to read.
 */
function metricCard(slide, o) {
  const dark = !!o.dark;
  const h = o.h || 1.78;
  panel(slide, { x: o.x, y: o.y, w: o.w, h: h,
    fill: dark ? P.steel : P.surface, name: 'metric-' + (o.period || '') });
  slide.addShape('ellipse', { x: o.x + 0.28, y: o.y + 0.26, w: 0.1, h: 0.1,
    fill: { color: o.accent || P.blue }, line: { type: 'none' }, objectName: 'metric-dot' });
  slide.addText((o.period || '').toUpperCase(), {
    x: o.x + 0.48, y: o.y + 0.16, w: o.w - 0.76, h: 0.28, fontSize: 10, bold: true,
    charSpacing: 1.1, color: dark ? '9FB3C8' : P.muted, fontFace: 'Arial',
    align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  slide.addText(o.valueText || ('$' + Math.round(o.value).toLocaleString('en-US')), {
    x: o.x + 0.28, y: o.y + 0.44, w: o.w - 0.56, h: 0.62, fontSize: o.valueSize || 30,
    bold: true, color: dark ? 'FFFFFF' : P.navy, fontFace: 'Arial',
    align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  if (o.prev !== undefined && o.prev !== null) {
    const d = o.value - o.prev, pc = o.prev ? (d / o.prev) * 100 : 0, up = d >= 0;
    slide.addText(
      (up ? '+' : '\u2013') + Math.abs(pc).toFixed(1) + '% vs ' + (o.prevLabel || 'prior month')
      + '   (' + (up ? '+' : '\u2013') + '$' + Math.abs(Math.round(d)).toLocaleString('en-US') + ')', {
      x: o.x + 0.28, y: o.y + 1.06, w: o.w - 0.56, h: 0.3, fontSize: 11, bold: true,
      color: up ? P.gold : P.green, fontFace: 'Arial',
      align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  }
  if (o.reported) {
    slide.addText(o.reported, {
      x: o.x + 0.28, y: o.y + h - 0.46, w: o.w - 0.56, h: 0.3, fontSize: 10.5,
      color: dark ? 'A9BCCF' : P.muted, fontFace: 'Arial',
      align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  }
}

/**
 * Month-by-month value strip, adapted from the reference deck. Puts the actual
 * figures above the chart so nobody has to read bar heights.
 */
function monthStrip(slide, o) {
  const n = o.labels.length, cw = o.w / n;
  panel(slide, { x: o.x, y: o.y, w: o.w, h: 0.62, fill: o.fill || P.surface, name: 'strip' });
  o.labels.forEach((lab, i) => {
    slide.addText(lab, {
      x: o.x + i * cw, y: o.y + 0.05, w: cw, h: 0.24, fontSize: 9.5, bold: true,
      color: P.muted, fontFace: 'Arial', align: 'center', valign: 'middle',
      margin: 0, isTextBox: true });
    slide.addText(o.fmt ? o.fmt(o.values[i]) : k(o.values[i]), {
      x: o.x + i * cw, y: o.y + 0.28, w: cw, h: 0.28, fontSize: o.fontSize || 11, bold: true,
      color: i === n - 1 ? P.navy : '41546B', fontFace: 'Arial',
      align: 'center', valign: 'middle', margin: 0, isTextBox: true });
  });
}

// Headline totals exactly as the September source deck labelled them, so every
// chart can show a visible tie-back to what was published before.
const REPORTED = {
  aws:      'As reported in September: $791K',
  azure:    'As reported in September: $1.50M',
  awsMkt:   'As reported in September: $1.82M',
  azureMkt: 'As reported in September: $563K',
  harelIl:  'As reported in September: $166K'
};

// ---------------------------------------------------------------------------
// chart option builders — fresh object every call (pptxgenjs mutates in place)
// ---------------------------------------------------------------------------
function axisBase(dark) {
  return {
    catAxisLabelColor: dark ? 'A9BCCF' : P.muted,
    catAxisLabelFontSize: 11.5,
    catAxisLabelFontFace: '+mn-lt',
    catAxisLineShow: false,
    catGridLine: { style: 'none' },
    valAxisLabelColor: dark ? 'A9BCCF' : P.muted,
    valAxisLabelFontSize: 11,
    valAxisLabelFontFace: '+mn-lt',
    valAxisLineShow: false,
    valGridLine: { color: dark ? '1E3A57' : 'E4EAF1', size: 1 },
    showTitle: false,
    showLegend: false,
    chartColors: SERIES,
    dataLabelFontFace: '+mn-lt',
    dataLabelFontSize: 11,
    border: { pt: 0, color: 'FFFFFF' }
  };
}
function legendBase(dark, pos = 'b') {
  return {
    showLegend: true, legendPos: pos,
    legendColor: dark ? 'C3D2E0' : '41546B',
    legendFontSize: 11, legendFontFace: '+mn-lt'
  };
}

// canonical display names for the raw cost-centre keys in the billing export
const CC_NAME = {
  datacloud: 'DataCloud', sap: 'SAP', cloudit: 'CloudIT', aifactory: 'AI Factory',
  cloudops: 'CloudOps', itsec: 'ITSec', actuary: 'Actuary', investments: 'Investments',
  basasach: 'Basasach', integration: 'Integration', other: 'Other',
  'Risk Agility': 'Risk Agility'
};
const ccName = n => CC_NAME[n] || (n.charAt(0).toUpperCase() + n.slice(1));

/** full-bleed section divider body */
function divider(slide, num, title, body, accent) {
  slide.addText(num, { x: M, y: 2.0, w: 2.2, h: 1.5, fontSize: 96, bold: true,
    color: accent, fontFace: 'Cambria', align: 'left', valign: 'middle',
    margin: 0, isTextBox: true, objectName: 'div-num' });
  slide.addText(title, { x: M, y: 3.5, w: 9.8, h: 0.96, fontSize: 40, bold: true,
    color: 'FFFFFF', fontFace: 'Cambria', align: 'left', valign: 'middle',
    margin: 0, isTextBox: true, objectName: 'div-title' });
  slide.addText(body, { x: M, y: 4.56, w: 8.2, h: 0.95, fontSize: 15, color: '9FB3C8',
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true,
    objectName: 'div-body' });
}

module.exports = {
  pptxgen, fs, SC, DATA, A, THEME, P, SERIES, divider,
  SW, SH, M, CW, TOP, BOT, CH, G, tileW, tileX,
  money, money1, k, pct, sum, topN, LONG_TITLES, TITLE_MAX, ccName,
  newDeck, head, note, stat, panel, chip, bulletRow, rankList,
  metricCard, monthStrip, REPORTED, axisBase, legendBase
};
