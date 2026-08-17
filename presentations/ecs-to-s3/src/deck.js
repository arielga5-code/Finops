const { C, F, G, he } = require('./theme');

// ---------------------------------------------------------------- data
const FC_LABELS = [
  'Apr-25','May-25','Jun-25','Jul-25','Aug-25','Sep-25','Oct-25','Nov-25','Dec-25',
  'Jan-26','Feb-26','Mar-26','Apr-26','May-26','Jun-26','Jul-26','Aug-26',
  'Sep-26','Oct-26','Nov-26','Dec-26','Jan-27','Feb-27','Mar-27',
];
const N = FC_LABELS.length;         // 24
const IDX_AUG26 = 16;               // last actual

const ACTUAL = [516,520,526,530,549,560,569,577,605,628,642,650,660,668,680,679,668]
  .concat(Array(N - 17).fill(null));

const TREND = Array(IDX_AUG26).fill(null)
  .concat([668, 678, 688, 698, 708, 718, 727, 737]);

const FAST = Array(IDX_AUG26).fill(null)
  .concat([668, 691, 714, 737, 760, 783, 806, 829]);

const CAPACITY  = Array(N).fill(916);
const THRESHOLD = Array(N).fill(733);

// ------------------------------------------------------------- helpers
const ops = [];
function S(fn) { const o = []; fn(o); return o; }

function rect(o, x, y, w, h, opt = {}) {
  o.push({ t: 'rect', x, y, w, h, fill: opt.fill, line: opt.line, lw: opt.lw || 1, r: opt.r });
}
function txt(o, s, opt) { o.push(Object.assign({ t: 'text', s }, opt)); }

function header(o, eyebrow, headline, accent = C.cyan, headSize = 27) {
  txt(o, he(eyebrow), {
    x: G.M, y: G.eyebrowY, w: G.CW, h: 0.26,
    size: 11, bold: true, color: accent, align: 'right', rtl: true, cs: 1.2, valign: 'middle',
  });
  txt(o, he(headline), {
    x: G.M, y: G.headY, w: G.CW, h: 0.92,
    size: headSize, bold: true, color: C.text, align: 'right', rtl: true, valign: 'top', lh: 1.05,
  });
  rect(o, G.M, G.hairY, G.CW, 0.012, { fill: C.hair });
}

function footnote(o, s, accent = C.dim) {
  rect(o, G.M, G.footHairY, G.CW, 0.012, { fill: C.hair });
  rect(o, G.W - G.M - 0.13, G.footY + 0.09, 0.13, 0.13, { fill: accent });
  txt(o, he(s), {
    x: G.M, y: G.footY, w: G.CW - 0.28, h: 0.62,
    size: 11.5, color: C.muted, align: 'right', rtl: true, valign: 'top', lh: 1.15,
  });
}

// KPI block without a card (v16 house style): value / CAPS label / description
function kpi(o, x, y, w, value, label, sub, accent) {
  txt(o, value, { x, y, w, h: 0.72, size: 38, bold: true, color: accent, align: 'right', rtl: false, valign: 'middle' });
  txt(o, he(label), { x, y: y + 0.74, w, h: 0.26, size: 10.5, bold: true, color: C.muted, align: 'right', rtl: true, cs: 0.9, valign: 'middle' });
  txt(o, he(sub), { x, y: y + 1.02, w, h: 0.62, size: 11.5, color: C.dim, align: 'right', rtl: true, valign: 'top', lh: 1.15 });
}

// Card with title + body
function card(o, x, y, w, h, accent, title, body, opt = {}) {
  rect(o, x, y, w, h, { fill: C.card, line: C.border, r: 0.04 });
  rect(o, x + w - 0.55, y + 0.32, 0.13, 0.13, { fill: accent });
  txt(o, he(title), {
    x: x + 0.34, y: y + 0.26, w: w - 1.04, h: 0.3,
    size: 13.5, bold: true, color: accent, align: 'right', rtl: true, valign: 'middle',
  });
  txt(o, he(body), {
    x: x + 0.34, y: y + 0.64, w: w - 0.68, h: h - 0.92,
    size: opt.size || 12, color: opt.color || C.muted, align: 'right', rtl: true, valign: 'top', lh: 1.22,
  });
}

// Custom chart legend chip
function chip(o, x, y, color, label) {
  rect(o, x, y + 0.055, 0.16, 0.11, { fill: color });
  txt(o, he(label), { x: x - 1.55, y, w: 1.47, h: 0.22, size: 10.5, color: C.muted, align: 'right', rtl: true, valign: 'middle' });
}

// =====================================================================
const slides = [];

