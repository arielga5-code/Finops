const C = require('./build_core.js');
const { DATA, A, P, M, CW, TOP, BOT, G, tileW, tileX, k, sum, divider,
        head, note, stat, panel, chip, bulletRow, rankList, axisBase, legendBase } = C;

module.exports = function (pres) {
const SEC = '04 Savings delivered';
pres.addSection({ title: SEC });

// ===========================================================================
// DIVIDER
// ===========================================================================
let s = pres.addSlide({ masterName: 'DIVIDER', sectionTitle: SEC });
divider(s, '04', 'Savings delivered',
  '$578K realised and avoided so far this year, with a further $190K identified and waiting on approval.',
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
