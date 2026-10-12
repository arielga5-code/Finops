const C = require('./build_core.js');
const { DATA, A, P, M, CW, TOP, BOT, G, tileW, tileX, k, sum, topN, divider, ccName,
        head, note, stat, panel, chip, rankList, axisBase, legendBase } = C;
const MON = DATA.months;

// Every appendix chart sits in the same frame with the same rail beside it.
function railChart(pres, s, series, colors, railTitle, items, chipOpts, axisOpts) {
  s.addChart(pres.ChartType.bar, series, Object.assign(axisBase(false), legendBase(false, 'b'), {
    x: G.chart.x, y: G.chart.y, w: G.chart.w, h: G.chart.h,
    barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 40,
    chartColors: colors,
    valAxisLabelFormatCode: '#,##0',
    valAxisTitle: '$K per month', showValAxisTitle: true,
    valAxisTitleColor: P.muted, valAxisTitleFontSize: 11, valAxisTitleFontFace: '+mn-lt'
  }, axisOpts || {}));
  panel(s, { x: G.rail.x, y: G.rail.y, w: G.rail.w, h: G.rail.h });
  s.addText(railTitle, { x: 9.0, y: G.railHeadY, w: 3.4, h: 0.32, fontSize: 13, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  rankList(s, { x: 9.0, y: G.railListY, w: 3.44, rowH: G.railRowH,
    labelW: 1.84, valueW: 0.8, fontSize: 10, items: items.slice(0, G.railRows) });
  if (chipOpts) chip(s, Object.assign({ x: 9.0, y: G.railChipY, w: 3.44, h: 0.34, fontSize: 10.5 }, chipOpts));
}

module.exports = function (pres) {
const SEC = 'Appendix';
pres.addSection({ title: SEC });

// ===========================================================================
// DIVIDER
// ===========================================================================
let s = pres.addSlide({ masterName: 'DIVIDER', sectionTitle: SEC });
divider(s, 'A', 'Appendix',
  'Account, service, cost-centre and project detail, the North Europe decommission, and notes on how these figures were produced.',
  P.slate);

// ===========================================================================
// AWS BY ACCOUNT
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · AWS by account', 'The Digital platform is half of all AWS consumption',
     { accent: P.gold });
railChart(pres, s,
  topN(DATA.aws_acct, 6, 'All other accounts').map(([n, v]) => ({
    name: n, labels: MON, values: v.map(x => +(x / 1000).toFixed(1)) })),
  [P.gold, P.blue, P.green, P.violet, P.slate, '9FB3C8', P.grey],
  'Year to date by account',
  [['aws-prod-Digital', 198090, P.gold], ['aws-devTest-digital', 113975, P.gold],
   ['aws-preProd-digital', 94682, P.gold], ['foundation-security', 74403, P.blue],
   ['customers3-prod', 73927, P.green], ['cloudops-network', 62317, P.blue],
   ['Harel Insurance', 58542, P.violet], ['foundation-shared', 53810, P.blue]],
  { fill: 'FFF4DE', color: '8A5A00', text: 'Top 3 Digital accounts = $407K' });
note(s, 'customers3-prod is the most volatile account, swinging between $0.9K and $13.5K a month.');

// ===========================================================================
// AWS BY SERVICE
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · AWS by service', 'EC2 compute is 38% of the AWS bill and 93% covered',
     { accent: P.gold });
railChart(pres, s,
  topN(DATA.aws_svc, 5, 'All other services').map(([n, v]) => ({
    name: n.replace(' - ', ' · '), labels: MON, values: v.map(x => +(x / 1000).toFixed(1)) })),
  [P.gold, P.slate, P.blue, P.green, P.violet, P.grey],
  'Year to date by service',
  [['EC2 · Compute', 300443, P.gold], ['Business Support', 46086, P.slate],
   ['S3 · Glacier Archive', 40959, P.blue], ['VPC · Transit Gateway', 37565, P.blue],
   ['RDS · Compute', 35600, P.green], ['S3 · Storage', 34362, P.blue],
   ['Direct Connect', 33415, P.slate], ['CloudWatch Logs', 29092, P.violet]],
  { fill: 'E3F5EE', color: '046A4E', text: 'S3 archive grew from $0 to $12K a month' });
note(s, 'Glacier Deep Archive started in February and is now the third largest AWS service line, which makes a retention review worthwhile.');

// ===========================================================================
// AWS MARKETPLACE
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · AWS Marketplace', 'Nine vendors carry 91% of the $1.82M Marketplace spend',
     { accent: P.gold });
