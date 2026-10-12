const C = require('./build_core.js');
const { DATA, A, P, SERIES, M, CW, TOP, BOT, CH, money, k, sum, topN, divider,
        head, note, stat, panel, chip, bulletRow, axisBase, legendBase } = C;
const MON = DATA.months;

module.exports = function (pres) {
const SEC = '02 AI and the Factory';
pres.addSection({ title: SEC });

// ===========================================================================
// DIVIDER
// ===========================================================================
let s = pres.addSlide({ masterName: 'DIVIDER', sectionTitle: SEC });
divider(s, '02', 'AI & the AI Factory',
  'Amazon Bedrock, Azure AI Foundry, Copilot and the AI Factory programme — $412K year to date and the only line that is growing.',
  P.violet);

// ===========================================================================
// AI SPEND 11x
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'AI spend', 'AI grew 11× in nine months and is now a third of the cloud bill',
     { accent: P.violet });

const aiOrder = ['Amazon Bedrock (Claude)', 'Azure AI Foundry', 'GitHub + Copilot',
                 'Copilot Studio', 'Cognitive Search', 'GCP Vertex + Gemini'];
s.addChart(pres.ChartType.bar, aiOrder.map(n => ({
  name: n, labels: MON, values: DATA.ai[n].map(v => +(v / 1000).toFixed(1))
})), Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: M - 0.12, y: TOP - 0.06, w: 8.1, h: 4.64,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 40,
  chartColors: [P.violet, P.blue, P.slate, P.green, P.gold, P.grey],
  valAxisLabelFormatCode: '#,##0',
  valAxisTitle: '$K per month', showValAxisTitle: true,
  valAxisTitleColor: P.muted, valAxisTitleFontSize: 11, valAxisTitleFontFace: '+mn-lt'
}));

const aiStats = [
  { v: '$412K', l: 'AI spend, YTD', sub: '18% of all consumption', c: P.violet },
  { v: '$102K', l: 'September alone', sub: 'vs $9K in January', c: P.gold },
  { v: '34%',   l: 'Of September spend', sub: 'was AI services', c: P.blue }
];
aiStats.forEach((t, i) => stat(s, {
  x: 8.9, y: TOP - 0.06 + i * 1.6, w: CW - 8.28, h: 1.44, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 28, valueH: 0.6, subH: 0.4, subSize: 11
}));
note(s, 'Bedrock is billed through AWS Marketplace; Foundry, Copilot Studio, Cognitive Search and GitHub through Azure.');
s.addNotes('Six platforms, one trend. Bedrock went from nothing in February to forty one thousand dollars in September. '
  + 'GitHub more than quadrupled since May.');

// ===========================================================================
// AI FACTORY
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'AI Factory', 'The AI Factory programme has consumed $246K across four projects',
     { accent: P.violet });

const proj = [
  ['Aifactory', 'AI Factory core', 138983, P.violet],
  ['Solugen', 'Solugen', 47247, P.blue],
  ['Document Intelligence (OCR Services)', 'Document Intelligence (OCR)', 43089, P.green],
  ['INSAIT', 'INSAIT', 16183, P.gold]
];
s.addChart(pres.ChartType.bar, proj.map(p0 => ({
  name: p0[1], labels: MON, values: (DATA.aif[p0[0]] || []).map(v => +(v / 1000).toFixed(1))
})), Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: M - 0.12, y: TOP - 0.06, w: 7.9, h: 4.64,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 40,
  chartColors: proj.map(p0 => p0[3]),
  valAxisLabelFormatCode: '#,##0',
  valAxisTitle: '$K per month', showValAxisTitle: true,
  valAxisTitleColor: P.muted, valAxisTitleFontSize: 11, valAxisTitleFontFace: '+mn-lt'
}));