// -------------------------------------------------- 1 · Cover
slides.push({ bg: C.bgDeep, ops: S(o => {
  rect(o, 0, 0, G.W, G.H, { fill: C.bgDeep });
  // quiet geometric motif — on the left, away from the RTL text column
  rect(o, -1.8, -1.1, 5.2, 5.2, { fill: '0C1322' });
  rect(o, -1.4, 3.3, 3.4, 3.4, { fill: '0A101C' });

  txt(o, he('הראל · תשתיות IT · ניהול קיבולת אחסון'), {
    x: G.M, y: 1.62, w: G.CW, h: 0.3, size: 12, bold: true, color: C.cyan, align: 'right', rtl: true, cs: 1.2, valign: 'middle' });
  txt(o, he('העתקת מסמכי דימות ו-Verint לענן'), {
    x: G.M, y: 2.0, w: G.CW, h: 0.95, size: 40, bold: true, color: C.text, align: 'right', rtl: true, valign: 'middle' });
  txt(o, he('מ-ECS On-Prem ל-AWS S3 · מצגת לקבלת החלטה · אוגוסט 2026'), {
    x: G.M, y: 3.0, w: G.CW, h: 0.42, size: 15, color: C.muted, align: 'right', rtl: true, valign: 'middle' });

  const tiles = [
    { v: '72.9%',      l: 'ניצולת האחסון היום',    s: '668 TB מתוך 916 TB',       a: C.orange },
    { v: '65 TB',      l: 'המרווח עד סף 80%',      s: 'כ-6 חודשים בקצב המגמה',    a: C.cyan },
    { v: '$116K–141K', l: 'עלות 100 TB ל-5 שנים',  s: 'On-Prem מול AWS S3 Standard', a: C.green },
  ];
  // RTL: first tile on the right
  tiles.forEach((t, i) => {
    const gap = 0.42, w = (G.CW - 2 * gap) / 3;
    const x = G.W - G.M - w - i * (w + gap);
    rect(o, x, 4.32, w, 1.28, { fill: C.card, line: C.border, r: 0.05 });
    txt(o, he(t.l), { x: x + 0.28, y: 4.46, w: w - 0.56, h: 0.24, size: 10.5, bold: true, color: C.muted, align: 'right', rtl: true, cs: 0.8, valign: 'middle' });
    txt(o, t.v,     { x: x + 0.28, y: 4.72, w: w - 0.56, h: 0.46, size: 26, bold: true, color: t.a, align: 'right', rtl: false, valign: 'middle' });
    txt(o, he(t.s), { x: x + 0.28, y: 5.19, w: w - 0.56, h: 0.28, size: 11, color: C.dim, align: 'right', rtl: true, valign: 'middle' });
  });

  rect(o, 0.9, 6.42, 11.53, 0.012, { fill: C.hair });
  txt(o, he('Harel IT Infrastructure · חסוי · הנתונים נכונים לאוגוסט 2026'), {
    x: 0.9, y: 6.58, w: 11.53, h: 0.3, size: 11, color: C.dim, align: 'right', rtl: true, valign: 'middle' });
})});

