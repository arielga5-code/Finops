const C = require('./build_core.js');
const { DATA, A, P, M, CW, TOP, BOT, G, tileW, tileX, k, sum, topN, divider, ccName,
        head, note, stat, panel, chip, bulletRow, rankList, axisBase, legendBase } = C;
const MON = DATA.months;

module.exports = function (pres) {
const SEC = '03 The two platforms';
pres.addSection({ title: SEC });

// ===========================================================================
// DIVIDER
// ===========================================================================
let s = pres.addSlide({ masterName: 'DIVIDER', sectionTitle: SEC });
divider(s, '03', 'The two platforms',
  'AWS at $2.61M and Azure at $2.05M year to date, how much of our compute is on a discounted rate, and the Databricks commitment.',
  P.gold);

// ===========================================================================
// AWS AT A GLANCE
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Amazon Web Services', 'AWS consumption is flat; Marketplace contracts move the total',
     { accent: P.gold });

const awsTiles = [
  { v: '$792K',  l: 'Consumption YTD', sub: '$88K average per month', c: P.gold },
  { v: '$1.82M', l: 'Marketplace YTD', sub: '70% of the AWS total', c: P.slate },
  { v: '51%',    l: 'Is the Digital platform', sub: 'prod, preProd and devTest', c: P.blue }
];
awsTiles.forEach((t, i) => stat(s, {
  x: tileX(i, 3), y: G.tileY, w: tileW(3), h: G.tileH, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 34, valueH: 0.66, subH: 0.4, subSize: 11
}));

