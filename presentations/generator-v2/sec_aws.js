const C = require('./build_core.js');
const { DATA, A, P, M, CW, TOP, BOT, k, sum, topN, divider,
        head, note, stat, panel, chip, bulletRow, rankList, axisBase, legendBase } = C;
const MON = DATA.months;

module.exports = function (pres) {
const SEC = '03 AWS';
pres.addSection({ title: SEC });

// ---------------------------------------------------------------- divider
let s = pres.addSlide({ masterName: 'DIVIDER', sectionTitle: SEC });
divider(s, '03', 'Amazon Web Services',
  '$2.61M year to date — $792K of metered consumption and $1.82M of Marketplace contracts across two payer accounts.',
  P.gold);
s.addImage({ path: A + 'aws.png', x: 10.5, y: 2.2, w: 2.1, h: 1.28 });

// ---------------------------------------------------------------- at a glance
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'AWS overview', 'AWS consumption is flat; Marketplace contracts move the total',
     { accent: P.gold });

const awsTiles = [
  { v: '$792K', l: 'Consumption YTD', sub: '$88K average per month', c: P.gold },
  { v: '$1.82M', l: 'Marketplace YTD', sub: '70% of the AWS total', c: P.slate },
  { v: '51%',   l: 'Is the Digital platform', sub: 'prod + preProd + devTest', c: P.blue }
];
const pw = (CW - 2 * 0.25) / 3;
awsTiles.forEach((t, i) => stat(s, {
  x: M + i * (pw + 0.25), y: TOP, w: pw, h: 1.62, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 34, valueH: 0.66, subH: 0.4, subSize: 11
}));