// -------------------------------------------------- 2 · The decision
slides.push({ ops: S(o => {
  header(o, 'ההחלטה הנדרשת', 'שתי החלטות נפרדות — ורק אחת מהן דחופה היום', C.cyan);

  const w = 5.62, h = 2.48, y = 2.3;
  const xR = G.W - G.M - w;        // right card = first in RTL
  const xL = G.M;

  rect(o, xR, y, w, h, { fill: C.card, line: '2E5F6B', r: 0.05 });
  txt(o, '01', { x: xR + w - 1.0, y: y + 0.26, w: 0.7, h: 0.44, size: 22, bold: true, color: C.cyan, align: 'right', rtl: false, valign: 'middle' });
  txt(o, he('העתקת מסמכי דימות ו-Verint ל-AWS S3'), { x: xR + 0.34, y: y + 0.28, w: w - 1.44, h: 0.42, size: 16.5, bold: true, color: C.text, align: 'right', rtl: true, valign: 'middle' });
  txt(o, he('מפנה שטח ב-ECS תוך שבועות, ללא PO וללא זמן אספקה. זה המנוף היחיד שזמין לפני דצמבר 2026, והוא אינו תלוי בשרשרת האספקה של Dell. החשיפה התקציבית המיידית מוגבלת ל-POC בהיקף 1–2 TB בלבד.'), {
    x: xR + 0.34, y: y + 0.82, w: w - 0.68, h: 1.16, size: 12.5, color: C.muted, align: 'right', rtl: true, valign: 'top', lh: 1.24 });
  rect(o, xR + 0.34, y + 1.82, w - 0.68, 0.5, { fill: '13303A', r: 0.12 });
  txt(o, he('נדרש היום: אישור עקרוני + תקציב POC'), { x: xR + 0.5, y: y + 1.82, w: w - 1.0, h: 0.5, size: 12.5, bold: true, color: C.cyan, align: 'right', rtl: true, valign: 'middle' });

  rect(o, xL, y, w, h, { fill: C.card, line: '5A4222', r: 0.05 });
  txt(o, '02', { x: xL + w - 1.0, y: y + 0.26, w: 0.7, h: 0.44, size: 22, bold: true, color: C.orange, align: 'right', rtl: false, valign: 'middle' });
  txt(o, he('הרחבת דיסקים ב-Dell ECS On-Prem'), { x: xL + 0.34, y: y + 0.28, w: w - 1.44, h: 0.42, size: 16.5, bold: true, color: C.text, align: 'right', rtl: true, valign: 'middle' });
  txt(o, he('זמן אספקה כחודשיים. אינה דחופה השבוע — אך אסור שתיקבע לפי תאריך בלוח השנה, אלא לפי טריגר ניצולת שמבטיח חודשיים אספקה בכל תרחיש. הצעת Dell הנוכחית עומדת על $695,520 עבור 600 TB לוגי.'), {
    x: xL + 0.34, y: y + 0.82, w: w - 0.68, h: 1.16, size: 12.5, color: C.muted, align: 'right', rtl: true, valign: 'top', lh: 1.24 });
  rect(o, xL + 0.34, y + 1.82, w - 0.68, 0.5, { fill: '3A2A12', r: 0.12 });
  txt(o, he('נדרש היום: אישור טריגר רכש בניצולת 75%'), { x: xL + 0.5, y: y + 1.82, w: w - 1.0, h: 0.5, size: 12.5, bold: true, color: C.orange, align: 'right', rtl: true, valign: 'middle' });

  txt(o, he('שתי ההחלטות אינן חלופיות. ההעתקה לענן דוחה ומקטינה את הרכש — היא אינה מבטלת אותו.'), {
    x: G.M, y: 5.15, w: G.CW, h: 0.5, size: 15, bold: true, color: C.text, align: 'right', rtl: true, valign: 'middle' });

  footnote(o, 'אין צורך באישור תקציב סופי לרכש בישיבה זו. הנתון החסר להחלטה מלאה הוא גודל קורפוס הדימות ו-Verint — כמה TB באמת יפונו.', C.cyan);
})});

// -------------------------------------------------- 3 · Situation + forecast chart
slides.push({ ops: S(o => {
  header(o, 'המצב היום', '668 TB מתוך 916 TB — והגידול נעצר בשלושת החודשים האחרונים', C.orange, 25);

  // stat rail on the LEFT (mirrored for RTL); chart on the RIGHT
  const railW = 3.05, railX = G.M;
  const rows = [
    { v: '72.9%',      l: 'ניצולת נוכחית',        s: 'אוגוסט 2026 · 668 TB מתוך 916 TB', a: C.orange },
    { v: '65 TB',      l: 'מרווח עד סף 80%',      s: 'הסף עומד על 733 TB',               a: C.cyan },
    { v: '9.9 TB',     l: 'גידול חודשי · 12 חודשים', s: 'אך מאי–אוגוסט 2026: ללא גידול נטו', a: C.green },
  ];
  rows.forEach((r, i) => {
    const y = 2.26 + i * 1.46;
    rect(o, railX + railW - 0.06, y + 0.02, 0.055, 1.16, { fill: r.a });
    txt(o, r.v,     { x: railX, y, w: railW - 0.22, h: 0.5, size: 30, bold: true, color: r.a, align: 'right', rtl: false, valign: 'middle' });
    txt(o, he(r.l), { x: railX, y: y + 0.5, w: railW - 0.22, h: 0.26, size: 10.5, bold: true, color: C.muted, align: 'right', rtl: true, cs: 0.8, valign: 'middle' });
    txt(o, he(r.s), { x: railX, y: y + 0.78, w: railW - 0.22, h: 0.44, size: 11, color: C.dim, align: 'right', rtl: true, valign: 'top', lh: 1.15 });
  });

  const cx = 4.28, cy = 2.3, cw = 8.15, ch = 3.55;
  txt(o, he('ניצולת אחסון ותחזית · TB'), { x: cx, y: 2.0, w: cw, h: 0.26, size: 11, bold: true, color: C.muted, align: 'right', rtl: true, cs: 0.8, valign: 'middle' });
  o.push({ t: 'chart', kind: 'forecast', x: cx, y: cy, w: cw, h: ch });

  const legend = [
    { c: C.orange, l: 'בשימוש בפועל' },
    { c: C.cyan,   l: 'תחזית מגמה' },
    { c: C.purple, l: 'תרחיש מואץ' },
    { c: C.red,    l: 'סף 80%' },
    { c: C.blue,   l: 'קיבולת' },
  ];
  legend.forEach((g, i) => chip(o, G.W - G.M - 0.16 - i * 1.62, 5.94, g.c, g.l));

  footnote(o, 'ההרחבה הקודמת העלתה את הקיבולת מ-696 TB ל-916 TB באפריל 2025 — 220 TB, כלומר כ-22 חודשי מרווח בקצב המגמה הנוכחי.', C.orange);
})});

