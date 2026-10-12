const C = require('./build_core.js');
const { DATA, A, P, M, CW, TOP, BOT, k, sum, topN, divider, ccName,
        head, note, stat, panel, chip, bulletRow, rankList, axisBase, legendBase } = C;
const MON = DATA.months;

module.exports = function (pres) {
const SEC = '04 Azure';
pres.addSection({ title: SEC });

// ---------------------------------------------------------------- divider
let s = pres.addSlide({ masterName: 'DIVIDER', sectionTitle: SEC });
divider(s, '04', 'Microsoft Azure',
  '$2.05M year to date — the largest metered estate, growing every month since February, and the home of the Databricks commitment.',
  P.blue);
s.addImage({ path: A + 'azure.png', x: 10.6, y: 2.2, w: 1.9, h: 1.06 });

// ---------------------------------------------------------------- at a glance
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Azure overview', 'Azure has grown every month since February — up 26% on January',
     { accent: P.blue });

const azTiles = [
  { v: '$1.51M', l: 'Consumption YTD', sub: '$167K average per month', c: P.blue },
  { v: '$198K',  l: 'September', sub: 'Highest month of the year', c: P.gold },
  { v: '$542K',  l: 'Marketplace YTD', sub: '93% of it is Databricks', c: P.violet }
];
const pw = (CW - 2 * 0.25) / 3;
azTiles.forEach((t, i) => stat(s, {
  x: M + i * (pw + 0.25), y: TOP, w: pw, h: 1.62, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 34, valueH: 0.66, subH: 0.4, subSize: 11
}));

