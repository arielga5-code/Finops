const C = require('./build_core.js');
const { DATA, A, P, SERIES, M, CW, TOP, BOT, CH, G, tileW, tileX,
        money, k, sum, topN, divider,
        head, note, stat, panel, chip, bulletRow, rankList, axisBase, legendBase } = C;
const MON = DATA.months;

module.exports = function (pres) {
const SEC = '02 AI and the AI Factory';
pres.addSection({ title: SEC });

// ===========================================================================
// DIVIDER
// ===========================================================================
let s = pres.addSlide({ masterName: 'DIVIDER', sectionTitle: SEC });
divider(s, '02', 'AI and the AI Factory',
  'Amazon Bedrock, Azure AI Foundry, Copilot and the AI Factory programme. $412K year to date, and the line that is growing fastest.',
  P.violet);

// ===========================================================================
// AI SPEND
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'AI spend', 'AI grew eleven-fold in nine months to a third of the cloud bill',
     { accent: P.violet });

const aiOrder = ['Amazon Bedrock (Claude)', 'Azure AI Foundry', 'GitHub + Copilot',
                 'Copilot Studio', 'Cognitive Search', 'GCP Vertex + Gemini'];
s.addChart(pres.ChartType.bar, aiOrder.map(n => ({
  name: n, labels: MON, values: DATA.ai[n].map(v => +(v / 1000).toFixed(1))
})), Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: G.chart.x, y: G.chart.y, w: 8.1, h: 4.64,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 40,
  chartColors: [P.violet, P.blue, P.slate, P.green, P.gold, P.grey],
  valAxisLabelFormatCode: '#,##0',
  valAxisTitle: '$K per month', showValAxisTitle: true,
  valAxisTitleColor: P.muted, valAxisTitleFontSize: 11, valAxisTitleFontFace: '+mn-lt'
}));

const aiStats = [
  { v: '$412K', l: 'AI spend, YTD', sub: '18% of all consumption', c: P.violet },
  { v: '$102K', l: 'September alone', sub: 'against $9K in January', c: P.gold },
  { v: '34%',   l: 'Of September spend', sub: 'was AI services', c: P.blue }
];
aiStats.forEach((t, i) => stat(s, {
  x: 8.9, y: G.chart.y + i * G.statRail.pitch, w: CW - 8.28, h: G.statRail.h, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 28, valueH: 0.6, subH: 0.4, subSize: 11
}));
note(s, 'Bedrock is billed through AWS Marketplace. Foundry, Copilot Studio, Cognitive Search and GitHub are billed through Azure.');
s.addNotes('Six platforms on one trend. Bedrock started in March and reached $41K by September. '
  + 'GitHub has more than quadrupled since May. Per-platform detail is in the appendix if anyone asks.');

// ===========================================================================
// GITHUB & COPILOT
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'GitHub and Copilot', 'GitHub reached $28K a month, with AI credit growing fastest',
     { accent: P.violet });

s.addText('GitHub billed through Azure  ($K per month)', {
  x: M, y: TOP - 0.02, w: 6.0, h: 0.3, fontSize: 13, bold: true, color: P.navy,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addChart(pres.ChartType.bar, [{
  name: 'GitHub', labels: MON.slice(4),
  values: DATA.ai['GitHub + Copilot'].slice(4).map(v => +(v / 1000).toFixed(1))
}], Object.assign(axisBase(false), {
  x: G.chart.x, y: TOP + 0.32, w: 6.1, h: 2.5,
  barDir: 'col', barGapWidthPct: 58, chartColors: [P.violet],
  showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: P.navy,
  dataLabelFontSize: 11.5, dataLabelFormatCode: '$#,##0.0"K"',
  valAxisHidden: true, valAxisMaxVal: 34
}));

panel(s, { x: M, y: TOP + 2.98, w: 6.1, h: 1.6 });
s.addText('AI credit budget, enterprise harel-ins', {
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

s.addText('Anatomy of the GitHub bill  ·  June 2026 invoice', {
  x: 7.1, y: TOP - 0.02, w: 5.6, h: 0.3, fontSize: 13, bold: true, color: P.navy,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
const gh = [
  ['GitHub Enterprise', 3574, 'about 170 licences', P.blue],
  ['Copilot Business', 3044, 'about 160 licences', P.slate],
  ['AI credit (GAC)', 2149, '214,924 credits, 217 active users', P.violet]
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
s.addText('Claude Opus 4.6 accounts for 75% of all AI-credit consumption, and one cost centre (HR) '
  + 'for 73% of it. Model routing and a per-user quota of about 1,900 credits are the two levers.', {
  x: 7.36, y: TOP + 3.68, w: 5.1, h: 0.82, fontSize: 11, color: '3B3270',
  fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
note(s, 'Licensing is 75% of the GitHub bill and AI credit 25%, but the credit line is the one compounding.');
s.addNotes('Two separate conversations. Licences are a seat count. AI credit is governance: one model '
  + 'and one cost centre dominate it. The hard stop on the budget is already working, which is the '
  + 'pattern we want to copy onto Foundry and Bedrock.');

// ===========================================================================
// GOVERNANCE
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Governance', 'Four controls to put AI spend under budget discipline',
     { accent: P.violet });

const ctrl = [
  { n: 1, t: 'Tag every AI service',
    b: 'Finish tagging resources by Service, Application, Cost Centre and Environment, including AI '
     + 'Gateway and AWS Bedrock, so AI can be charged back like any other service.',
    st: 'In progress', sc: P.gold, own: 'Ariel Oral' },
  { n: 2, t: 'Budgets with a hard stop',
    b: 'The GitHub AI-credit budget already stops usage at its ceiling. Apply the same pattern to '
     + 'Azure AI Foundry and Amazon Bedrock before the FY2027 ramp.',
    st: 'Planned', sc: P.blue, own: 'Cloud Infrastructure' },
  { n: 3, t: 'Model routing policy',
    b: 'Opus-class models carry about two thirds of both Bedrock and GitHub AI spend. Define which '
     + 'workloads justify a frontier model and route the rest to Sonnet or Haiku tiers.',
    st: 'Proposed', sc: P.violet, own: 'AI Factory and FinOps' },
  { n: 4, t: 'Quotas per user and per project',
    b: 'Publish a monthly credit allowance per developer, around 1,900, and a project-level ceiling, '
     + 'with consumption visible to the owning cost centre.',
    st: 'Proposed', sc: P.violet, own: 'AI Factory and FinOps' }
];
const cw2 = G.halfW, chh = 2.3;
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
s.addNotes('Tagging is already running. The other three need a decision, and they are what '
  + 'item 2 of the ask covers.');

};