// -------------------------------------------------- 4 · Forecast correction
slides.push({ ops: S(o => {
  header(o, 'תיקון לתחזית', 'סף 80% לא ייחצה באוקטובר 2026 — אלא בין נובמבר 2026 למרץ 2027', C.red, 25);

  const w = 3.55, gap = 0.44, y = 2.26;
  const sc = [
    { a: C.purple, n: 'תרחיש מואץ',       r: 'כ-23 TB לחודש', d: 'נובמבר 2026', s: 'גבול אי-הוודאות העליון של הדשבורד' },
    { a: C.orange, n: 'תחזית הדשבורד',    r: 'כ-14 TB לחודש', d: 'ינואר 2027',  s: 'שיפוע סדרת התחזית הקיימת' },
    { a: C.green,  n: 'תרחיש מגמה',       r: '9.9 TB לחודש', d: 'מרץ 2027',    s: 'ממוצע 12 החודשים האחרונים בפועל' },
  ];
  sc.forEach((t, i) => {
    const x = G.W - G.M - w - i * (w + gap);
    rect(o, x, y, w, 2.12, { fill: C.card, line: C.border, r: 0.05 });
    rect(o, x + w - 0.5, y + 0.3, 0.13, 0.13, { fill: t.a });
    txt(o, he(t.n), { x: x + 0.3, y: y + 0.22, w: w - 0.9, h: 0.3, size: 13, bold: true, color: C.text, align: 'right', rtl: true, valign: 'middle' });
    txt(o, he(t.r), { x: x + 0.3, y: y + 0.54, w: w - 0.6, h: 0.26, size: 11.5, color: C.muted, align: 'right', rtl: true, valign: 'middle' });
    txt(o, he(t.d), { x: x + 0.3, y: y + 0.9, w: w - 0.6, h: 0.56, size: 27, bold: true, color: t.a, align: 'right', rtl: true, valign: 'middle' });
    txt(o, he(t.s), { x: x + 0.3, y: y + 1.5, w: w - 0.6, h: 0.5, size: 11, color: C.dim, align: 'right', rtl: true, valign: 'top', lh: 1.15 });
  });

  rect(o, G.M, 4.66, G.CW, 1.36, { fill: '2A1620', line: '5A2A38', r: 0.05 });
  rect(o, G.W - G.M - 0.48, 4.9, 0.13, 0.13, { fill: C.red });
  txt(o, he('מה שהדשבורד מציג כיום — ומה שגוי בו'), { x: G.M + 0.3, y: 4.82, w: G.CW - 0.9, h: 0.28, size: 12.5, bold: true, color: C.red, align: 'right', rtl: true, valign: 'middle' });
  txt(o, he('הדשבורד מסמן את אוקטובר 2026 כמועד חציית 80% ומציין 733 TB. סדרת התחזית שבתוכו מגיעה באוקטובר ל-695 TB בלבד — 75.9% ניצולת. אוקטובר הוא מועד היעד להוצאת הרכש, לא מועד חציית הסף; שני הקווים מצוירים על אותו חודש וזה מקור הבלבול. בנוסף, הדשבורד מציג ניצולת של 75% במקום 72.9%, ומציג תחזית של 710 TB לדצמבר בעוד סדרת הנתונים שלו עצמה נותנת 725 TB.'), {
    x: G.M + 0.3, y: 5.1, w: G.CW - 0.6, h: 0.84, size: 12, color: C.muted, align: 'right', rtl: true, valign: 'top', lh: 1.2 });

  footnote(o, 'המלצה: להחליף יעד-תאריך בטריגר ניצולת. הוצאת PO כאשר הניצולת מגיעה ל-75% (687 TB) משאירה לפחות חודשיים אספקה גם בתרחיש המואץ. היום חסרים 19 TB לטריגר.', C.green);
})});