s.addText('Monthly consumption  ($K)', {
  x: M, y: TOP + 1.9, w: 7.0, h: 0.3, fontSize: 13, bold: true, color: P.navy,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addChart(pres.ChartType.bar, [{
  name: 'Azure consumption', labels: MON, values: DATA.az_tot.map(v => +(v / 1000).toFixed(1))
}], Object.assign(axisBase(false), {
  x: M - 0.12, y: TOP + 2.24, w: 7.5, h: 2.5,
  barDir: 'col', barGapWidthPct: 48, chartColors: [P.blue],
  showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: P.navy,
  dataLabelFontSize: 10.5, dataLabelFormatCode: '#,##0',
  valAxisHidden: true, valAxisMaxVal: 235
}));

panel(s, { x: 8.42, y: TOP + 1.9, w: CW - 7.8, h: 2.84 });
s.addText('What is driving it', { x: 8.74, y: TOP + 2.1, w: 3.6, h: 0.32, fontSize: 13, bold: true,
  color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
const drv = [
  ['AI Factory', '$0.9K → $27.4K a month. The single biggest change.', P.violet],
  ['GitHub', '$6.5K → $28.4K since May, licences and AI credit.', P.violet],
  ['CloudOps', '$0.3K → $11.3K from July — new workloads landed.', P.gold]
];
drv.forEach((dv, i) => {
  const y = TOP + 2.5 + i * 0.76;
  s.addShape('ellipse', { x: 8.74, y: y + 0.08, w: 0.1, h: 0.1, fill: { color: dv[2] },
    line: { type: 'none' }, objectName: 'drv-dot-' + i });
  s.addText(dv[0], { x: 8.94, y: y - 0.02, w: 3.3, h: 0.28, fontSize: 12, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(dv[1], { x: 8.94, y: y + 0.26, w: 3.3, h: 0.52, fontSize: 10.5, color: P.muted,
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
});
note(s, 'Consumption excludes Marketplace. The three classic cost centres — DataCloud, SAP and CloudIT — were flat to down.');
s.addNotes('Azure is the growth engine, and the growth is concentrated in three places, two of which are AI.');

// ---------------------------------------------------------------- cost centres
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Azure by cost centre', 'Three cost centres hold 73% of Azure — AI Factory is the mover',
     { accent: P.blue });

const ccTop = topN(DATA.az_cc, 5, 'All other centres');
s.addChart(pres.ChartType.bar, ccTop.map(([n, v]) => ({
  name: ccName(n), labels: MON,
  values: v.map(x => +(x / 1000).toFixed(1))
})), Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: M - 0.12, y: TOP - 0.06, w: 7.9, h: 4.5,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 40,
  chartColors: [P.blue, P.slate, P.green, P.violet, '9FB3C8', P.grey],
  valAxisLabelFormatCode: '#,##0',
  valAxisTitle: '$K per month', showValAxisTitle: true,
  valAxisTitleColor: P.muted, valAxisTitleFontSize: 11, valAxisTitleFontFace: '+mn-lt'
}));

panel(s, { x: 8.72, y: TOP - 0.06, w: CW - 8.1, h: 4.5 });
s.addText('Year to date by cost centre', { x: 9.0, y: TOP + 0.16, w: 3.4, h: 0.32, fontSize: 13,
  bold: true, color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
rankList(s, {
  x: 9.0, y: TOP + 0.58, w: 3.44, rowH: 0.42, labelW: 1.72, valueW: 0.8, fontSize: 10,
  items: [
    ['DataCloud', 437134, P.blue], ['SAP', 376507, P.slate], ['CloudIT', 280087, P.green],
    ['AI Factory', 143800, P.violet], ['Other', 124576, '9FB3C8'], ['Actuary', 49304, P.grey],
    ['Risk Agility', 33689, P.grey], ['CloudOps', 29313, P.gold]
  ]
});
chip(s, { x: 9.0, y: TOP + 4.06, w: 3.44, h: 0.34, fill: 'F3F0FF', color: '4A33B5',
  text: 'AI Factory: $0.9K → $27.4K a month', fontSize: 10.5 });
note(s, 'DataCloud, SAP and CloudIT are stable; growth sits in AI Factory, CloudOps and the unallocated "other" bucket.');
s.addNotes('Note the other bucket at one hundred twenty five thousand — that is untagged spend, and '
  + 'closing it is the point of the tagging workstream.');

// ---------------------------------------------------------------- services
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Azure by service', 'Core infrastructure is 57% of Azure — and that is the lever',
     { accent: P.blue });

const svcTop = topN(DATA.az_svc, 5, 'All other services');
s.addChart(pres.ChartType.bar, svcTop.map(([n, v]) => ({
  name: n, labels: MON, values: v.map(x => +(x / 1000).toFixed(1))
})), Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: M - 0.12, y: TOP - 0.06, w: 7.9, h: 4.5,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 40,
  chartColors: [P.blue, P.slate, P.green, '9FB3C8', P.violet, P.grey],
  valAxisLabelFormatCode: '#,##0',
  valAxisTitle: '$K per month', showValAxisTitle: true,
  valAxisTitleColor: P.muted, valAxisTitleFontSize: 11, valAxisTitleFontFace: '+mn-lt'
}));

panel(s, { x: 8.72, y: TOP - 0.06, w: CW - 8.1, h: 4.5 });
s.addText('Year to date by service', { x: 9.0, y: TOP + 0.16, w: 3.4, h: 0.32, fontSize: 13,
  bold: true, color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
rankList(s, {
  x: 9.0, y: TOP + 0.58, w: 3.44, rowH: 0.42, labelW: 1.84, valueW: 0.8, fontSize: 10,
  items: [
    ['Virtual Machines', 484240, P.blue], ['Storage', 224255, P.slate],
    ['Virtual Network', 155620, P.green], ['Other services', 125454, '9FB3C8'],
    ['GitHub', 109559, P.violet], ['Databricks', 85565, P.gold],
    ['Foundry Models', 75971, P.violet], ['Foundry Tools', 43879, P.violet]
  ]
});
chip(s, { x: 9.0, y: TOP + 4.06, w: 3.44, h: 0.34, fill: 'E6F1FA', color: '0A4E7A',
  text: 'VMs alone are 32% of Azure spend', fontSize: 10.5 });
note(s, 'Virtual Machines, Storage and Virtual Network total $864K — the target for rightsizing, reservations and disk tiering.');
s.addNotes('This is the classic estate. It is not growing, and it is where the savings pipeline sits.');

// ---------------------------------------------------------------- coverage
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Compute coverage', 'AWS compute is 93% covered; Azure is only 54%',
     { accent: P.green });

const cov = [
  { t: 'AWS — EC2 compute, September', total: '$35,748', x: M,
    rows: [['Spot', 17416, 49, P.green], ['Compute Savings Plan', 15837, 44, P.blue],
           ['On-demand', 2495, 7, P.red]],
    covered: 93, logo: 'aws.png', lw: 1.0, lh: 0.61 },
  { t: 'Azure — virtual machines, September', total: '$55,576', x: M + 6.2,
    rows: [['On-demand', 25606, 46, P.red], ['Reservation', 20346, 37, P.blue],
           ['Compute Savings Plan', 9120, 16, P.green], ['Spot', 504, 1, P.gold]],
    covered: 54, logo: 'azure.png', lw: 0.88, lh: 0.49 }
];
cov.forEach((c0, ci) => {
  panel(s, { x: c0.x, y: TOP - 0.06, w: 5.89, h: 4.5, name: 'cov-' + ci });
  s.addText(c0.t, { x: c0.x + 0.32, y: TOP + 0.14, w: 4.3, h: 0.34, fontSize: 13.5, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addImage({ path: A + c0.logo, x: c0.x + 5.89 - 0.32 - c0.lw, y: TOP + 0.1, w: c0.lw, h: c0.lh });

  // 100% stacked coverage bar
  let cx = c0.x + 0.32;
  const barTotal = 5.25;
  c0.rows.forEach((r, i) => {
    const w = barTotal * (r[2] / 100);
    s.addShape('rect', { x: cx, y: TOP + 0.84, w: w, h: 0.44, fill: { color: r[3] },
      line: { type: 'none' }, objectName: 'cov-seg-' + ci + '-' + i });
    if (r[2] >= 10) s.addText(r[2] + '%', { x: cx, y: TOP + 0.84, w: w, h: 0.44, fontSize: 12,
      bold: true, color: 'FFFFFF', fontFace: 'Arial', align: 'center', valign: 'middle',
      margin: 0, isTextBox: true });
    cx += w;
  });
  c0.rows.forEach((r, i) => {
    const y = TOP + 1.56 + i * 0.52;
    s.addShape('ellipse', { x: c0.x + 0.32, y: y + 0.12, w: 0.14, h: 0.14, fill: { color: r[3] },
      line: { type: 'none' }, objectName: 'cov-dot-' + ci + '-' + i });
    s.addText(r[0], { x: c0.x + 0.56, y: y, w: 2.9, h: 0.38, fontSize: 12, color: P.navy,
      fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
    s.addText('$' + r[1].toLocaleString('en-US'), { x: c0.x + 3.5, y: y, w: 1.3, h: 0.38,
      fontSize: 12, bold: true, color: P.navy, fontFace: 'Arial', align: 'right',
      valign: 'middle', margin: 0, isTextBox: true });
    s.addText(r[2] + '%', { x: c0.x + 4.9, y: y, w: 0.67, h: 0.38, fontSize: 12, color: P.muted,
      fontFace: 'Arial', align: 'right', valign: 'middle', margin: 0, isTextBox: true });
  });
  const cy = TOP + 3.62;
  s.addText(c0.covered + '%', { x: c0.x + 0.32, y: cy, w: 1.5, h: 0.66, fontSize: 34, bold: true,
    color: c0.covered > 80 ? P.green : P.red, fontFace: 'Arial', align: 'left',
    valign: 'middle', margin: 0, isTextBox: true });
  s.addText('of compute is on a discounted\npurchase option', { x: c0.x + 1.9, y: cy, w: 3.6, h: 0.66,
    fontSize: 11.5, color: P.muted, fontFace: 'Arial', align: 'left', valign: 'middle',
    margin: 0, isTextBox: true });
  s.addText('Total ' + c0.total, { x: c0.x + 0.32, y: TOP + 0.46, w: 4.3, h: 0.28,
    fontSize: 11, color: P.muted, fontFace: 'Arial', align: 'left', valign: 'middle',
    margin: 0, isTextBox: true });
});
note(s, 'Closing the Azure gap is worth $47K a year in identified VM reservation purchases alone — see the savings pipeline.');
s.addNotes('If you remember one optimisation number, make it this one. Nearly half of Azure VM spend is '
  + 'still paying list price, where AWS is almost fully covered.');

// ---------------------------------------------------------------- databricks
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Databricks commitment', 'The $504K commitment is 29% used after five of thirty-six months',
     { accent: P.red });

panel(s, { x: M, y: TOP - 0.06, w: 7.5, h: 2.5 });
s.addText('Contract', { x: M + 0.34, y: TOP + 0.14, w: 3.0, h: 0.3, fontSize: 11, bold: true,
  charSpacing: 1.2, color: P.muted, fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
const ct = [['Purchased', '28 April 2026'], ['Term', '3 years (P3Y)'],
            ['Product', '600,000 Databricks DBU hours'], ['Prepaid', '$504,000 via Azure Marketplace']];
ct.forEach((r, i) => {
  const y = TOP + 0.52 + i * 0.44;
  s.addText(r[0], { x: M + 0.34, y: y, w: 1.7, h: 0.38, fontSize: 12, color: P.muted,
    fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(r[1], { x: M + 2.0, y: y, w: 5.1, h: 0.38, fontSize: 12.5, bold: true, color: P.navy,
    fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
});

// utilisation gauge
panel(s, { x: M, y: TOP + 2.62, w: 7.5, h: 1.82 });
s.addText('Cumulative utilisation at September 2026', { x: M + 0.34, y: TOP + 2.78, w: 5.0, h: 0.3,
  fontSize: 12, bold: true, color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
s.addShape('roundRect', { x: M + 0.34, y: TOP + 3.2, w: 6.82, h: 0.34, rectRadius: 0.17,
  fill: { color: 'DCE4ED' }, line: { type: 'none' }, objectName: 'db-gauge-bg' });
s.addShape('roundRect', { x: M + 0.34, y: TOP + 3.2, w: 6.82 * 0.29, h: 0.34, rectRadius: 0.17,
  fill: { color: P.red }, line: { type: 'none' }, objectName: 'db-gauge-fill' });
s.addText('29% of DBU hours consumed', { x: M + 0.34, y: TOP + 3.64, w: 4.0, h: 0.32, fontSize: 11.5,
  color: P.muted, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addText('14% of the term elapsed', { x: M + 4.4, y: TOP + 3.64, w: 2.76, h: 0.32, fontSize: 11.5,
  color: P.muted, fontFace: 'Arial', align: 'right', valign: 'middle', margin: 0, isTextBox: true });

const dbT = [
  { v: '$0', l: 'Databricks line cost', sub: 'All usage draws down the prepaid commitment', c: P.green },
  { v: 'Sep 2027', l: 'Projected exhaustion', sub: 'At the current burn rate — two years early', c: P.red },
  { v: '$21.5K', l: 'Supporting infra / month', sub: 'VMs, network and storage, outside the commitment', c: P.blue }
];
dbT.forEach((t, i) => stat(s, {
  x: 8.42, y: TOP - 0.06 + i * 1.57, w: CW - 7.8, h: 1.42, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 26, valueH: 0.58, subH: 0.46, subSize: 10.5
}));
note(s, 'Decision needed: top up the commitment in FY2027, or optimise the Classic / Serverless mix to extend it.');
s.addNotes('Burn is running twice as fast as the term. That is not necessarily wrong — it may just mean '
  + 'the commitment was sized conservatively — but it needs a decision before the FY2027 budget closes.');

// ---------------------------------------------------------------- GCP
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Google Cloud', 'GCP is a $14K pilot — small, but almost entirely AI', { accent: P.green });

const gcpTop = ['Vertex AI', 'Compute Engine', 'Networking', 'Gemini API', 'Support'];
s.addChart(pres.ChartType.bar, gcpTop.map(n => ({
  name: n, labels: MON, values: (DATA.gcp[n] || []).map(v => +(v).toFixed(0))
})), Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: M - 0.12, y: TOP - 0.06, w: 7.9, h: 4.5,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 44,
  chartColors: [P.green, P.blue, P.slate, P.violet, P.grey],
  valAxisLabelFormatCode: '$#,##0',
  valAxisTitle: '$ per month', showValAxisTitle: true,
  valAxisTitleColor: P.muted, valAxisTitleFontSize: 11, valAxisTitleFontFace: '+mn-lt'
}));
s.addImage({ path: A + 'gcp.png', x: 11.4, y: TOP + 0.06, w: 0.98, h: 0.92 });
const gTiles = [
  { v: '$13.5K', l: 'GCP YTD', sub: 'Started March 2026', c: P.green },
  { v: '52%',    l: 'Is Vertex AI + Gemini', sub: 'Vertex $6.5K, Gemini $0.6K', c: P.violet }
];
gTiles.forEach((t, i) => stat(s, {
  x: 8.72, y: TOP + 1.14 + i * 1.69, w: CW - 8.1, h: 1.55, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 28, valueH: 0.62, subH: 0.46, subSize: 10.5
}));
note(s, 'No commitment and no contract — GCP stays a pilot until a workload justifies a third platform. '
     + 'A negative "other services" line reflects credits applied during the pilot.');
s.addNotes('Fourteen thousand dollars. Worth a slide only because it is where Vertex and Gemini evaluation lives.');

};