rankList(s, {
  x: M, y: TOP + 0.06, w: 6.4, rowH: 0.52, labelW: 3.3, valueW: 0.95, fontSize: 11.5,
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
  x: 7.4, y: G.chart.y + 0.06 + i * G.statRail.pitch, w: CW - 6.78, h: G.statRail.h, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 28, valueH: 0.6, subH: 0.46, subSize: 10.5
}));
note(s, 'Marketplace charges are billed as contracts, mostly annual, so a month-on-month comparison is not meaningful.');

// ===========================================================================
// AWS HAREL IL PAYER
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · AWS Harel IL payer', 'The second AWS payer account is $166K year to date',
     { accent: P.gold });
railChart(pres, s,
  topN(DATA.harel_il, 5, 'All other services').map(([n, v]) => ({
    name: n.replace(' - ', ' · '), labels: MON, values: v.map(x => +(x / 1000).toFixed(1)) })),
  [P.blue, '9FB3C8', P.slate, P.green, P.gold, P.grey],
  'Year to date by service',
  [['S3 · Glacier Archive', 40959, P.blue], ['Other services', 31343, '9FB3C8'],
   ['Direct Connect', 29484, P.slate], ['Business Support', 16134, P.slate],
   ['EC2 · Compute', 11982, P.gold], ['S3 · API', 11477, P.blue],
   ['VPC Endpoints', 7918, P.green], ['Transit Gateway', 4572, P.green]],
  { fill: 'E6F1FA', color: '0A4E7A', text: 'Glacier Deep Archive is 25% of it' });
note(s, 'Included within the $792K AWS consumption total. The negative July bar is a MAP contract credit of $13.0K against other services.');

// ===========================================================================
// AZURE BY COST CENTRE
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · Azure by cost centre', 'Three cost centres hold 73% of Azure spend',
     { accent: P.blue });
railChart(pres, s,
  topN(DATA.az_cc, 5, 'All other centres').map(([n, v]) => ({
    name: ccName(n), labels: MON, values: v.map(x => +(x / 1000).toFixed(1)) })),
  [P.blue, P.slate, P.green, P.violet, '9FB3C8', P.grey],
  'Year to date by cost centre',
  [['DataCloud', 437134, P.blue], ['SAP', 376507, P.slate], ['CloudIT', 280087, P.green],
   ['AI Factory', 143800, P.violet], ['Other', 124576, '9FB3C8'], ['Actuary', 49304, P.grey],
   ['Risk Agility', 33689, P.grey], ['CloudOps', 29313, P.gold]],
  { fill: 'F3F0FF', color: '4A33B5', text: 'AI Factory: $0.9K to $27.4K a month' });
note(s, 'DataCloud, SAP and CloudIT are stable. Growth sits in AI Factory, CloudOps and the unallocated "other" bucket of $125K.');

// ===========================================================================
// AZURE BY SERVICE
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · Azure by service', 'Core infrastructure is 57% of Azure spend',
     { accent: P.blue });
railChart(pres, s,
  topN(DATA.az_svc, 5, 'All other services').map(([n, v]) => ({
    name: n, labels: MON, values: v.map(x => +(x / 1000).toFixed(1)) })),
  [P.blue, P.slate, P.green, '9FB3C8', P.violet, P.grey],
  'Year to date by service',
  [['Virtual Machines', 484240, P.blue], ['Storage', 224255, P.slate],
   ['Virtual Network', 155620, P.green], ['Other services', 125454, '9FB3C8'],
   ['GitHub', 109559, P.violet], ['Databricks', 85565, P.gold],
   ['Foundry Models', 75971, P.violet], ['Foundry Tools', 43879, P.violet]],
  { fill: 'E6F1FA', color: '0A4E7A', text: 'VMs alone are 32% of Azure spend' });
note(s, 'Virtual Machines, Storage and Virtual Network total $864K, which is where rightsizing, reservations and disk tiering apply.');