// -------------------------------------------------- 5 · Cost comparison
slides.push({ ops: S(o => {
  header(o, 'השוואת עלויות', '100 TB ל-5 שנים: $116K ב-On-Prem מול $138K–165K ב-AWS S3 Standard', C.green, 24);

  const cx = 4.28, cw = 8.15;
  txt(o, he('עלות 100 TB לחמש שנים · אלפי דולרים'), { x: cx, y: 2.02, w: cw, h: 0.26, size: 11, bold: true, color: C.muted, align: 'right', rtl: true, cs: 0.8, valign: 'middle' });
  o.push({ t: 'chart', kind: 'cost', x: cx, y: 2.32, w: cw, h: 3.4 });

  const railW = 3.05, railX = G.M;
  const rows = [
    { v: '$1,158',      l: 'לכל TB לוגי · Dell ECS',   s: 'כולל Replica x3 בין שלושה אתרים',    a: C.green },
    { v: '$1,380–1,650', l: 'לכל TB · AWS S3 Standard', s: 'עמידות מובנית, ללא כפל אחסון מצידנו', a: C.cyan },
    { v: '16%–30%',      l: 'יתרון ל-Dell ECS',         s: 'מול S3 Standard בלבד — ראו השקף הבא', a: C.orange },
  ];
  rows.forEach((r, i) => {
    const y = 2.26 + i * 1.46;
    rect(o, railX + railW - 0.06, y + 0.02, 0.055, 1.16, { fill: r.a });
    txt(o, r.v,     { x: railX, y, w: railW - 0.22, h: 0.5, size: 26, bold: true, color: r.a, align: 'right', rtl: false, valign: 'middle' });
    txt(o, he(r.l), { x: railX, y: y + 0.5, w: railW - 0.22, h: 0.26, size: 10.5, bold: true, color: C.muted, align: 'right', rtl: true, cs: 0.8, valign: 'middle' });
    txt(o, he(r.s), { x: railX, y: y + 0.78, w: railW - 0.22, h: 0.46, size: 11, color: C.dim, align: 'right', rtl: true, valign: 'top', lh: 1.15 });
  });

  footnote(o, 'מקור On-Prem: הצעת Dell — $695,520 עבור 1,800 TB נטו (3,024 TB ברוטו), $386 ל-TB נטו, בהוספת דיסקים ל-21 nodes קיימים ללא nodes חדשים. שני הצדדים מנורמלים ל-100 TB לוגי.', C.green);
})});

// -------------------------------------------------- 6 · Tier correction
slides.push({ ops: S(o => {
  header(o, 'מה שההשוואה מפספסת', 'השוואנו מול S3 Standard — אבל דימות ו-Verint הם דאטה ארכיוני', C.purple, 25);

  // Tier ladder on the right
  const tx = 6.95, tw = 5.48;
  txt(o, he('עלות 100 TB לחמש שנים לפי שכבת אחסון'), { x: tx, y: 2.12, w: tw, h: 0.26, size: 11, bold: true, color: C.muted, align: 'right', rtl: true, cs: 0.8, valign: 'middle' });
  const tiers = [
    { n: 'S3 Standard',                  p: '$0.023 / GB', v: '$141K', f: 1.00, a: C.red },
    { n: 'Dell ECS On-Prem',             p: 'capex דיסקים', v: '$116K', f: 0.82, a: C.orange },
    { n: 'S3 Standard-IA',               p: '$0.0125 / GB', v: '$77K',  f: 0.54, a: C.cyan },
    { n: 'S3 Glacier Instant Retrieval', p: '$0.004 / GB',  v: '$25K',  f: 0.17, a: C.green },
  ];
  tiers.forEach((t, i) => {
    const y = 2.46 + i * 0.82;
    txt(o, he(t.n), { x: tx + 1.62, y, w: tw - 1.62, h: 0.26, size: 12.5, bold: true, color: C.text, align: 'right', rtl: true, valign: 'middle' });
    txt(o, he(t.p), { x: tx + 1.62, y: y + 0.26, w: tw - 1.62, h: 0.24, size: 10.5, color: C.dim, align: 'right', rtl: true, valign: 'middle' });
    const barMax = tw - 1.78;
    const bw = Math.max(0.5, barMax * t.f);
    rect(o, tx + 1.62 + (barMax - bw), y + 0.52, bw, 0.19, { fill: t.a, r: 0.4 });
    txt(o, t.v, { x: tx, y: y + 0.08, w: 1.42, h: 0.44, size: 20, bold: true, color: t.a, align: 'right', rtl: false, valign: 'middle' });
  });

  card(o, G.M, 2.44, 5.7, 1.52, C.green, 'מה שמוזיל את הענן',
    'מסמכי דימות ו-Verint נכתבים פעם אחת ונקראים לעיתים נדירות. ב-Glacier Instant Retrieval, בזמן אחזור של מילישניות, העלות יורדת לכ-$25K — פי 4.6 זול מ-On-Prem, ולא יקר ממנו ב-30%.', { size: 12 });

  card(o, G.M, 4.14, 5.7, 1.6, C.red, 'מה שמייקר אותו',
    'יציאת נתונים $0.09 ל-GB (כ-$9K להוצאת 100 TB חזרה), דמי אחזור $0.03 ל-GB ב-Glacier IR, מינימום 90 יום אחסון, וחיוב מינימלי של 128 KB לאובייקט — משמעותי בדימות עם ריבוי קבצים קטנים. מחירי אזור תל אביב גבוהים ב-10%–15% ממחירון us-east-1.', { size: 12 });

  footnote(o, 'הנתון שחסר להכרעה: פילוח גודל-אובייקט ותדירות אחזור של קורפוס הדימות ו-Verint. הוא שקובע איזו שכבה נכונה, והוא אינו קיים היום. המחירים הם מחירון רשימה, ללא הנחות נפח או התחייבות.', C.purple);
})});