s.addText('Monthly consumption  ($K)', {
  x: M, y: G.subHeadY, w: 7.0, h: 0.3, fontSize: 13, bold: true, color: P.navy,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addChart(pres.ChartType.bar, [{
  name: 'AWS consumption', labels: MON, values: DATA.aws_tot.map(v => +(v / 1000).toFixed(1))
}], Object.assign(axisBase(false), {
  x: G.lowChart.x, y: G.lowChart.y, w: G.lowChart.w, h: G.lowChart.h,
  barDir: 'col', barGapWidthPct: 48, chartColors: [P.gold],
  showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: P.navy,
  dataLabelFontSize: 10.5, dataLabelFormatCode: '#,##0',
  valAxisHidden: true, valAxisMaxVal: 125
}));

panel(s, { x: G.lowPanel.x, y: G.lowPanel.y, w: G.lowPanel.w, h: G.lowPanel.h });
s.addText('What moved', { x: G.lowPanel.x + 0.32, y: G.lowPanel.y + 0.2, w: 3.6, h: 0.32,
  fontSize: 13, bold: true, color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
const moves = [
  ['July fell to $77K', 'A MAP contract credit of $15.3K landed on ai-factory-dev.', P.green],
  ['August peaked at $107K', 'Glacier Deep Archive and customers3-prod both stepped up.', P.gold],
  ['September $101K', 'Steady. S3 archive growth continues.', P.blue]
];
moves.forEach((mv, i) => {
  const y = G.lowPanel.y + 0.6 + i * 0.76;
  s.addShape('ellipse', { x: G.lowPanel.x + 0.32, y: y + 0.08, w: 0.1, h: 0.1,
    fill: { color: mv[2] }, line: { type: 'none' }, objectName: 'mv-dot-' + i });
  s.addText(mv[0], { x: G.lowPanel.x + 0.52, y: y - 0.02, w: 3.3, h: 0.28, fontSize: 12, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(mv[1], { x: G.lowPanel.x + 0.52, y: y + 0.26, w: 3.3, h: 0.52, fontSize: 10.5,
    color: P.muted, fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
});
note(s, 'Consumption excludes Marketplace. Charges span two payer accounts; the Harel IL payer is $166K of the total.');
s.addNotes('Metered AWS spend is flat at about $88K a month. The swings are credits and archive '
  + 'storage, not growth. Account, service and vendor breakdowns are in the appendix.');

// ===========================================================================
// AZURE AT A GLANCE
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Microsoft Azure', 'Azure has grown every month since February, up 26% on January',
     { accent: P.blue });

const azTiles = [
  { v: '$1.51M', l: 'Consumption YTD', sub: '$167K average per month', c: P.blue },
  { v: '$198K',  l: 'September', sub: 'Highest month of the year', c: P.gold },
  { v: '$542K',  l: 'Marketplace YTD', sub: '93% of it is Databricks', c: P.violet }
];
azTiles.forEach((t, i) => stat(s, {
  x: tileX(i, 3), y: G.tileY, w: tileW(3), h: G.tileH, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 34, valueH: 0.66, subH: 0.4, subSize: 11
}));

s.addText('Monthly consumption  ($K)', {
  x: M, y: G.subHeadY, w: 7.0, h: 0.3, fontSize: 13, bold: true, color: P.navy,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addChart(pres.ChartType.bar, [{
  name: 'Azure consumption', labels: MON, values: DATA.az_tot.map(v => +(v / 1000).toFixed(1))
}], Object.assign(axisBase(false), {
  x: G.lowChart.x, y: G.lowChart.y, w: G.lowChart.w, h: G.lowChart.h,
  barDir: 'col', barGapWidthPct: 48, chartColors: [P.blue],
  showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: P.navy,
  dataLabelFontSize: 10.5, dataLabelFormatCode: '#,##0',
  valAxisHidden: true, valAxisMaxVal: 235
}));

panel(s, { x: G.lowPanel.x, y: G.lowPanel.y, w: G.lowPanel.w, h: G.lowPanel.h });
s.addText('What is driving it', { x: G.lowPanel.x + 0.32, y: G.lowPanel.y + 0.2, w: 3.6, h: 0.32,
  fontSize: 13, bold: true, color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
const drv = [
  ['AI Factory', '$0.9K to $27.4K a month, the largest single change.', P.violet],
  ['GitHub', '$6.5K to $28.4K since May, licences and AI credit.', P.violet],
  ['CloudOps', '$0.3K to $11.3K from July as new workloads landed.', P.gold]
];
drv.forEach((dv, i) => {
  const y = G.lowPanel.y + 0.6 + i * 0.76;
  s.addShape('ellipse', { x: G.lowPanel.x + 0.32, y: y + 0.08, w: 0.1, h: 0.1,
    fill: { color: dv[2] }, line: { type: 'none' }, objectName: 'drv-dot-' + i });
  s.addText(dv[0], { x: G.lowPanel.x + 0.52, y: y - 0.02, w: 3.3, h: 0.28, fontSize: 12, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(dv[1], { x: G.lowPanel.x + 0.52, y: y + 0.26, w: 3.3, h: 0.52, fontSize: 10.5,
    color: P.muted, fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
});
note(s, 'Consumption excludes Marketplace. DataCloud, SAP and CloudIT, which are 73% of Azure, were flat to down.');
s.addNotes('Azure is where the growth is, and it sits in three places, two of which are AI. '
  + 'Cost centre and service detail is in the appendix.');

// ===========================================================================
// COMPUTE COVERAGE
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Compute coverage', 'AWS compute is 93% covered; Azure is only 54%', { accent: P.green });

const cov = [
  { t: 'AWS, EC2 compute, September', total: '$35,748', x: M,
    rows: [['Spot', 17416, 49, P.green], ['Compute Savings Plan', 15837, 44, P.blue],
           ['On-demand', 2495, 7, P.red]],
    covered: 93, logo: 'aws.png', lw: 1.0, lh: 0.61, alt: 'Amazon Web Services logo' },
  { t: 'Azure, virtual machines, September', total: '$55,576', x: M + 6.2,
    rows: [['On-demand', 25606, 46, P.red], ['Reservation', 20346, 37, P.blue],
           ['Compute Savings Plan', 9120, 16, P.green], ['Spot', 504, 1, P.gold]],
    covered: 54, logo: 'azure.png', lw: 0.88, lh: 0.49, alt: 'Microsoft Azure logo' }
];
cov.forEach((c0, ci) => {
  panel(s, { x: c0.x, y: G.chart.y, w: 5.89, h: G.chart.h, name: 'cov-' + ci });
  s.addText(c0.t, { x: c0.x + 0.32, y: TOP + 0.14, w: 4.3, h: 0.34, fontSize: 13.5, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addImage({ path: A + c0.logo, x: c0.x + 5.89 - 0.32 - c0.lw, y: TOP + 0.1,
    w: c0.lw, h: c0.lh, altText: c0.alt });
  s.addText('Total ' + c0.total, { x: c0.x + 0.32, y: TOP + 0.46, w: 4.3, h: 0.28,
    fontSize: 11, color: P.muted, fontFace: 'Arial', align: 'left', valign: 'middle',
    margin: 0, isTextBox: true });

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
});
note(s, 'Closing the Azure gap is worth $47K a year in identified VM reservation purchases. See the savings pipeline in section 04.');
s.addNotes('If one optimisation number is worth remembering it is this. Nearly half of Azure VM spend '
  + 'still pays list price where AWS is almost fully covered. Reservations also lock the rate before '
  + 'the February price rise, which is why item 1 of the ask is time-bound.');

// ===========================================================================
// DATABRICKS
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Databricks commitment', 'The $504K commitment is 29% used after five of thirty-six months',
     { accent: P.red });

panel(s, { x: M, y: G.chart.y, w: 7.5, h: 2.5 });
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
  { v: 'Sep 2027', l: 'Projected exhaustion', sub: 'At the current rate, two years early', c: P.red },
  { v: '$21.5K', l: 'Supporting infra / month', sub: 'VMs, network and storage, outside the commitment', c: P.blue }
];
dbT.forEach((t, i) => stat(s, {
  x: 8.42, y: G.chart.y + i * 1.57, w: CW - 7.8, h: 1.42, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 26, valueH: 0.58, subH: 0.46, subSize: 10.5
}));
note(s, 'Decision needed: top up the commitment in FY2027, or rebalance the Classic and Serverless mix to extend it.');
s.addNotes('Burn is running about twice as fast as the term. That may simply mean the commitment was '
  + 'sized conservatively, and the platform team should say which. Either way it needs a call before '
  + 'the FY2027 budget closes.');

};
