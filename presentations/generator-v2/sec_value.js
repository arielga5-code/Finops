const C = require('./build_core.js');
const { DATA, A, P, M, CW, TOP, BOT, G, tileW, tileX, k, sum, divider,
        metricCard, monthStrip, REPORTED,
        head, note, stat, panel, chip, bulletRow, rankList, axisBase, legendBase } = C;

module.exports = function (pres) {
const SEC = '05 Savings and optimisation';
pres.addSection({ title: SEC });

// ===========================================================================
// DIVIDER
// ===========================================================================
let s = pres.addSlide({ masterName: 'DIVIDER', sectionTitle: SEC });
divider(s, '05', 'Savings and optimisation',
  '$578K realised and avoided so far this year, the compute coverage gap, and a further $190K identified and waiting on approval.',
  P.green);

// ===========================================================================
// SCORECARD
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT_DARK', sectionTitle: SEC });
head(s, 'Scorecard', 'The FinOps programme has returned $578K against FY2026',
     { dark: true, accent: P.green });

const score = [
  { v: '$268K', l: 'Realised savings', sub: 'Cost removed from the\nrunning bill', c: P.green },
  { v: '$310K', l: 'Cost avoided', sub: 'Increases caught before\nthey landed', c: P.blue },
  { v: '$578K', l: 'Total returned', sub: '25% of YTD metered\nconsumption', c: P.gold },
  { v: '$190K', l: 'Identified pipeline', sub: 'Approved actions not\nyet implemented', c: P.violet }
];
score.forEach((t, i) => stat(s, {
  x: tileX(i, 4), y: TOP, w: tileW(4), h: 2.1, dark: true, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 36, valueH: 0.74, subH: 0.7, subSize: 11.5
}));

s.addText('WHERE IT CAME FROM', { x: M, y: 4.18, w: CW, h: 0.3, fontSize: 10.5, bold: true,
  charSpacing: 1.6, color: '8FA7BF', fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
const src = [
  { n: 1, t: 'Decommissioning', b: 'Closing North Europe removed $70K a year of duplicated VMs, storage and gateways.', c: P.green },
  { n: 2, t: 'Commitments', b: 'VM reservations and a compute savings plan returned $132K a year between them.', c: P.blue },
  { n: 3, t: 'Alerting', b: 'Two spend alerts caught $291K of increases before they became permanent.', c: P.gold }
];
const bw = (CW - 2 * 0.3) / 3;
src.forEach((t, i) => {
  const x = M + i * (bw + 0.3);
  panel(s, { x: x, y: 4.52, w: bw, h: 1.72, fill: '112C45', name: 'src-' + t.n });
  bulletRow(s, { x: x + 0.28, y: 4.78, w: bw - 0.56, n: t.n, title: t.t, body: t.b,
    accent: t.c, dark: true, titleSize: 14, bodySize: 12, bodyH: 1.1 });
});
s.addNotes('$578K returned, which is a quarter of what we actually metered this year. Worth saying '
  + 'out loud that avoidance is not a reduction on any invoice, so finance will not see it as a credit.');

// ===========================================================================
// WHAT WE IMPLEMENTED
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'What we implemented', 'Five actions produced 94% of the $268K realised', { accent: P.green });

s.addText('Realised savings  ·  annualised', { x: M, y: TOP - 0.02, w: 5.6, h: 0.3, fontSize: 13,
  bold: true, color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
rankList(s, {
  x: M, y: TOP + 0.4, w: 5.9, rowH: 0.47, labelW: 3.5, valueW: 0.85, fontSize: 11,
  items: [
    ['Decommission North Europe', 70452, P.green],
    ['VM reserved instances (Azure)', 66783, P.green],
    ['Compute savings plan (Azure)', 65335, P.green],
    ['Removed unnecessary VMs', 28105, P.green],
    ['Idle unattached disks', 20576, P.green],
    ['RDS reserved instances (AWS)', 7944, P.gold],
    ['Unused SQL on expiring RI', 4563, P.blue],
    ['SageMaker account clean-up (AWS)', 2797, P.gold],
    ['App Service RI and RI refund', 1152, P.blue]
  ]
});
s.addText('Cost avoided  ·  annualised', { x: 7.0, y: TOP - 0.02, w: 5.6, h: 0.3, fontSize: 13,
  bold: true, color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
rankList(s, {
  x: 7.0, y: TOP + 0.4, w: 5.71, rowH: 0.47, labelW: 3.4, valueW: 0.85, fontSize: 11,
  items: [
    ['Alert on CloudWatch increase', 219000, P.blue],
    ['Alert on ongoing E1 increase', 71905, P.blue],
    ['RI renewal, blob storage', 9432, P.blue],
    ['EKS extended support, pre-prod', 8760, P.gold],
    ['RI renewal, Redis Cache', 876, P.blue]
  ]
});
panel(s, { x: 7.0, y: TOP + 3.1, w: 5.71, h: 1.34, fill: 'E6F1FA' });
s.addText('Why avoidance counts', { x: 7.28, y: TOP + 3.26, w: 5.1, h: 0.3, fontSize: 12, bold: true,
  color: '0A4E7A', fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addText('These are increases our monitoring caught and stopped before they reached an invoice. '
  + 'They never show as a reduction, but the budget would have carried them.', {
  x: 7.28, y: TOP + 3.58, w: 5.15, h: 0.76, fontSize: 11, color: '134B70', fontFace: 'Arial',
  align: 'left', valign: 'top', margin: 0, isTextBox: true });
note(s, 'All figures annualised. Realised $267,707 and avoided $309,973.');
s.addNotes('The North Europe exit, the reservations and the savings plan carry most of this. '
  + 'The right-hand column is alerting doing its job.');

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
  c0.rows.forEach((r, i) => {
    const w = 5.25 * (r[2] / 100);
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
  s.addText(c0.covered + '%', { x: c0.x + 0.32, y: TOP + 3.62, w: 1.5, h: 0.66, fontSize: 34,
    bold: true, color: c0.covered > 80 ? P.green : P.red, fontFace: 'Arial', align: 'left',
    valign: 'middle', margin: 0, isTextBox: true });
  s.addText('of compute is on a discounted\npurchase option', { x: c0.x + 1.9, y: TOP + 3.62,
    w: 3.6, h: 0.66, fontSize: 11.5, color: P.muted, fontFace: 'Arial', align: 'left',
    valign: 'middle', margin: 0, isTextBox: true });
});
note(s, 'Closing the Azure gap is worth $47K a year in identified VM reservation purchases, and reservations hold their rate through the February price rise.');
s.addNotes('If one optimisation number is worth remembering it is this. Nearly half of Azure VM '
  + 'spend still pays list price where AWS is almost fully covered. This is what item 1 of the ask buys.');

// ===========================================================================
// PIPELINE
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Savings pipeline', '$190K is identified and ready, 41% of it reservations',
     { accent: P.violet });

s.addText('By business unit', { x: M, y: TOP - 0.02, w: 5.6, h: 0.3, fontSize: 13, bold: true,
  color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
rankList(s, {
  x: M, y: TOP + 0.4, w: 5.9, rowH: 0.47, labelW: 3.3, valueW: 0.85, fontSize: 11.5,
  items: [
    ['SAP', 79989, P.violet], ['CloudIT', 35309, P.violet], ['AI Factory', 33961, P.violet],
    ['Data Cloud', 17851, P.blue], ['Actuary', 8002, P.blue], ['AWS (all accounts)', 7196, P.gold],
    ['Azure Sandbox', 4430, P.blue], ['CloudOps', 2130, P.blue], ['ITSec', 1173, P.blue]
  ]
});
s.addText('By type of action', { x: 7.0, y: TOP - 0.02, w: 5.6, h: 0.3, fontSize: 13, bold: true,
  color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
rankList(s, {
  x: 7.0, y: TOP + 0.4, w: 5.71, rowH: 0.47, labelW: 3.3, valueW: 0.85, fontSize: 11.5,
  items: [
    ['VM reserved instances', 47063, P.green], ['VM rightsizing', 30582, P.green],
    ['PostgreSQL reservations', 21296, P.green], ['Scheduled shutdown of 24/7 VMs', 24779, P.blue],
    ['Premium to standard disks', 21014, P.blue], ['Idle reserved disks', 13208, P.blue],
    ['AKS reservations', 9927, P.green], ['Idle unattached disks', 7265, P.blue],
    ['Other (AWS EC2, SQL, Redis)', 14907, P.gold]
  ]
});
note(s, 'Reservations and savings plans are $78K of the $190K, which needs a purchase decision rather than engineering time.');
s.addNotes('Roughly half of this is purchasing rather than engineering, so it can move quickly once '
  + 'approved. Buying the reservations before February also hedges the Azure price rise.');

};