// -------------------------------------------------- 7 · Risks
slides.push({ ops: S(o => {
  header(o, 'סיכונים', 'כל סיכון מהותי ניתן להפחתה — אך שניים מהם חוסמים התחלה', C.red, 26);

  const risks = [
    { a: C.red,    t: 'משפטי · קבילות',      r: 'תאריך היצירה של המסמך משתנה בהעתקה; בית משפט עשוי לדרוש אסמכתא שהמסמך לא שונה.', m: 'S3 Object Lock במצב Compliance, manifest חתום SHA-256 לכל אובייקט, ושימור ה-metadata המקורי כ-object metadata.', blocking: true },
    { a: C.red,    t: 'רגולציה · ריבונות',   r: 'מידע רפואי ופיננסי מזוהה היוצא משליטת הארגון.', m: 'אזור il-central-1 (תל אביב), הצפנה ב-KMS עם מפתח בבעלותנו, ואישור DPO ורגולטור לפני ההעתקה הראשונה.', blocking: true },
    { a: C.orange, t: 'טכני · שלמות',        r: 'אין כלי העתקה ייעודי; חלק מהקבצים עלולים להיכשל בהעברה.', m: 'AWS DataSync עם ולידציה מובנית, דוח חריגים לכל ריצה, ומחיקה מ-ECS רק לאחר ולידציה מלאה.' },
    { a: C.orange, t: 'ביצועים',             r: 'זמני אחזור בענן נמוכים יותר; למערכת הדימות אין ניסיון מול ענן.', m: 'POC על 1–2 TB לפני התחייבות, חיבור Direct Connect ולא אינטרנט, ומדידת זמני אחזור מול ה-SLA הקיים.' },
    { a: C.cyan,   t: 'לוחות זמנים',         r: 'ההעתקה אורכת שבועות ותלויה בפס רוחב.', m: 'העברה ראשונית ב-AWS Snowball. ההעתקה אינה על הנתיב הקריטי של הרכש — שני המסלולים רצים במקביל.' },
    { a: C.cyan,   t: 'כלכלי · Lock-in',     r: 'יציאה מהענן עולה $0.09 ל-GB; מעבר ממודל capex למודל opex.', m: 'תמחור תרחיש יציאה מראש, התחלה בקורפוס אחד בלבד, ואישור תקציב opex רב-שנתי.' },
  ];
  const w = 3.55, gap = 0.44, h = 1.86;
  risks.forEach((k, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = G.W - G.M - w - col * (w + gap);
    const y = 2.24 + row * (h + 0.32);
    rect(o, x, y, w, h, { fill: C.card, line: k.blocking ? '5A2A38' : C.border, r: 0.05 });
    rect(o, x + w - 0.46, y + 0.26, 0.13, 0.13, { fill: k.a });
    txt(o, he(k.t), { x: x + 0.28, y: y + 0.18, w: w - 0.84, h: 0.28, size: 12.5, bold: true, color: k.a, align: 'right', rtl: true, valign: 'middle' });
    txt(o, he(k.r), { x: x + 0.28, y: y + 0.5, w: w - 0.56, h: 0.52, size: 11, color: C.text, align: 'right', rtl: true, valign: 'top', lh: 1.16 });
    rect(o, x + 0.28, y + 1.04, w - 0.56, 0.01, { fill: '2C3A54' });
    txt(o, he('מיטיגציה: ' + k.m), { x: x + 0.28, y: y + 1.11, w: w - 0.56, h: 0.66, size: 10.5, color: C.muted, align: 'right', rtl: true, valign: 'top', lh: 1.16 });
  });

  footnote(o, 'שני הסיכונים המסומנים באדום — קבילות משפטית וריבונות נתונים — חוסמים התחלה. יש לסגור אותם בספטמבר, במקביל ל-POC ולא אחריו.', C.red);
})});

