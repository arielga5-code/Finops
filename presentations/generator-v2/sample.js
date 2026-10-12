// Five-slide sample of the merged style, for review before the full rebuild.
//   node sample.js   ->  ../_sample_merged_style.pptx
const C = require('./build_core.js');
const { applyTheme } = require('./apply_theme.js');
const { DATA, A, P, M, CW, TOP, BOT, k, sum, topN, divider,
        newDeck, head, note, stat, panel, chip, bulletRow, rankList, ccName,
        metricCard, monthStrip, axisBase, legendBase } = C;
const MON = DATA.months;
const path = require('path');

// Headline totals exactly as the September source deck labelled them.
const REPORTED = {
  aws:      'As reported in September: $791K',
  azure:    'As reported in September: $1.50M',
  awsMkt:   'As reported in September: $1.82M',
  azureMkt: 'As reported in September: $563K'
};

(async () => {
const pres = newDeck();
pres.addSection({ title: 'Sample' });
const S = () => pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Sample' });

// ---------------------------------------------------------------- 1. title
let s = pres.addSlide({ masterName: 'STATEMENT', sectionTitle: 'Sample' });
s.addText('HAREL INSURANCE & FINANCE   ·   CLOUD INFRASTRUCTURE, DEVOPS & DATABASES', {
  x: M, y: 1.45, w: 9.4, h: 0.36, fontSize: 12, bold: true, charSpacing: 1.8,
  color: '7FA8C9', fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addText('Cloud Cost Summary', {
  x: M, y: 1.92, w: 9.6, h: 1.1, fontSize: 54, bold: true, color: 'FFFFFF',
  fontFace: 'Cambria', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addText('FY2026  ·  January to September', {
  x: M, y: 3.02, w: 9.6, h: 0.52, fontSize: 23, color: '9EC6E6', fontFace: 'Cambria',
  italic: true, align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addText('מחלקת תשתיות ענן, DevOps ובסיסי נתונים  ·  אגף טכנולוגיות והגנת הסייבר', {
  x: M, y: 3.66, w: 9.6, h: 0.4, fontSize: 14, color: 'A9BCCF', fontFace: 'Arial',
  rtlMode: true, align: 'left', valign: 'middle', margin: 0, isTextBox: true });
[['$4.67M', 'Total cloud, YTD', P.blue], ['$578K', 'Savings delivered', P.green],
 ['34%', 'Of September spend is AI', P.violet]].forEach((f, i) => {
  const x = M + i * 3.15;
  s.addShape('ellipse', { x: x, y: 4.52, w: 0.1, h: 0.1, fill: { color: f[2] },
    line: { type: 'none' }, objectName: 'fig-dot-' + i });
  s.addText(f[0], { x: x, y: 4.68, w: 3.0, h: 0.6, fontSize: 30, bold: true, color: 'FFFFFF',
    fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(f[1], { x: x, y: 5.28, w: 2.95, h: 0.42, fontSize: 11.5, color: '8FA7BF',
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
});
const mmax = Math.max(...DATA.tot);
DATA.tot.forEach((v, i) => s.addShape('rect', {
  x: 10.35 + i * (2.35 / 9), y: 2.0 + (3.6 - (v / mmax) * 3.6),
  w: (2.35 / 9) * 0.6, h: (v / mmax) * 3.6,
  fill: { color: i === 8 ? P.gold : '21466B' }, line: { type: 'none' },
  objectName: 'motif-' + i }));
s.addText('MONTHLY CLOUD CONSUMPTION', { x: 10.35, y: 5.74, w: 2.75, h: 0.26, fontSize: 8.5,
  bold: true, charSpacing: 1.1, color: '6E8299', fontFace: 'Arial', align: 'left',
  valign: 'middle', margin: 0, isTextBox: true });
s.addImage({ path: A + 'harel_light.png', x: 10.35, y: 6.42, w: 1.25, h: 0.54,
  altText: 'Harel Insurance and Finance logo' });

// ------------------------------------------- 2. total spend, with month strip
s = S();
head(s, 'Total cloud spend', 'Harel spent $4.67M on cloud in the first nine months of FY2026');
[{ v: '$2.61M', l: 'Amazon Web Services', sub: 'Consumption $792K  ·  Marketplace $1.82M', c: P.gold },
 { v: '$2.05M', l: 'Microsoft Azure',     sub: 'Consumption $1.51M  ·  Marketplace $542K', c: P.blue },
 { v: '$14K',   l: 'Google Cloud',        sub: 'Started March 2026  ·  Vertex AI pilot', c: P.green }
].forEach((t, i) => stat(s, {
  x: M + i * ((CW - 0.5) / 3 + 0.25), y: TOP, w: (CW - 0.5) / 3, h: 1.62, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 34, valueH: 0.66, subH: 0.4, subSize: 11 }));

monthStrip(s, { x: M, y: TOP + 1.84, w: CW, labels: MON, values: DATA.tot });
s.addChart(pres.ChartType.bar, [
  { name: 'Azure', labels: MON, values: DATA.az_tot.map(v => +(v / 1000).toFixed(1)) },
  { name: 'AWS',   labels: MON, values: DATA.aws_tot.map(v => +(v / 1000).toFixed(1)) },
  { name: 'GCP',   labels: MON, values: DATA.gcp_tot.map(v => +(v / 1000).toFixed(1)) }
], Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: M - 0.12, y: TOP + 2.54, w: CW + 0.24, h: 2.2,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 42,
  chartColors: [P.blue, P.gold, P.green],
  valAxisMaxVal: 320, valAxisMajorUnit: 80, valAxisLabelFormatCode: '#,##0' }));
note(s, 'Consumption excludes Marketplace charges. AWS is billed across two payer accounts.');

// -------------------------------- 3. Azure overview, with the metric card
s = S();
head(s, 'Microsoft Azure', 'Azure has grown every month since February, up 26% on January',
     { accent: P.blue });
const tw3 = (CW - 0.5) / 3;
stat(s, { x: M, y: TOP, w: tw3, h: 1.78, accent: P.blue, value: '$1.51M',
  label: 'Consumption YTD', sub: '$167K average per month', valueSize: 32, valueH: 0.62,
  subH: 0.4, subSize: 11 });
metricCard(s, { x: M + tw3 + 0.25, y: TOP, w: tw3, h: 1.78, period: 'September 2026',
  value: DATA.az_tot[8], prev: DATA.az_tot[7], prevLabel: 'August', reported: REPORTED.azure,
  accent: P.gold });
stat(s, { x: M + 2 * (tw3 + 0.25), y: TOP, w: tw3, h: 1.78, accent: P.violet, value: '$542K',
  label: 'Marketplace YTD', sub: '93% of it is Databricks', valueSize: 32, valueH: 0.62,
  subH: 0.4, subSize: 11 });

monthStrip(s, { x: M, y: TOP + 2.0, w: 7.9, labels: MON, values: DATA.az_tot });
s.addChart(pres.ChartType.bar, [{
  name: 'Azure consumption', labels: MON, values: DATA.az_tot.map(v => +(v / 1000).toFixed(1))
}], Object.assign(axisBase(false), {
  x: M - 0.12, y: TOP + 2.72, w: 8.1, h: 2.0,
  barDir: 'col', barGapWidthPct: 48, chartColors: [P.blue],
  valAxisHidden: true, valAxisMaxVal: 235, showValue: false }));

panel(s, { x: 8.72, y: TOP + 2.0, w: CW - 8.1, h: 2.72 });
s.addText('What is driving it', { x: 9.0, y: TOP + 2.18, w: 3.5, h: 0.32, fontSize: 13, bold: true,
  color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
[['AI Factory', '$0.9K to $27.4K a month', P.violet],
 ['GitHub', '$6.5K to $28.4K since May', P.violet],
 ['CloudOps', '$0.3K to $11.3K from July', P.gold]].forEach((d, i) => {
  const y = TOP + 2.6 + i * 0.68;
  s.addShape('ellipse', { x: 9.0, y: y + 0.08, w: 0.1, h: 0.1, fill: { color: d[2] },
    line: { type: 'none' }, objectName: 'drv-dot-' + i });
  s.addText(d[0], { x: 9.2, y: y - 0.02, w: 3.3, h: 0.28, fontSize: 12, bold: true, color: P.navy,
    fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(d[1], { x: 9.2, y: y + 0.26, w: 3.3, h: 0.3, fontSize: 10.5, color: P.muted,
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
});
note(s, 'Consumption excludes Marketplace. DataCloud, SAP and CloudIT, which are 73% of Azure, were flat to down.');

// ------------------------------- 4. Azure pricing, adapted from the reference
s = S();
head(s, 'Azure pricing', 'Microsoft raises Azure prices on 1 February 2027', { accent: P.red });
const pc = [
  { l: 'Effective date', v: '1 Feb 2027', sub: 'Expected pricing change', c: P.red },
  { l: 'Monthly impact', v: '+$4,700',    sub: 'Estimated on September usage', c: P.gold },
  { l: 'Annual impact',  v: '+$56,400',   sub: 'Carry into 2027 budget planning', c: P.gold }
];
pc.forEach((t, i) => stat(s, {
  x: M + i * (tw3 + 0.25), y: TOP, w: tw3, h: 1.72, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 32, valueH: 0.66, subH: 0.4, subSize: 11 }));

[['On-demand virtual machines',
  'Approximately 25% increase for the v1 and v2 series. Reserved instances are priced at purchase, '
  + 'so buying the identified RI pipeline before February holds today’s rate.', P.red],
 ['Regional compute and storage',
  'West Europe, North Europe, France, Norway and Singapore, with some exceptions. Our regional '
  + 'exposure needs confirming against the resource inventory before the 2027 estimate is final.', P.gold]
].forEach((r, i) => {
  const y = TOP + 2.0 + i * 1.42;
  panel(s, { x: M, y: y, w: CW, h: 1.28, name: 'pc-' + i });
  s.addShape('ellipse', { x: M + 0.32, y: y + 0.34, w: 0.14, h: 0.14, fill: { color: r[2] },
    line: { type: 'none' }, objectName: 'pc-dot-' + i });
  s.addText(r[0], { x: M + 0.58, y: y + 0.2, w: 5.0, h: 0.4, fontSize: 15, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(r[1], { x: M + 0.58, y: y + 0.62, w: CW - 1.2, h: 0.56, fontSize: 12, color: P.muted,
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
});
note(s, 'Impact estimated on September consumption, as reported in the September source.');

// ---------------- 5. appendix reference slide in the merged format
s = S();
head(s, 'Appendix · Azure by cost centre', 'Three cost centres hold 73% of Azure spend',
     { accent: P.blue });
monthStrip(s, { x: M, y: TOP - 0.06, w: 7.9, labels: MON, values: DATA.az_tot });
s.addChart(pres.ChartType.bar,
  topN(DATA.az_cc, 5, 'All other centres').map(([n, v]) => ({
    name: ccName(n), labels: MON,
    values: v.map(x => +(x / 1000).toFixed(1)) })),
  Object.assign(axisBase(false), legendBase(false, 'b'), {
    x: M - 0.12, y: TOP + 0.66, w: 8.1, h: 3.78,
    barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 40,
    chartColors: [P.blue, P.slate, P.green, P.violet, '9FB3C8', P.grey],
    valAxisLabelFormatCode: '#,##0' }));
metricCard(s, { x: 8.72, y: TOP - 0.06, w: CW - 8.1, h: 1.78, period: 'September 2026',
  value: DATA.az_tot[8], prev: DATA.az_tot[7], prevLabel: 'August', reported: REPORTED.azure,
  accent: P.gold });
panel(s, { x: 8.72, y: TOP + 1.84, w: CW - 8.1, h: 2.6 });
s.addText('Year to date by cost centre', { x: 9.0, y: TOP + 2.02, w: 3.4, h: 0.3, fontSize: 12.5,
  bold: true, color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
rankList(s, { x: 9.0, y: TOP + 2.4, w: 3.44, rowH: 0.4, labelW: 1.72, valueW: 0.8, fontSize: 10,
  items: [['DataCloud', 437134, P.blue], ['SAP', 376507, P.slate], ['CloudIT', 280087, P.green],
          ['AI Factory', 143800, P.violet], ['Other', 124576, '9FB3C8']] });
note(s, 'Cost-centre shares here are computed from the monthly series. The pie on the source deck’s slide 10 uses a different basis and does not reconcile with its own bars.');

const OUT = path.join(__dirname, '..', '_sample_merged_style.pptx');
await pres.writeFile({ fileName: OUT });
await applyTheme(OUT, C.THEME);
console.log('wrote ' + OUT);
})().catch(e => { console.error(e); process.exit(1); });