// ===========================================================================
// AZURE COST CENTRES, SMALL MULTIPLES
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · Azure cost centres', 'Every Azure cost centre, January to September',
     { accent: P.blue });

const ccs = Object.entries(DATA.az_cc).sort((a, b) => sum(b[1]) - sum(a[1]));
const gcols = 4, grows = 3;
const gw = (CW - (gcols - 1) * 0.22) / gcols, gh = (4.6 - (grows - 1) * 0.2) / grows;
ccs.slice(0, 12).forEach(([name, vals], i) => {
  const col = i % gcols, row = Math.floor(i / gcols);
  const x = M + col * (gw + 0.22), y = G.chart.y + row * (gh + 0.2);
  panel(s, { x: x, y: y, w: gw, h: gh, name: 'cc-' + name });
  s.addText(ccName(name), {
    x: x + 0.24, y: y + 0.14, w: gw - 1.26, h: 0.3, fontSize: 12, bold: true, color: P.navy,
    fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(sum(vals) >= 1000 ? k(sum(vals)) : '$' + (sum(vals) / 1000).toFixed(1) + 'K', {
    x: x + gw - 1.2, y: y + 0.14, w: 0.96, h: 0.3, fontSize: 13, bold: true,
    color: P.blue, fontFace: 'Arial', align: 'right', valign: 'middle', margin: 0, isTextBox: true });
  const mx = Math.max(...vals) || 1;
  const sx = x + 0.24, sy = y + 0.56, sw = gw - 0.48, sh = gh - 0.78;
  vals.forEach((v, j) => {
    const bh = Math.max((v / mx) * sh, 0.02);
    s.addShape('rect', { x: sx + j * (sw / 9), y: sy + (sh - bh), w: (sw / 9) * 0.64, h: bh,
      fill: { color: j === 8 ? P.gold : 'A8C0D6' }, line: { type: 'none' },
      objectName: 'spark-' + i + '-' + j });
  });
  s.addText('Jan', { x: sx, y: y + gh - 0.26, w: 0.6, h: 0.2, fontSize: 7.5, color: P.dimText,
    fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText('Sep', { x: sx + sw - 0.6, y: y + gh - 0.26, w: 0.6, h: 0.2, fontSize: 7.5,
    color: P.dimText, fontFace: 'Arial', align: 'right', valign: 'middle', margin: 0, isTextBox: true });
});
note(s, 'Each sparkline is scaled to its own maximum and September is highlighted. Totals are year to date.');

// ===========================================================================
// AI FACTORY
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · AI Factory', 'The AI Factory programme has consumed $246K across four projects',
     { accent: P.violet });

const proj = [
  ['Aifactory', 'AI Factory core', 138983, P.violet],
  ['Solugen', 'Solugen', 47247, P.blue],
  ['Document Intelligence (OCR Services)', 'Document Intelligence (OCR)', 43089, P.green],
  ['INSAIT', 'INSAIT', 16183, P.gold]
];
railChart(pres, s,
  proj.map(p0 => ({ name: p0[1], labels: MON,
    values: (DATA.aif[p0[0]] || []).map(v => +(v / 1000).toFixed(1)) })),
  proj.map(p0 => p0[3]),
  'Year to date by project',
  proj.map(p0 => [p0[1], p0[2], p0[3]]),
  { fill: 'F3F0FF', color: '4A33B5', text: 'Programme total $246K year to date' });
note(s, 'AI Factory spend spans several Azure cost centres. The project view is the planning unit; the cost centre is the billing unit.');

// ===========================================================================
// BEDROCK
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · Amazon Bedrock', 'Bedrock reached $41K in September as newer models took over',
     { accent: P.violet });

const bedTop = ['Claude Opus 5', 'Claude Sonnet 4.6', 'Claude Opus 4.8', 'Claude Opus 4.6', 'Claude Opus 4.7'];
const bedOther = Object.keys(DATA.bedrock).filter(n => bedTop.indexOf(n) < 0);
const bedSeries = bedTop.map(n => ({ name: n, labels: MON,
  values: DATA.bedrock[n].map(v => +(v / 1000).toFixed(2)) }));
bedSeries.push({ name: 'Other models', labels: MON,
  values: MON.map((_, i) => +(sum(bedOther.map(n => DATA.bedrock[n][i])) / 1000).toFixed(2)) });
railChart(pres, s, bedSeries,
  [P.violet, P.blue, P.slate, '8FA7BF', P.gold, P.grey],
  'Year to date by model',
  Object.entries(DATA.bedrock).sort((a, b) => sum(b[1]) - sum(a[1])).slice(0, 8)
    .map(([n, v]) => [n.replace('Claude ', ''), sum(v), P.violet]),
  { fill: 'F3F0FF', color: '4A33B5', text: 'Opus 5 and Sonnet 4.6 are 65% of September' });
note(s, 'Billed through AWS Marketplace. The shift to Opus 5 and Sonnet 4.6 is a routing decision as much as a cost one.');

// ===========================================================================
// FOUNDRY
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · AI Foundry', 'Foundry models and tools: $120K across 37 SKUs',
     { accent: P.violet });
railChart(pres, s,
  topN(DATA.foundry, 5, 'All other SKUs').map(([n, v]) => ({
    name: n, labels: MON, values: v.map(x => +(x / 1000).toFixed(1)) })),
  [P.violet, P.blue, P.green, P.gold, P.slate, P.grey],
  'Largest SKUs, year to date',
  Object.entries(DATA.foundry).sort((a, b) => sum(b[1]) - sum(a[1])).slice(0, 8)
    .map(([n, v]) => [n, sum(v), P.violet]));
note(s, 'Document-intelligence page SKUs (S0 Custom, Pre-built and Add-on) and the 5.4 model family account for most of the spend.');

// ===========================================================================
// GCP
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · Google Cloud', 'GCP is a $14K pilot and almost entirely AI', { accent: P.green });

const gcpTop = ['Vertex AI', 'Compute Engine', 'Networking', 'Gemini API', 'Support'];
s.addChart(pres.ChartType.bar, gcpTop.map(n => ({
  name: n, labels: MON, values: (DATA.gcp[n] || []).map(v => +(v).toFixed(0))
})), Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: G.chart.x, y: G.chart.y, w: G.chart.w, h: G.chart.h,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 44,
  chartColors: [P.green, P.blue, P.slate, P.violet, P.grey],
  valAxisLabelFormatCode: '$#,##0',
  valAxisTitle: '$ per month', showValAxisTitle: true,
  valAxisTitleColor: P.muted, valAxisTitleFontSize: 11, valAxisTitleFontFace: '+mn-lt'
}));
s.addImage({ path: A + 'gcp.png', x: 11.4, y: TOP + 0.06, w: 0.98, h: 0.92,
  altText: 'Google Cloud logo' });