// -------------------------------------------------- 8 · Benefits
slides.push({ ops: S(o => {
  header(o, 'מה זה נותן', 'המנוף היחיד על השולחן שאינו תלוי בזמן אספקה של חודשיים', C.green, 26);

  const bens = [
    { a: C.green,  t: 'פינוי שטח מיידי',   b: 'העתקת קורפוס הדימות ו-Verint מפנה שטח ב-ECS תוך שבועות. זו האפשרות היחידה שמשפיעה על הניצולת לפני דצמבר 2026.' },
    { a: C.green,  t: 'דחיית והקטנת capex', b: 'כל TB שמפונה דוחה את מועד הרכש ומקטין את היקפו. הצעת Dell הנוכחית עומדת על $695,520 עבור 600 TB לוגי.' },
    { a: C.cyan,   t: 'ללא זמן אספקה',     b: 'אין PO, אין דיסקים, אין חלון התקנה. הקיבולת זמינה ביום הראשון, ומשלמים רק על מה שנצרך בפועל — בלי לרכוש מראש קיבולת לשלוש שנים.' },
    { a: C.cyan,   t: 'Lifecycle אוטומטי', b: 'מדיניות שכבות מעבירה דאטה מתקרר לשכבה זולה יותר לאורך זמן — הוזלה שנמשכת ללא התערבות תפעולית ובלי פרויקט נוסף.' },
    { a: C.blue,   t: 'עמידות מובנית',     b: '11 תשיעיות עמידות ופיזור בין אזורי זמינות, במקום שכפול משולש שאנחנו מתחזקים ומשלמים עליו פי שלושה בשלושה אתרים.' },
    { a: C.purple, t: 'בסיס לשירותי AI',   b: 'תמלול שיחות וניתוח דימות כשירות מנוהל מעל אותו אחסון — יכולת שאינה קיימת על ECS היום ואינה דורשת פרויקט תשתית נפרד.' },
  ];
  const w = 3.55, gap = 0.44, h = 1.6;
  bens.forEach((k, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = G.W - G.M - w - col * (w + gap);
    const y = 2.32 + row * (h + 0.38);
    rect(o, x, y, w, h, { fill: C.card, line: C.border, r: 0.05 });
    rect(o, x + w - 0.46, y + 0.28, 0.13, 0.13, { fill: k.a });
    txt(o, he(k.t), { x: x + 0.28, y: y + 0.2, w: w - 0.84, h: 0.3, size: 13.5, bold: true, color: k.a, align: 'right', rtl: true, valign: 'middle' });
    txt(o, he(k.b), { x: x + 0.28, y: y + 0.58, w: w - 0.56, h: 0.9, size: 11.5, color: C.muted, align: 'right', rtl: true, valign: 'top', lh: 1.2 });
  });

  footnote(o, 'התועלת נמדדת ב-TB שפונו בפועל ובחודשי הדחייה שהושגו לרכש — לא באחוזי חיסכון תיאורטיים.', C.green);
})});

// -------------------------------------------------- 9 · Timeline
slides.push({ ops: S(o => {
  header(o, 'ציר זמן', 'שני מסלולים במקביל: העתקה לענן מתחילה מיד, רכש נקבע לפי טריגר', C.cyan, 25);

  const y0 = 2.86;
  const months = ['אוגוסט 26', 'ספטמבר 26', 'אוקטובר 26', 'נוב׳–דצמ׳ 26', 'ינואר–מרץ 27'];
  const gap = 0.22;
  const cw = (G.CW - (months.length - 1) * gap) / months.length;   // fits exactly
  const totalW = G.CW;
  const startR = G.W - G.M;

  rect(o, startR - totalW, y0 + 0.42, totalW, 0.03, { fill: C.border });

  const items = [
    { m: 'אישור עקרוני להעתקה\nפילוח קורפוס הדימות ו-Verint\nהגדרת קריטריוני קבילות', a: C.cyan },
    { m: 'POC על 1–2 TB\nאישור DPO ורגולטור\nהקמת Direct Connect', a: C.cyan },
    { m: 'תחילת העתקה לייצור\nולידציה ראשונה ודוח חריגים\nמדידת ניצולת מול טריגר 75%', a: C.green },
    { m: 'המשך העתקה ומחיקה מ-ECS\nטריגר רכש צפוי · PO ל-Dell\nדוח שלמות מסכם', a: C.orange },
    { m: 'אספקת דיסקים והתקנה\nצפי חציית 80% בתרחיש המגמה\nהחלטה על היקף הרחבה נוסף', a: C.purple },
  ];
  months.forEach((mn, i) => {
    const x = startR - cw - i * (cw + gap);
    txt(o, he(mn), { x, y: y0 - 0.32, w: cw, h: 0.3, size: 13, bold: true, color: C.text, align: 'right', rtl: true, valign: 'middle' });
    rect(o, x + cw - 0.18, y0 + 0.35, 0.17, 0.17, { fill: items[i].a });
    rect(o, x, y0 + 0.72, cw, 1.34, { fill: C.card, line: C.border, r: 0.06 });
    txt(o, he(items[i].m), { x: x + 0.22, y: y0 + 0.86, w: cw - 0.44, h: 1.08, size: 11.5, color: C.muted, align: 'right', rtl: true, valign: 'top', lh: 1.22 });
  });

  rect(o, G.M, 5.26, G.CW, 0.62, { fill: '13303A', r: 0.08 });
  rect(o, G.W - G.M - 0.44, 5.5, 0.13, 0.13, { fill: C.cyan });
  txt(o, he('טריגר הרכש אינו תאריך: PO יוצא כאשר הניצולת מגיעה ל-75% (687 TB). היום 72.9% — מרחק של 19 TB.'), {
    x: G.M + 0.3, y: 5.26, w: G.CW - 0.9, h: 0.62, size: 13, bold: true, color: C.cyan, align: 'right', rtl: true, valign: 'middle' });

  footnote(o, 'המסלולים אינם תלויים זה בזה. עיכוב ב-POC אינו מעכב את הרכש, ועיכוב ברכש אינו מעכב את ההעתקה.', C.cyan);
})});