panel(s, { x: 8.72, y: TOP - 0.06, w: CW - 8.1, h: 4.64 });
s.addText('Year to date by project', {
  x: 9.0, y: TOP + 0.18, w: 3.4, h: 0.32, fontSize: 13, bold: true, color: P.navy,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
proj.forEach((p0, i) => {
  const y = TOP + 0.66 + i * 0.84;
  s.addShape('ellipse', { x: 9.0, y: y + 0.1, w: 0.12, h: 0.12, fill: { color: p0[3] },
    line: { type: 'none' }, objectName: 'proj-dot-' + i });
  s.addText(p0[1], { x: 9.22, y: y, w: 2.3, h: 0.32, fontSize: 12, color: P.navy,
    fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(k(p0[2]), { x: 11.3, y: y, w: 1.08, h: 0.32, fontSize: 15, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'right', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(Math.round(p0[2] / 245502 * 100) + '% of programme', {
    x: 9.22, y: y + 0.3, w: 3.1, h: 0.28, fontSize: 10, color: P.muted,
    fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
});
s.addText('$246K', { x: 9.0, y: TOP + 4.0, w: 1.6, h: 0.44, fontSize: 24, bold: true,
  color: P.violet, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addText('total programme spend', { x: 10.6, y: TOP + 4.0, w: 1.8, h: 0.44, fontSize: 10.5,
  color: P.muted, fontFace: 'Arial', align: 'right', valign: 'middle', margin: 0, isTextBox: true });
note(s, 'AI Factory spend spans several Azure cost centres; project view is the planning unit, cost centre is the billing unit.');
s.addNotes('The Factory moved from fourteen thousand a month in January to eighty four thousand in September. '
  + 'Core AI Factory is more than half of it.');

// ===========================================================================
// BEDROCK / CLAUDE
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Amazon Bedrock', 'Bedrock reached $41K in September, with newer models taking over',
     { accent: P.violet });

const bedTop = ['Claude Opus 5', 'Claude Sonnet 4.6', 'Claude Opus 4.8', 'Claude Opus 4.6', 'Claude Opus 4.7'];
const bedOther = Object.keys(DATA.bedrock).filter(n => bedTop.indexOf(n) < 0);
const bedSeries = bedTop.map(n => ({ name: n, labels: MON,
  values: DATA.bedrock[n].map(v => +(v / 1000).toFixed(2)) }));
bedSeries.push({ name: 'Other models', labels: MON,
  values: MON.map((_, i) => +(sum(bedOther.map(n => DATA.bedrock[n][i])) / 1000).toFixed(2)) });

s.addChart(pres.ChartType.bar, bedSeries, Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: M - 0.12, y: TOP - 0.06, w: 7.9, h: 4.64,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 40,
  chartColors: [P.violet, P.blue, P.slate, '8FA7BF', P.gold, P.grey],
  valAxisLabelFormatCode: '#,##0',
  valAxisTitle: '$K per month', showValAxisTitle: true,
  valAxisTitleColor: P.muted, valAxisTitleFontSize: 11, valAxisTitleFontFace: '+mn-lt'
}));

const bedStats = [
  { v: '$128K', l: 'Bedrock YTD', sub: 'Billed via AWS Marketplace', c: P.violet },
  { v: '65%',   l: 'On latest models', sub: 'Opus 5 + Sonnet 4.6, September', c: P.blue },
  { v: '49×',   l: 'Growth since March', sub: '$0.8K → $41.1K per month', c: P.gold }
];
bedStats.forEach((t, i) => stat(s, {
  x: 8.72, y: TOP - 0.06 + i * 1.6, w: CW - 8.1, h: 1.44, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 28, valueH: 0.6, subH: 0.4, subSize: 10.5
}));
note(s, 'Model mix is shifting to Opus 5 and Sonnet 4.6 — a routing and governance decision as much as a cost one.');
s.addNotes('Worth noting the migration: older Opus versions are draining away and Opus 5 plus Sonnet 4.6 '
  + 'now carry two thirds of the spend. Routing cheaper work to Sonnet or Haiku is the main lever here.');

// ===========================================================================
// GITHUB & COPILOT
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'GitHub & Copilot', 'GitHub is now $28K a month, and AI credit is the fast part',
     { accent: P.violet });

s.addText('GitHub billed through Azure  ($K per month)', {
  x: M, y: TOP - 0.02, w: 6.0, h: 0.3, fontSize: 13, bold: true, color: P.navy,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addChart(pres.ChartType.bar, [{
  name: 'GitHub', labels: MON.slice(4),
  values: DATA.ai['GitHub + Copilot'].slice(4).map(v => +(v / 1000).toFixed(1))
}], Object.assign(axisBase(false), {
  x: M - 0.12, y: TOP + 0.32, w: 6.1, h: 2.5,
  barDir: 'col', barGapWidthPct: 58, chartColors: [P.violet],
  showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: P.navy,
  dataLabelFontSize: 11.5, dataLabelFormatCode: '$#,##0.0"K"',
  valAxisHidden: true, valAxisMaxVal: 34
}));

panel(s, { x: M, y: TOP + 2.98, w: 6.1, h: 1.6 });
s.addText('AI credit budget — enterprise harel-ins', {
  x: M + 0.28, y: TOP + 3.14, w: 5.5, h: 0.3, fontSize: 11.5, bold: true, color: P.navy,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addShape('roundRect', { x: M + 0.28, y: TOP + 3.56, w: 5.5, h: 0.26, rectRadius: 0.13,
  fill: { color: 'DCE4ED' }, line: { type: 'none' }, objectName: 'gauge-bg' });
s.addShape('roundRect', { x: M + 0.28, y: TOP + 3.56, w: 5.5 * 0.74, h: 0.26, rectRadius: 0.13,
  fill: { color: P.gold }, line: { type: 'none' }, objectName: 'gauge-fill' });
s.addText('$2,960 spent of $4,000  ·  74%', {
  x: M + 0.28, y: TOP + 3.92, w: 3.6, h: 0.3, fontSize: 11, color: P.muted,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
chip(s, { x: M + 4.2, y: TOP + 3.92, w: 1.58, h: 0.3, fill: 'E3F5EE', color: '046A4E',
  text: 'Hard stop enabled', fontSize: 9.5 });

// right column — invoice anatomy
s.addText('Anatomy of the GitHub bill  ·  June 2026 invoice', {
  x: 7.1, y: TOP - 0.02, w: 5.6, h: 0.3, fontSize: 13, bold: true, color: P.navy,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
const gh = [
  ['GitHub Enterprise', 3574, '~170 licences', P.blue],
  ['Copilot Business', 3044, '~160 licences', P.slate],
  ['AI credit (GAC)', 2149, '214,924 credits · 217 active users', P.violet]
];
gh.forEach((g, i) => {
  const y = TOP + 0.42 + i * 0.92;
  panel(s, { x: 7.1, y: y, w: 5.62, h: 0.8, name: 'gh-' + i });
  s.addShape('ellipse', { x: 7.36, y: y + 0.34, w: 0.12, h: 0.12, fill: { color: g[3] },
    line: { type: 'none' }, objectName: 'gh-dot-' + i });
  s.addText(g[0], { x: 7.58, y: y + 0.1, w: 3.2, h: 0.32, fontSize: 12.5, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(g[2], { x: 7.58, y: y + 0.42, w: 3.6, h: 0.3, fontSize: 10.5, color: P.muted,
    fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText('$' + g[1].toLocaleString('en-US'), { x: 11.0, y: y + 0.18, w: 1.46, h: 0.44,
    fontSize: 18, bold: true, color: P.navy, fontFace: 'Arial', align: 'right',
    valign: 'middle', margin: 0, isTextBox: true });
});
panel(s, { x: 7.1, y: TOP + 3.22, w: 5.62, h: 1.36, fill: 'F3F0FF' });
s.addText('Where the AI credit goes', {
  x: 7.36, y: TOP + 3.36, w: 5.1, h: 0.3, fontSize: 11.5, bold: true, color: '4A33B5',
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addText('Claude Opus 4.6 is 75% of all AI-credit consumption, and a single cost centre (HR) accounts for 73%. '
  + 'Model routing and a per-user quota of ~1,900 credits are the two levers.', {
  x: 7.36, y: TOP + 3.68, w: 5.1, h: 0.82, fontSize: 11, color: '3B3270',
  fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
note(s, 'Licensing is 75% of the GitHub bill and AI credit 25% — but the credit line is the one compounding.');
s.addNotes('Two different problems. Licences are a seat-count conversation. AI credit is a governance '
  + 'conversation — one model and one cost centre dominate it.');

// ===========================================================================
// AI GOVERNANCE
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Governance', 'Four controls to bring AI spend under the same discipline',
     { accent: P.violet });

const ctrl = [
  { n: 1, t: 'Tag every AI service', b: 'Complete resource tagging by Service, Application, Cost Centre and Environment — including AI Gateway and AWS Bedrock / Claude CLI — so AI can be charged back like any other service.', st: 'In progress', sc: P.gold, own: 'Ariel Oral' },
  { n: 2, t: 'Budgets with a hard stop', b: 'The GitHub AI-credit budget already stops usage at its ceiling. Extend the same pattern to Azure AI Foundry and Amazon Bedrock before the FY2027 ramp.', st: 'Planned', sc: P.blue, own: 'Cloud Infrastructure' },
  { n: 3, t: 'Model routing policy', b: 'Opus-class models carry two thirds of both Bedrock and GitHub AI spend. Define which workloads justify a frontier model and route the rest to Sonnet or Haiku tiers.', st: 'Proposed', sc: P.violet, own: 'AI Factory + FinOps' },
  { n: 4, t: 'Per-user and per-project quotas', b: 'Publish a monthly credit allowance per developer (~1,900) and a project-level ceiling, with consumption visible to the owning cost centre.', st: 'Proposed', sc: P.violet, own: 'AI Factory + FinOps' }
];
const cw2 = (CW - 0.3) / 2, chh = 2.3;
ctrl.forEach((c0, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = M + col * (cw2 + 0.3), y = TOP + row * (chh + 0.22);
  panel(s, { x: x, y: y, w: cw2, h: chh, name: 'ctrl-' + c0.n });
  s.addShape('ellipse', { x: x + 0.3, y: y + 0.3, w: 0.38, h: 0.38, fill: { color: c0.sc },
    line: { type: 'none' }, objectName: 'ctrl-badge-' + c0.n });
  s.addText(String(c0.n), { x: x + 0.3, y: y + 0.3, w: 0.38, h: 0.38, fontSize: 14, bold: true,
    color: 'FFFFFF', fontFace: 'Arial', align: 'center', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(c0.t, { x: x + 0.82, y: y + 0.28, w: cw2 - 1.1, h: 0.42, fontSize: 16, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(c0.b, { x: x + 0.82, y: y + 0.76, w: cw2 - 1.12, h: 1.06, fontSize: 12,
    color: P.muted, fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
  chip(s, { x: x + 0.82, y: y + 1.84, w: 1.2, h: 0.3, fill: c0.sc, text: c0.st, fontSize: 9.5 });
  s.addText('Owner: ' + c0.own, { x: x + 2.14, y: y + 1.84, w: cw2 - 2.44, h: 0.3, fontSize: 10.5,
    color: P.muted, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
});
s.addNotes('These four are what we need agreement on. Tagging is already running; the other three need a decision.');

};