s.addText('Monthly consumption  ($K)', {
  x: M, y: TOP + 1.9, w: 7.0, h: 0.3, fontSize: 13, bold: true, color: P.navy,
  fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addChart(pres.ChartType.bar, [{
  name: 'AWS consumption', labels: MON, values: DATA.aws_tot.map(v => +(v / 1000).toFixed(1))
}], Object.assign(axisBase(false), {
  x: M - 0.12, y: TOP + 2.24, w: 7.5, h: 2.5,
  barDir: 'col', barGapWidthPct: 48, chartColors: [P.gold],
  showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: P.navy,
  dataLabelFontSize: 10.5, dataLabelFormatCode: '#,##0',
  valAxisHidden: true, valAxisMaxVal: 125
}));

panel(s, { x: 8.42, y: TOP + 1.9, w: CW - 7.8, h: 2.84 });
s.addText('What moved', { x: 8.74, y: TOP + 2.1, w: 3.6, h: 0.32, fontSize: 13, bold: true,
  color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
const moves = [
  ['July dipped to $77K', 'A MAP contract credit of $15.3K landed on ai-factory-dev.', P.green],
  ['August peaked at $107K', 'Glacier Deep Archive and customers3-prod both stepped up.', P.gold],
  ['September $101K', 'Steady; S3 archive growth continues.', P.blue]
];
moves.forEach((mv, i) => {
  const y = TOP + 2.5 + i * 0.76;
  s.addShape('ellipse', { x: 8.74, y: y + 0.08, w: 0.1, h: 0.1, fill: { color: mv[2] },
    line: { type: 'none' }, objectName: 'mv-dot-' + i });
  s.addText(mv[0], { x: 8.94, y: y - 0.02, w: 3.3, h: 0.28, fontSize: 12, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(mv[1], { x: 8.94, y: y + 0.26, w: 3.3, h: 0.52, fontSize: 10.5, color: P.muted,
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
});
note(s, 'Consumption excludes Marketplace. Charges span two payer accounts; the Harel IL payer is $166K of the total.');
s.addNotes('AWS metered spend is essentially flat at around ninety thousand a month. The swings are '
  + 'credits and archive storage, not growth.');

// ---------------------------------------------------------------- by account
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'AWS by account', 'The Digital platform is half of all AWS consumption', { accent: P.gold });

const acctTop = topN(DATA.aws_acct, 6, 'All other accounts');
s.addChart(pres.ChartType.bar, acctTop.map(([n, v]) => ({
  name: n, labels: MON, values: v.map(x => +(x / 1000).toFixed(1))
})), Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: M - 0.12, y: TOP - 0.06, w: 7.9, h: 4.5,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 40,
  chartColors: [P.gold, P.blue, P.green, P.violet, P.slate, '9FB3C8', P.grey],
  valAxisLabelFormatCode: '#,##0',
  valAxisTitle: '$K per month', showValAxisTitle: true,
  valAxisTitleColor: P.muted, valAxisTitleFontSize: 11, valAxisTitleFontFace: '+mn-lt'
}));

panel(s, { x: 8.72, y: TOP - 0.06, w: CW - 8.1, h: 4.5 });
s.addText('Year to date by account', { x: 9.0, y: TOP + 0.16, w: 3.4, h: 0.32, fontSize: 13,
  bold: true, color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
rankList(s, {
  x: 9.0, y: TOP + 0.58, w: 3.44, rowH: 0.42, labelW: 1.78, valueW: 0.76, fontSize: 10,
  items: [
    ['aws-prod-Digital', 198090, P.gold],
    ['aws-devTest-digital', 113975, P.gold],
    ['aws-preProd-digital', 94682, P.gold],
    ['foundation-security', 74403, P.blue],
    ['customers3-prod', 73927, P.green],
    ['cloudops-network', 62317, P.blue],
    ['Harel Insurance', 58542, P.violet],
    ['foundation-shared', 53810, P.blue]
  ]
});
chip(s, { x: 9.0, y: TOP + 4.06, w: 3.44, h: 0.34, fill: 'FFF4DE', color: '8A5A00',
  text: 'Top 3 Digital accounts = $407K', fontSize: 10.5 });
note(s, 'customers3-prod is the most volatile account — it swung between $0.9K and $13.5K a month.');
s.addNotes('Three Digital accounts carry half the bill. That is where rightsizing effort pays back fastest.');

// ---------------------------------------------------------------- by service
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'AWS by service', 'EC2 compute is 38% of the AWS bill — and already 93% covered',
     { accent: P.gold });

const svcTop = topN(DATA.aws_svc, 5, 'All other services');
s.addChart(pres.ChartType.bar, svcTop.map(([n, v]) => ({
  name: n.replace(' - ', ' · '), labels: MON, values: v.map(x => +(x / 1000).toFixed(1))
})), Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: M - 0.12, y: TOP - 0.06, w: 7.9, h: 4.5,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 40,
  chartColors: [P.gold, P.slate, P.blue, P.green, P.violet, P.grey],
  valAxisLabelFormatCode: '#,##0',
  valAxisTitle: '$K per month', showValAxisTitle: true,
  valAxisTitleColor: P.muted, valAxisTitleFontSize: 11, valAxisTitleFontFace: '+mn-lt'
}));

panel(s, { x: 8.72, y: TOP - 0.06, w: CW - 8.1, h: 4.5 });
s.addText('Year to date by service', { x: 9.0, y: TOP + 0.16, w: 3.4, h: 0.32, fontSize: 13,
  bold: true, color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
rankList(s, {
  x: 9.0, y: TOP + 0.58, w: 3.44, rowH: 0.42, labelW: 1.78, valueW: 0.76, fontSize: 10,
  items: [
    ['EC2 · Compute', 300443, P.gold],
    ['Business Support', 46086, P.slate],
    ['S3 · Glacier Archive', 40959, P.blue],
    ['VPC · Transit Gateway', 37565, P.blue],
    ['RDS · Compute', 35600, P.green],
    ['S3 · Storage', 34362, P.blue],
    ['Direct Connect', 33415, P.slate],
    ['CloudWatch Logs', 29092, P.violet]
  ]
});
chip(s, { x: 9.0, y: TOP + 4.06, w: 3.44, h: 0.34, fill: 'E3F5EE', color: '046A4E',
  text: 'S3 archive grew $0 → $12K a month', fontSize: 10.5 });
note(s, 'Glacier Deep Archive started in February and is now the third largest AWS service line — worth a retention review.');
s.addNotes('EC2 dominates but it is well covered by Spot and Savings Plans. The line to watch is '
  + 'Glacier Deep Archive, which went from zero to twelve thousand a month.');

// ---------------------------------------------------------------- marketplace
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'AWS Marketplace', 'Nine vendors carry 91% of the $1.82M Marketplace spend',
     { accent: P.gold });

rankList(s, {
  x: M, y: TOP + 0.1, w: 6.4, rowH: 0.56, labelW: 3.3, valueW: 0.95, fontSize: 11.5,
  items: [
    ['Splunk (private offer)', 365018, P.slate],
    ['TrendAI Enterprise Security', 257323, P.slate],
    ['MongoDB Atlas', 191812, P.blue],
    ['CrowdStrike Falcon', 171303, P.slate],
    ['F5 Distributed Cloud', 166293, P.slate],
    ['JFrog Supply Chain', 158259, P.gold],
    ['Cortex (private offer)', 142960, P.slate],
    ['Amazon Bedrock', 127904, P.violet],
    ['Trellix (private offer)', 70680, P.slate]
  ]
});

const mpTiles = [
  { v: '$1.82M', l: 'Marketplace YTD', sub: '70% of total AWS spend', c: P.gold },
  { v: '$158K',  l: 'New in September', sub: 'JFrog Software Supply Chain', c: P.violet },
  { v: '72%',    l: 'Is security tooling', sub: 'Splunk, TrendAI, CrowdStrike, F5,\nTrellix, Cortex, Fortinet', c: P.slate }
];
mpTiles.forEach((t, i) => stat(s, {
  x: 7.4, y: TOP + i * 1.6, w: CW - 6.78, h: 1.44, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 28, valueH: 0.6, subH: 0.46, subSize: 10.5
}));
note(s, 'Marketplace charges are billed as contracts, mostly annual, so monthly comparison is not meaningful.');
s.addNotes('Nearly three quarters of the Marketplace bill is security tooling bought through AWS. '
  + 'It is a procurement conversation more than a FinOps one — but it is the biggest single block of cloud spend we have.');

};