// -------------------------------------------------- 10 · Recommendation
slides.push({ ops: S(o => {
  header(o, 'המלצה', 'לאשר את ההעתקה עכשיו, ולקשור את הרכש לניצולת ולא לתאריך', C.green, 27);

  const recs = [
    { n: '01', a: C.cyan,   t: 'אישור עקרוני להעתקת מסמכי דימות ו-Verint ל-AWS S3',
      b: 'התנעה באוגוסט. תקציב POC על 1–2 TB, וסגירת חסמי הקבילות המשפטית והריבונות בספטמבר במקביל.',
      o: 'תשתיות IT + יועץ משפטי + DPO' },
    { n: '02', a: C.orange, t: 'טריגר רכש בניצולת 75% במקום תאריך יעד',
      b: 'PO ל-Dell יוצא כאשר הניצולת מגיעה ל-687 TB. זה מבטיח חודשיים אספקה גם בתרחיש המואץ, ואינו מקדים רכש שאולי לא יידרש.',
      o: 'תשתיות IT + רכש' },
    { n: '03', a: C.purple, t: 'תמחור מחדש של חלופת הענן לפי שכבת אחסון נכונה',
      b: 'פילוח גודל-אובייקט ותדירות אחזור של הקורפוס, ותמחור מול Glacier Instant Retrieval באזור תל אביב — לא מול S3 Standard.',
      o: 'תשתיות IT + FinOps' },
  ];
  recs.forEach((r, i) => {
    const y = 2.22 + i * 1.15;
    rect(o, G.M, y, G.CW, 1.0, { fill: C.card, line: C.border, r: 0.05 });
    txt(o, r.n, { x: G.W - G.M - 0.86, y: y + 0.06, w: 0.6, h: 0.46, size: 21, bold: true, color: r.a, align: 'right', rtl: false, valign: 'middle' });
    txt(o, he(r.t), { x: G.M + 2.8, y: y + 0.12, w: G.CW - 3.7, h: 0.32, size: 14.5, bold: true, color: C.text, align: 'right', rtl: true, valign: 'middle' });
    txt(o, he(r.b), { x: G.M + 2.8, y: y + 0.46, w: G.CW - 3.7, h: 0.46, size: 11.5, color: C.muted, align: 'right', rtl: true, valign: 'top', lh: 1.18 });
    txt(o, he('אחריות'), { x: G.M + 0.28, y: y + 0.16, w: 2.3, h: 0.24, size: 10, bold: true, color: C.dim, align: 'right', rtl: true, cs: 0.8, valign: 'middle' });
    txt(o, he(r.o), { x: G.M + 0.28, y: y + 0.42, w: 2.3, h: 0.44, size: 11, color: r.a, align: 'right', rtl: true, valign: 'top', lh: 1.15 });
  });

  rect(o, G.M, 5.66, G.CW, 0.6, { fill: '14302A', line: '2A6A52', r: 0.08 });
  rect(o, G.W - G.M - 0.44, 5.89, 0.13, 0.13, { fill: C.green });
  txt(o, he('נדרש היום: אישור עקרוני להעתקה, תקציב POC, ואישור טריגר הרכש ב-75%.'), {
    x: G.M + 0.3, y: 5.66, w: G.CW - 0.9, h: 0.6, size: 14, bold: true, color: C.green, align: 'right', rtl: true, valign: 'middle' });

  footnote(o, 'החלטת התקציב המלאה לרכש תובא לאישור כאשר הטריגר ייחצה, עם הצעת מחיר מעודכנת מ-Dell ותמחור ענן מעודכן לצידה.', C.green);
})});

module.exports = { slides, FC_LABELS, ACTUAL, TREND, FAST, CAPACITY, THRESHOLD };
