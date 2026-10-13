const C = require('./build_core.js');
const { DATA, A, P, M, CW, TOP, BOT, G, tileW, tileX, k, sum, topN, divider,
        head, note, stat, panel, chip, rankList, metricCard, monthStrip, REPORTED,
        axisBase, legendBase } = C;
const MON = DATA.months;

module.exports = function (pres) {
const SEC = '04 Azure';
pres.addSection({ title: SEC });

// ---------------------------------------------------------------- divider
let s = pres.addSlide({ masterName: 'DIVIDER', sectionTitle: SEC });
divider(s, '04', 'Microsoft Azure',
  '$2.05M year to date. The largest metered estate, growing every month since February, and the home of the Databricks commitment.',
  P.blue);

// ---------------------------------------------------------------- overview
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Azure overview', 'Azure has grown every month since February, up 26% on January',
     { accent: P.blue });

const tw = tileW(3);
stat(s, { x: tileX(0, 3), y: TOP, w: tw, h: 1.78, accent: P.blue, value: '$1.51M',
  label: 'Consumption YTD', sub: '$167K average per month', valueSize: 32, valueH: 0.62,
  subH: 0.4, subSize: 11 });
metricCard(s, { x: tileX(1, 3), y: TOP, w: tw, h: 1.78, accent: P.gold,
  period: 'September 2026', value: DATA.az_tot[8], prev: DATA.az_tot[7],
  prevLabel: 'August', reported: REPORTED.azure });
stat(s, { x: tileX(2, 3), y: TOP, w: tw, h: 1.78, accent: P.violet, value: '$542K',
  label: 'Marketplace YTD', sub: '93% of it is Databricks', valueSize: 32, valueH: 0.62,
  subH: 0.4, subSize: 11 });

monthStrip(s, { x: M, y: TOP + 2.0, w: 7.9, labels: MON, values: DATA.az_tot });
s.addChart(pres.ChartType.bar, [{
  name: 'Azure consumption', labels: MON, values: DATA.az_tot.map(v => +(v / 1000).toFixed(1))
}], Object.assign(axisBase(false), {
  x: G.chart.x, y: TOP + 2.72, w: 8.1, h: 2.0,
  barDir: 'col', barGapWidthPct: 48, chartColors: [P.blue],
  valAxisHidden: true, valAxisMaxVal: 235, showValue: false }));

panel(s, { x: 8.72, y: TOP + 2.0, w: CW - 8.1, h: 2.72 });
s.addText('What is driving it', { x: 9.0, y: TOP + 2.18, w: 3.5, h: 0.32, fontSize: 13, bold: true,
  color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
[['AI Factory', '$0.9K to $27.4K a month', P.violet],
 ['GitHub', '$6.5K to $28.4K since May', P.violet],
 ['CloudOps', '$0.3K to $11.3K from July', P.gold]
].forEach((d, i) => {
  const y = TOP + 2.6 + i * 0.68;
  s.addShape('ellipse', { x: 9.0, y: y + 0.08, w: 0.1, h: 0.1, fill: { color: d[2] },
    line: { type: 'none' }, objectName: 'drv-dot-' + i });
  s.addText(d[0], { x: 9.2, y: y - 0.02, w: 3.3, h: 0.28, fontSize: 12, bold: true, color: P.navy,
    fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(d[1], { x: 9.2, y: y + 0.26, w: 3.3, h: 0.3, fontSize: 10.5, color: P.muted,
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
});
note(s, 'Consumption excludes Marketplace. DataCloud, SAP and CloudIT, which are 73% of Azure, were flat to down.');
s.addNotes('Azure is where the growth is, and it sits in three places, two of which are AI. '
  + 'Cost centre and service detail is in the appendix.');

// ---------------------------------------------------------------- pricing
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Azure pricing', 'Microsoft raises Azure prices on 1 February 2027', { accent: P.red });
[{ l: 'Effective date', v: '1 Feb 2027', sub: 'Expected pricing change', c: P.red },
 { l: 'Monthly impact', v: '+$4,700',    sub: 'Estimated on September usage', c: P.gold },
 { l: 'Annual impact',  v: '+$56,400',   sub: 'Carry into 2027 budget planning', c: P.gold }
].forEach((t, i) => stat(s, {
  x: tileX(i, 3), y: TOP, w: tw, h: 1.72, accent: t.c,
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
s.addNotes('February is a hard date. Reservations lock the rate at purchase, which is why the '
  + 'reservation ask is time-bound rather than just a savings number.');

// ---------------------------------------------------------------- databricks
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Databricks commitment', 'The $504K commitment is 29% used after five of thirty-six months',
     { accent: P.red });

panel(s, { x: M, y: G.chart.y, w: 7.5, h: 2.5 });
s.addText('Contract', { x: M + 0.34, y: TOP + 0.14, w: 3.0, h: 0.3, fontSize: 11, bold: true,
  charSpacing: 1.2, color: P.muted, fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
[['Purchased', '28 April 2026'], ['Term', '3 years (P3Y)'],
 ['Product', '600,000 Databricks DBU hours'], ['Prepaid', '$504,000 via Azure Marketplace']
].forEach((r, i) => {
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
s.addText('29% of DBU hours consumed', { x: M + 0.34, y: TOP + 3.64, w: 4.0, h: 0.32,
  fontSize: 11.5, color: P.muted, fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
s.addText('14% of the term elapsed', { x: M + 4.4, y: TOP + 3.64, w: 2.76, h: 0.32, fontSize: 11.5,
  color: P.muted, fontFace: 'Arial', align: 'right', valign: 'middle', margin: 0, isTextBox: true });

[{ v: '$0', l: 'Databricks line cost', sub: 'All usage draws down the prepaid commitment', c: P.green },
 { v: 'Sep 2027', l: 'Projected exhaustion', sub: 'At the current rate, two years early', c: P.red },
 { v: '$21.5K', l: 'Supporting infra / month', sub: 'VMs, network and storage, outside the commitment', c: P.blue }
].forEach((t, i) => stat(s, {
  x: 8.42, y: G.chart.y + i * 1.57, w: CW - 7.8, h: 1.42, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 26, valueH: 0.58, subH: 0.46, subSize: 10.5 }));
note(s, 'Decision needed: top up the commitment in FY2027, or rebalance the Classic and Serverless mix to extend it.');
s.addNotes('Burn is running about twice as fast as the term. That may mean the commitment was sized '
  + 'conservatively, and the platform team should say which. Either way it needs a call before the '
  + 'FY2027 budget closes.');

};
