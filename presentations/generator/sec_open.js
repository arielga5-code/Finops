const C = require('./build_core.js');
const { DATA, A, P, SERIES, M, CW, TOP, BOT, CH, G, tileW, tileX,
        money, k, sum, topN, divider,
        head, note, stat, panel, chip, bulletRow, rankList, axisBase, legendBase } = C;

const MON = DATA.months;

module.exports = function (pres) {

// ===========================================================================
// 1 — TITLE
// ===========================================================================
pres.addSection({ title: 'Opening' });
let s = pres.addSlide({ masterName: 'STATEMENT', sectionTitle: 'Opening' });

s.addText('HAREL INSURANCE & FINANCE   ·   CLOUD INFRASTRUCTURE, DEVOPS & DATABASES', {
  x: M, y: 1.45, w: 9.4, h: 0.36, fontSize: 12, bold: true, charSpacing: 1.8,
  color: '7FA8C9', fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true, objectName: 'eyebrow'
});
s.addText('Cloud Cost Summary', {
  x: M, y: 1.92, w: 9.6, h: 1.1, fontSize: 54, bold: true, color: 'FFFFFF',
  fontFace: 'Cambria', align: 'left', valign: 'middle', margin: 0,
  isTextBox: true, objectName: 'title'
});
s.addText('FY2026  ·  January to September', {
  x: M, y: 3.02, w: 9.6, h: 0.52, fontSize: 23, color: '9EC6E6', fontFace: 'Cambria',
  italic: true, align: 'left', valign: 'middle', margin: 0, isTextBox: true
});
s.addText('מחלקת תשתיות ענן, DevOps ובסיסי נתונים  ·  אגף טכנולוגיות והגנת הסייבר', {
  x: M, y: 3.66, w: 9.6, h: 0.4, fontSize: 14, color: 'A9BCCF', fontFace: 'Arial',
  rtlMode: true, align: 'left', valign: 'middle', margin: 0, isTextBox: true,
  objectName: 'dept-he'
});

const tFig = [
  { v: '$4.67M', l: 'Total cloud, YTD', c: P.blue },
  { v: '$578K',  l: 'Savings delivered', c: P.green },
  { v: '34%',    l: 'Of September spend is AI', c: P.violet }
];
tFig.forEach((f, i) => {
  const x = M + i * 3.15;
  s.addShape('ellipse', { x: x, y: 4.52, w: 0.1, h: 0.1, fill: { color: f.c },
    line: { type: 'none' }, objectName: 'fig-dot-' + i });
  s.addText(f.v, { x: x, y: 4.68, w: 3.0, h: 0.6, fontSize: 30, bold: true,
    color: 'FFFFFF', fontFace: 'Arial', align: 'left', valign: 'middle',
    margin: 0, isTextBox: true });
  s.addText(f.l, { x: x, y: 5.28, w: 2.95, h: 0.42, fontSize: 11.5, color: '8FA7BF',
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
});

// nine monthly columns of total consumption, as a quiet data motif
const mx = 10.35, my = 2.0, mw = 2.35, mh = 3.6;
const mmax = Math.max(...DATA.tot);
DATA.tot.forEach((v, i) => {
  const bh = (v / mmax) * mh;
  s.addShape('rect', {
    x: mx + i * (mw / 9), y: my + (mh - bh), w: (mw / 9) * 0.6, h: bh,
    fill: { color: i === 8 ? P.gold : '21466B' }, line: { type: 'none' },
    objectName: 'motif-' + i
  });
});
s.addText('MONTHLY CLOUD CONSUMPTION', {
  x: mx, y: my + mh + 0.14, w: mw + 0.4, h: 0.26, fontSize: 8.5, bold: true,
  charSpacing: 1.1, color: '6E8299', fontFace: 'Arial', align: 'left',
  valign: 'middle', margin: 0, isTextBox: true
});
s.addText('Jan to Sep 2026', {
  x: mx, y: my + mh + 0.38, w: mw + 0.4, h: 0.26, fontSize: 9, color: '55687E',
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true
});

s.addImage({ path: A + 'harel_light.png', x: 10.35, y: 6.42, w: 1.25, h: 0.54,
  altText: 'Harel Insurance and Finance logo' });
s.addText('September 2026', {
  x: 6.0, y: 6.5, w: 4.0, h: 0.36, fontSize: 11, color: '6E8299', fontFace: 'Arial',
  align: 'right', valign: 'middle', margin: 0, isTextBox: true
});
s.addNotes('Nine months of FY2026. Headline number is 4.67 million, of which 2.31 is metered usage '
  + 'and 2.36 is contracts we committed to up front. Two messages today: the savings programme is '
  + 'working on the existing estate, and AI has become the fastest growing line in the bill.');

// ===========================================================================
// 2 — THE BOTTOM LINE
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT_DARK', sectionTitle: 'Opening' });
head(s, 'The bottom line', 'Cloud spend is up 22% and all of the increase is AI',
     { dark: true, accent: P.violet });

const tiles = [
  { v: '$4.67M', l: 'Total cloud YTD', sub: 'Consumption $2.31M\nCommitted $2.36M', c: P.blue },
  { v: '+22%',   l: 'Consumption run-rate', sub: 'Q1 avg $238K/mo,\nQ3 avg $290K/mo', c: P.gold },
  { v: '–13%', l: 'Everything except AI', sub: 'Non-AI spend fell\nfrom Q1 to Q3', c: P.green },
  { v: '$578K',  l: 'Savings delivered', sub: 'Realised $268K,\navoided $310K', c: P.green }
];
tiles.forEach((t, i) => stat(s, {
  x: tileX(i, 4), y: TOP, w: tileW(4), h: 2.22, dark: true, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 36, valueH: 0.74, subH: 0.78, subSize: 11.5
}));

s.addText('THREE THINGS TO TAKE AWAY', {
  x: M, y: 4.18, w: CW, h: 0.3, fontSize: 10.5, bold: true, charSpacing: 1.6,
  color: '8FA7BF', fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true
});
const takeaways = [
  { n: 1, t: 'AI went from $9K to $102K a month',
    b: 'An eleven-fold rise in nine months. At the September rate that is $1.22M a year, and it is '
     + 'already a third of what we consume.', c: P.violet },
  { n: 2, t: 'The existing estate is shrinking',
    b: 'Take AI out and spend is down 13% from Q1 to Q3. Rightsizing, the reserved-instance purchases '
     + 'and the North Europe exit are all landing.', c: P.green },
  { n: 3, t: 'Two decisions are due before Q1',
    b: 'The Databricks commitment is 29% used after five months, and Azure raises prices in February. '
     + 'Both affect the 2027 budget.', c: P.gold }
];
const bw = (CW - 2 * 0.3) / 3;
takeaways.forEach((t, i) => {
  const x = M + i * (bw + 0.3);
  panel(s, { x: x, y: 4.56, w: bw, h: 1.94, fill: '112C45', name: 'takeaway-' + t.n });
  bulletRow(s, { x: x + 0.28, y: 4.78, w: bw - 0.56, n: t.n, title: t.t, body: t.b,
    accent: t.c, dark: true, titleSize: 14, titleH: 0.54, bodySize: 12, bodyH: 1.1 });
});
s.addNotes('Growth is real but it is concentrated. Everything we were asked to bring down is coming '
  + 'down. The new question is how we govern AI spend, and that is the back half of this deck.');

// ===========================================================================
// 3 — AGENDA
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Opening' });
head(s, 'Agenda', 'What we will cover');

const agenda = [
  { n: '01', t: 'Where the money goes', d: 'Total spend, run-rate, and the split between usage and commitments', c: P.blue },
  { n: '02', t: 'AI and the AI Factory', d: 'The fastest growing line: Bedrock, Foundry, Copilot and the governance gap', c: P.violet },
  { n: '03', t: 'The two platforms', d: 'AWS at $2.61M, Azure at $2.05M, compute coverage and Databricks', c: P.gold },
  { n: '04', t: 'Savings delivered', d: '$578K realised and avoided, with a further $190K identified', c: P.green },
  { n: '05', t: 'Risks and next steps', d: 'Azure 2027 pricing, Databricks utilisation, the FinOps workplan', c: P.red },
  { n: 'A',  t: 'Appendix', d: 'Account, service and cost-centre detail, plus notes on the figures', c: P.slate }
];
const aw = (CW - 0.42) / 2, ah = 1.52;
agenda.forEach((a, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = M + col * (aw + 0.42), y = TOP + row * (ah + 0.21);
  panel(s, { x: x, y: y, w: aw, h: ah, name: 'agenda-' + a.n });
  s.addText(a.n, { x: x + 0.3, y: y + 0.26, w: 1.0, h: 0.6, fontSize: 30, bold: true,
    color: a.c, fontFace: 'Cambria', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(a.t, { x: x + 1.26, y: y + 0.28, w: aw - 1.56, h: 0.42, fontSize: 17, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(a.d, { x: x + 1.26, y: y + 0.72, w: aw - 1.56, h: 0.62, fontSize: 12, color: P.muted,
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
});
note(s, 'About thirty minutes on sections 01 to 05, with the appendix held for questions.');

// ===========================================================================
// 4 — DIVIDER 01
// ===========================================================================
pres.addSection({ title: '01 Where the money goes' });
s = pres.addSlide({ masterName: 'DIVIDER', sectionTitle: '01 Where the money goes' });
divider(s, '01', 'Where the money goes',
  'Total spend, the monthly run-rate, and the split between what we consume and what we commit to in advance.',
  P.blue);

// ===========================================================================
// 5 — TOTAL SPEND
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '01 Where the money goes' });
head(s, 'Total cloud spend', 'Harel spent $4.67M on cloud in the first nine months of FY2026');

const provTiles = [
  { v: '$2.61M', l: 'Amazon Web Services', sub: 'Consumption $792K  ·  Marketplace $1.82M', c: P.gold },
  { v: '$2.05M', l: 'Microsoft Azure',     sub: 'Consumption $1.51M  ·  Marketplace $542K', c: P.blue },
  { v: '$14K',   l: 'Google Cloud',        sub: 'Started March 2026  ·  Vertex AI pilot', c: P.green }
];
provTiles.forEach((t, i) => stat(s, {
  x: tileX(i, 3), y: G.tileY, w: tileW(3), h: G.tileH, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 34, valueH: 0.66, subH: 0.4, subSize: 11
}));

s.addText('Monthly consumption by provider  ($K)', {
  x: M, y: G.subHeadY, w: 7.0, h: 0.32, fontSize: 13, bold: true, color: P.navy,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true
});
s.addChart(pres.ChartType.bar, [
  { name: 'Azure', labels: MON, values: DATA.az_tot.map(v => +(v / 1000).toFixed(1)) },
  { name: 'AWS',   labels: MON, values: DATA.aws_tot.map(v => +(v / 1000).toFixed(1)) },
  { name: 'GCP',   labels: MON, values: DATA.gcp_tot.map(v => +(v / 1000).toFixed(1)) }
], Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: G.lowChart.x, y: G.lowChart.y + 0.04, w: G.lowChart.w, h: G.lowChart.h,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 42,
  chartColors: [P.blue, P.gold, P.green],
  valAxisMaxVal: 320, valAxisMajorUnit: 80,
  valAxisLabelFormatCode: '#,##0',
  showValue: false
}));

panel(s, { x: G.lowPanel.x, y: G.lowPanel.y, w: G.lowPanel.w, h: G.lowPanel.h });
s.addText('Two different kinds of spend', {
  x: G.lowPanel.x + 0.32, y: G.lowPanel.y + 0.2, w: 3.6, h: 0.34, fontSize: 13, bold: true,
  color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
const reads = [
  ['Consumption  $2.31M', 'Metered usage. This is the part we can tune month to month.'],
  ['Committed  $2.36M', 'Marketplace and prepaid contracts, billed a few times a year.'],
  ['September was the peak', 'At $301K it was the highest consumption month of the year.']
];
reads.forEach((r, i) => {
  const y = G.lowPanel.y + 0.6 + i * 0.78;
  s.addShape('ellipse', { x: G.lowPanel.x + 0.32, y: y + 0.08, w: 0.1, h: 0.1,
    fill: { color: [P.blue, P.violet, P.gold][i] }, line: { type: 'none' },
    objectName: 'read-dot-' + i });
  s.addText(r[0], { x: G.lowPanel.x + 0.52, y: y - 0.02, w: 3.2, h: 0.28, fontSize: 12, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(r[1], { x: G.lowPanel.x + 0.52, y: y + 0.26, w: 3.3, h: 0.58, fontSize: 11, color: P.muted,
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
});
note(s, 'Consumption excludes Marketplace charges. AWS is billed across two payer accounts.');
s.addNotes('Two thirds of the AWS figure is Marketplace contracts rather than metered usage. That is '
  + 'why AWS looks bigger than Azure here when Azure is the larger running estate.');

// ===========================================================================
// 6 — AI VS THE REST
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '01 Where the money goes' });
head(s, 'Run-rate', 'AI is growing while the rest of the estate shrinks', { accent: P.violet });

const nonAI = DATA.tot.map((v, i) => v - DATA.ai_tot[i]);
s.addChart(pres.ChartType.line, [
  { name: 'AI services', labels: MON, values: DATA.ai_tot.map(v => +(v / 1000).toFixed(1)) },
  { name: 'Everything else', labels: MON, values: nonAI.map(v => +(v / 1000).toFixed(1)) }
], Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: G.chart.x, y: G.chart.y, w: 8.1, h: 4.6,
  chartColors: [P.violet, P.slate],
  lineSize: 3.6, lineSmooth: false,
  lineDataSymbol: 'circle', lineDataSymbolSize: 7,
  valAxisMaxVal: 260, valAxisMinVal: 0, valAxisMajorUnit: 65,
  valAxisLabelFormatCode: '#,##0',
  valAxisTitle: '$K per month', showValAxisTitle: true,
  valAxisTitleColor: P.muted, valAxisTitleFontSize: 11, valAxisTitleFontFace: '+mn-lt'
}));

const deltas = [
  { v: '+703%', l: 'AI services', sub: 'Q1 avg $12K/mo to Q3 avg $93K/mo', c: P.violet },
  { v: '–13%', l: 'Everything else', sub: 'Q1 avg $226K/mo to Q3 avg $196K/mo', c: P.green },
  { v: '$1.22M', l: 'AI annualised', sub: 'September run-rate times twelve', c: P.gold }
];
deltas.forEach((d, i) => stat(s, {
  x: 8.9, y: G.chart.y + i * G.statRail.pitch, w: CW - 8.28, h: G.statRail.h, accent: d.c,
  value: d.v, label: d.l, sub: d.sub, valueSize: 28, valueH: 0.6, subH: 0.42, subSize: 10.5
}));
note(s, 'AI services covers Amazon Bedrock, Azure AI Foundry, Copilot Studio, Azure Cognitive Search, GitHub Copilot and GCP Vertex and Gemini.');
s.addNotes('Purple is AI, grey is everything else. Without AI the bill would be falling. The likely '
  + 'question is whether we can slow it down, and the answer is the governance slide in section 02.');

// ===========================================================================
// 7 — COMMITTED PURCHASES
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '01 Where the money goes' });
head(s, 'Committed purchases', '$2.36M sits in Marketplace contracts billed a few times a year');

s.addText('Marketplace and prepaid contracts by month  ($K)', {
  x: M, y: TOP - 0.02, w: 7.4, h: 0.3, fontSize: 13, bold: true, color: P.navy,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addChart(pres.ChartType.bar, [
  { name: 'AWS Marketplace', labels: MON, values: DATA.mp_tot.map(v => +(v / 1000).toFixed(1)) },
  { name: 'Azure Marketplace', labels: MON, values: DATA.amp_tot.map(v => +(v / 1000).toFixed(1)) }
], Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: G.chart.x, y: TOP + 0.34, w: 7.5, h: 4.2,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 42,
  chartColors: [P.gold, P.blue],
  valAxisLabelFormatCode: '#,##0'
}));

s.addText('Largest contracts, year to date', {
  x: 8.42, y: TOP - 0.02, w: 4.0, h: 0.3, fontSize: 13, bold: true, color: P.navy,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
const contracts = [
  ['Databricks P3 pre-purchase', 504, P.red],
  ['Splunk', 365, P.slate],
  ['TrendAI security', 257, P.slate],
  ['MongoDB Atlas', 192, P.slate],
  ['CrowdStrike Falcon', 171, P.slate],
  ['F5 Distributed Cloud', 166, P.slate],
  ['JFrog, new in September', 158, P.gold],
  ['Amazon Bedrock', 128, P.violet]
];
const cmax = 504;
contracts.forEach((c0, i) => {
  const y = TOP + 0.44 + i * 0.52;
  s.addText(c0[0], { x: 8.42, y: y, w: 2.62, h: 0.3, fontSize: 11, color: P.navy,
    fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  const bw2 = (c0[1] / cmax) * 1.26;
  s.addShape('rect', { x: 11.1, y: y + 0.075, w: Math.max(bw2, 0.04), h: 0.15,
    fill: { color: c0[2] }, line: { type: 'none' }, objectName: 'ct-bar-' + i });
  s.addText('$' + c0[1] + 'K', { x: 12.42, y: y, w: 0.72, h: 0.3, fontSize: 10.5, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'right', valign: 'middle', margin: 0, isTextBox: true });
});
chip(s, { x: 8.42, y: TOP + 4.42, w: 4.3, h: 0.36, fill: 'FBE9EC', color: '9A1C2E',
  text: 'Databricks alone is 21% of committed spend', fontSize: 10.5 });
note(s, 'January and April carry the annual renewals. September is the new JFrog supply-chain contract.');
s.addNotes('Worth stressing that this is lumpy by design, so a month-on-month comparison means little. '
  + 'For planning, the number that matters is that two thirds of the AWS bill is contracts we signed, '
  + 'not usage we can tune. Vendor detail is in the appendix.');

};
