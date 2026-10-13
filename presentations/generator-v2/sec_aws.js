const C = require('./build_core.js');
const { DATA, A, P, M, CW, TOP, BOT, G, tileW, tileX, k, sum, topN, divider,
        head, note, stat, panel, chip, rankList, metricCard, monthStrip, REPORTED,
        axisBase, legendBase } = C;
const MON = DATA.months;

module.exports = function (pres) {
const SEC = '03 AWS';
pres.addSection({ title: SEC });

// ---------------------------------------------------------------- divider
let s = pres.addSlide({ masterName: 'DIVIDER', sectionTitle: SEC });
divider(s, '03', 'Amazon Web Services',
  '$2.61M year to date. $792K of metered consumption across two payer accounts, and $1.82M of Marketplace contracts.',
  P.gold);

// ---------------------------------------------------------------- overview
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'AWS overview', 'AWS consumption is flat; Marketplace contracts move the total',
     { accent: P.gold });

const tw = tileW(3);
stat(s, { x: tileX(0, 3), y: TOP, w: tw, h: 1.78, accent: P.gold, value: '$792K',
  label: 'Consumption YTD', sub: '$88K average per month', valueSize: 32, valueH: 0.62,
  subH: 0.4, subSize: 11 });
metricCard(s, { x: tileX(1, 3), y: TOP, w: tw, h: 1.78, accent: P.gold,
  period: 'September 2026', value: DATA.aws_tot[8], prev: DATA.aws_tot[7],
  prevLabel: 'August', reported: REPORTED.aws });
stat(s, { x: tileX(2, 3), y: TOP, w: tw, h: 1.78, accent: P.slate, value: '$1.82M',
  label: 'Marketplace YTD', sub: '70% of the AWS total', valueSize: 32, valueH: 0.62,
  subH: 0.4, subSize: 11 });

monthStrip(s, { x: M, y: TOP + 2.0, w: 7.9, labels: MON, values: DATA.aws_tot });
s.addChart(pres.ChartType.bar, [{
  name: 'AWS consumption', labels: MON, values: DATA.aws_tot.map(v => +(v / 1000).toFixed(1))
}], Object.assign(axisBase(false), {
  x: G.chart.x, y: TOP + 2.72, w: 8.1, h: 2.0,
  barDir: 'col', barGapWidthPct: 48, chartColors: [P.gold],
  valAxisHidden: true, valAxisMaxVal: 125, showValue: false }));

panel(s, { x: 8.72, y: TOP + 2.0, w: CW - 8.1, h: 2.72 });
s.addText('What moved', { x: 9.0, y: TOP + 2.18, w: 3.5, h: 0.32, fontSize: 13, bold: true,
  color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
[['July fell to $77K', 'A MAP credit of $15.3K on ai-factory-dev', P.green],
 ['August peaked at $107K', 'Glacier archive and customers3-prod', P.gold],
 ['September $101K', 'Steady, archive growth continues', P.blue]
].forEach((mv, i) => {
  const y = TOP + 2.6 + i * 0.68;
  s.addShape('ellipse', { x: 9.0, y: y + 0.08, w: 0.1, h: 0.1, fill: { color: mv[2] },
    line: { type: 'none' }, objectName: 'mv-dot-' + i });
  s.addText(mv[0], { x: 9.2, y: y - 0.02, w: 3.3, h: 0.28, fontSize: 12, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(mv[1], { x: 9.2, y: y + 0.26, w: 3.3, h: 0.3, fontSize: 10.5, color: P.muted,
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
});
note(s, 'Consumption excludes Marketplace. Charges span two payer accounts; the Harel IL payer is $166K of the total.');
s.addNotes('Metered AWS spend is flat at about $88K a month. The swings are credits and archive '
  + 'storage, not growth. Account and service breakdowns are in the appendix.');

// ---------------------------------------------------------- marketplace
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'AWS Marketplace', 'Two thirds of the AWS bill is contracts, not metered usage',
     { accent: P.gold });

s.addText('Marketplace and prepaid contracts by month  ($K)', {
  x: M, y: TOP - 0.02, w: 7.4, h: 0.3, fontSize: 13, bold: true, color: P.navy,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addChart(pres.ChartType.bar, [
  { name: 'AWS Marketplace', labels: MON, values: DATA.mp_tot.map(v => +(v / 1000).toFixed(1)) },
  { name: 'Azure Marketplace', labels: MON, values: DATA.amp_tot.map(v => +(v / 1000).toFixed(1)) }
], Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: G.chart.x, y: TOP + 0.34, w: 7.5, h: 4.2,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 42,
  chartColors: [P.gold, P.blue], valAxisLabelFormatCode: '#,##0' }));

s.addText('Largest contracts, year to date', {
  x: 8.42, y: TOP - 0.02, w: 4.0, h: 0.3, fontSize: 13, bold: true, color: P.navy,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
const contracts = [
  ['Databricks P3 pre-purchase', 504, P.red], ['Splunk', 365, P.slate],
  ['TrendAI security', 257, P.slate], ['MongoDB Atlas', 192, P.slate],
  ['CrowdStrike Falcon', 171, P.slate], ['F5 Distributed Cloud', 166, P.slate],
  ['JFrog, new in September', 158, P.gold], ['Amazon Bedrock', 128, P.violet]
];
contracts.forEach((c0, i) => {
  const y = TOP + 0.44 + i * 0.52;
  s.addText(c0[0], { x: 8.42, y: y, w: 2.62, h: 0.3, fontSize: 11, color: P.navy,
    fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addShape('rect', { x: 11.1, y: y + 0.075, w: Math.max((c0[1] / 504) * 1.26, 0.04), h: 0.15,
    fill: { color: c0[2] }, line: { type: 'none' }, objectName: 'ct-bar-' + i });
  s.addText('$' + c0[1] + 'K', { x: 12.42, y: y, w: 0.72, h: 0.3, fontSize: 10.5, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'right', valign: 'middle', margin: 0, isTextBox: true });
});
chip(s, { x: 8.42, y: TOP + 4.42, w: 4.3, h: 0.36, fill: 'FFF4DE', color: '8A5A00',
  text: '72% of Marketplace is security tooling', fontSize: 10.5 });
note(s, 'January and April carry the annual renewals. September is the new JFrog supply-chain contract. Vendor detail is in the appendix.');
s.addNotes('Lumpy by design, so month on month means little here. The planning point is that two '
  + 'thirds of the AWS bill is contracts we signed rather than usage we can tune, which makes it a '
  + 'procurement conversation.');

};