[ { v: '$13.5K', l: 'GCP YTD', sub: 'Started March 2026', c: P.green },
  { v: '52%',    l: 'Is Vertex AI and Gemini', sub: 'Vertex $6.5K, Gemini $0.6K', c: P.violet }
].forEach((t, i) => stat(s, {
  x: G.rail.x, y: TOP + 1.14 + i * 1.69, w: G.rail.w, h: 1.55, accent: t.c,
  value: t.v, label: t.l, sub: t.sub, valueSize: 28, valueH: 0.62, subH: 0.46, subSize: 10.5
}));
note(s, 'No commitment and no contract. GCP stays a pilot until a workload justifies a third platform. A negative "other services" line reflects credits applied during the pilot.');

// ===========================================================================
// NORTH EUROPE
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · North Europe exit', 'Decommissioning North Europe removed $5,871 a month',
     { accent: P.green });

const ne = [
  ['Virtual Machines', 154, 1661, 550, 2365], ['Storage', 7, 1868, 109, 1984],
  ['VPN Gateway', 930, 0, 0, 930], ['Azure Site Recovery', 0, 0, 200, 200],
  ['Azure DNS', 180, 0, 0, 180], ['Virtual Network', 18, 70, 3, 91],
  ['Bandwidth', 25, 3, 9, 37], ['NAT Gateway', 35, 0, 0, 35],
  ['Microsoft Defender for Cloud', 30, 0, 0, 30], ['Load Balancer', 19, 0, 0, 19],
  ['Automation', 0, 0, 0, 0]
];
const cols = [3.0, 1.6, 1.9, 2.05, 1.2];
const colX = []; let cx = M; cols.forEach(w => { colX.push(cx); cx += w; });
['Service', 'Prod', 'SAP Production', 'Shared Resources', 'Total'].forEach((h0, i) => s.addText(h0, {
  x: colX[i], y: G.chart.y, w: cols[i] - 0.14, h: 0.34, fontSize: 10.5, bold: true,
  charSpacing: 0.8, color: P.muted, fontFace: 'Arial', align: i === 0 ? 'left' : 'right',
  valign: 'middle', margin: 0, isTextBox: true }));
ne.forEach((r, i) => {
  const y = TOP + 0.34 + i * 0.355;
  if (i % 2 === 0) panel(s, { x: M - 0.1, y: y, w: 9.86, h: 0.345, fill: 'F6F8FB', name: 'ne-' + i });
  r.forEach((cell, j) => s.addText(
    j === 0 ? cell : (cell ? '$' + cell.toLocaleString('en-US') : '—'), {
      x: colX[j], y: y, w: cols[j] - 0.14, h: 0.345, fontSize: 11,
      color: j === 4 ? P.navy : P.muted, bold: j === 4,
      fontFace: 'Arial', align: j === 0 ? 'left' : 'right', valign: 'middle',
      margin: 0, isTextBox: true }));
});
const ty = TOP + 0.34 + ne.length * 0.355 + 0.06;
panel(s, { x: M - 0.1, y: ty, w: 9.86, h: 0.42, fill: 'E3F5EE' });
[['Monthly total', 'left'], ['$1,397', 'right'], ['$3,601', 'right'], ['$872', 'right'], ['$5,871', 'right']]
  .forEach((cell, j) => s.addText(cell[0], {
    x: colX[j], y: ty, w: cols[j] - 0.14, h: 0.42, fontSize: 11.5, bold: true, color: '046A4E',
    fontFace: 'Arial', align: cell[1], valign: 'middle', margin: 0, isTextBox: true }));
stat(s, { x: 10.5, y: TOP + 0.34, w: 2.21, h: 1.5, accent: P.green,
  value: '$70K', label: 'Annualised', sub: '$5,871 times twelve', valueSize: 30, valueH: 0.62,
  subH: 0.34, subSize: 10.5 });
note(s, 'The largest single realised saving of FY2026. Figures are the final month of North Europe consumption.');

// ===========================================================================
// NOTES
// ===========================================================================
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · Notes', 'How these figures were produced', { accent: P.slate });

const notes = [
  ['Period and currency', 'All figures cover 1 January to 30 September 2026, nine months, stated in US dollars.'],
  ['Consumption and committed', '"Consumption" is metered usage. Marketplace and prepaid contracts are reported separately and excluded from consumption totals unless stated.'],
  ['AWS payers', 'AWS is billed across two payer accounts. The Harel IL payer is $166K of the $792K consumption total.'],
  ['Azure Marketplace', 'Marketplace charges sit under the Shared Resources subscription.'],
  ['Savings basis', 'Realised savings and cost avoidance are annualised run-rate impacts at the point of implementation, not year-to-date cash.'],
  ['AI definition', 'AI services covers Amazon Bedrock, Azure AI Foundry models and tools, Microsoft Copilot Studio, Azure Cognitive Search, GitHub and Copilot, and GCP Vertex AI and Gemini.'],
  ['Sources', 'AWS Cost Explorer, Azure Cost Management, Google Cloud Billing and the GitHub billing portal, extracted for the September 2026 review.'],
  ['Open reconciliation', 'Azure Marketplace sums to $542K here against $563K quoted in earlier reporting. The $21K difference is under review and does not affect the consumption figures.']
];
const nw = (CW - 0.32) / 2;
notes.forEach((n0, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = M + col * (nw + 0.32), y = G.chart.y + row * 1.18;
  s.addShape('ellipse', { x: x, y: y + 0.1, w: 0.1, h: 0.1,
    fill: { color: i === 7 ? P.gold : P.slate }, line: { type: 'none' },
    objectName: 'note-dot-' + i });
  s.addText(n0[0], { x: x + 0.22, y: y, w: nw - 0.22, h: 0.3, fontSize: 12.5, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(n0[1], { x: x + 0.22, y: y + 0.3, w: nw - 0.3, h: 0.8, fontSize: 11, color: P.muted,
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
});

};
