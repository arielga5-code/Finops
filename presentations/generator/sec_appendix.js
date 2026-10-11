const C = require('./build_core.js');
const { DATA, A, P, M, CW, TOP, BOT, k, sum, topN, divider, ccName,
        head, note, stat, panel, chip, rankList, axisBase, legendBase } = C;
const MON = DATA.months;

module.exports = function (pres) {
const SEC = 'Appendix';
pres.addSection({ title: SEC });

// ---------------------------------------------------------------- divider
let s = pres.addSlide({ masterName: 'DIVIDER', sectionTitle: SEC });
divider(s, 'A', 'Appendix',
  'Cost-centre and project detail, the North Europe decommission, and notes on how these figures were produced.',
  P.slate);

// ---------------------------------------------------------------- small multiples
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · Azure cost centres', 'Every Azure cost centre, January to September',
     { accent: P.blue });

const ccs = Object.entries(DATA.az_cc).sort((a, b) => sum(b[1]) - sum(a[1]));
const gcols = 4, grows = 3;
const gw = (CW - (gcols - 1) * 0.22) / gcols, gh = (4.6 - (grows - 1) * 0.2) / grows;
ccs.slice(0, 12).forEach(([name, vals], i) => {
  const col = i % gcols, row = Math.floor(i / gcols);
  const x = M + col * (gw + 0.22), y = TOP - 0.06 + row * (gh + 0.2);
  panel(s, { x: x, y: y, w: gw, h: gh, name: 'cc-' + name });
  s.addText(ccName(name), {
    x: x + 0.24, y: y + 0.14, w: gw - 1.26, h: 0.3, fontSize: 12, bold: true, color: P.navy,
    fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(sum(vals) >= 1000 ? k(sum(vals)) : '$' + (sum(vals) / 1000).toFixed(1) + 'K', { x: x + gw - 1.2, y: y + 0.14, w: 0.96, h: 0.3, fontSize: 13, bold: true,
    color: P.blue, fontFace: 'Arial', align: 'right', valign: 'middle', margin: 0, isTextBox: true });
  // sparkline of the nine months
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
note(s, 'Each sparkline is scaled to its own maximum; September is highlighted. Totals are year to date.');

// ---------------------------------------------------------------- AWS Harel IL
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · AWS Harel IL payer', 'The second AWS payer account is $166K year to date',
     { accent: P.gold });

const hilTop = topN(DATA.harel_il, 5, 'All other services');
s.addChart(pres.ChartType.bar, hilTop.map(([n, v]) => ({
  name: n.replace(' - ', ' · '), labels: MON, values: v.map(x => +(x / 1000).toFixed(1))
})), Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: M - 0.12, y: TOP - 0.06, w: 7.9, h: 4.5,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 40,
  chartColors: [P.blue, '9FB3C8', P.slate, P.green, P.gold, P.grey],
  valAxisLabelFormatCode: '#,##0',
  valAxisTitle: '$K per month', showValAxisTitle: true,
  valAxisTitleColor: P.muted, valAxisTitleFontSize: 11, valAxisTitleFontFace: '+mn-lt'
}));
panel(s, { x: 8.72, y: TOP - 0.06, w: CW - 8.1, h: 4.5 });
s.addText('Year to date by service', { x: 9.0, y: TOP + 0.16, w: 3.4, h: 0.32, fontSize: 13,
  bold: true, color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
rankList(s, {
  x: 9.0, y: TOP + 0.58, w: 3.44, rowH: 0.42, labelW: 1.84, valueW: 0.76, fontSize: 10,
  items: [
    ['S3 · Glacier Archive', 40959, P.blue], ['Other services', 31343, '9FB3C8'],
    ['Direct Connect', 29484, P.slate], ['Business Support', 16134, P.slate],
    ['EC2 · Compute', 11982, P.gold], ['S3 · API', 11477, P.blue],
    ['VPC Endpoints', 7918, P.green], ['Transit Gateway', 4572, P.green]
  ]
});
chip(s, { x: 9.0, y: TOP + 4.06, w: 3.44, h: 0.34, fill: 'E6F1FA', color: '0A4E7A',
  text: 'Glacier Deep Archive is 25% of it', fontSize: 10.5 });
note(s, 'Included within the $792K AWS consumption total shown in the main deck.');

// ---------------------------------------------------------------- AI Factory detail
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · AI Factory projects', 'Monthly profile of the four AI Factory projects',
     { accent: P.violet });

const projs = [
  ['Aifactory', 'AI Factory core', P.violet, 138983],
  ['Solugen', 'Solugen', P.blue, 47247],
  ['Document Intelligence (OCR Services)', 'Document Intelligence (OCR)', P.green, 43089],
  ['INSAIT', 'INSAIT', P.gold, 16183]
];
const pw2 = (CW - 3 * 0.22) / 4;
projs.forEach((p0, i) => {
  const x = M + i * (pw2 + 0.22);
  panel(s, { x: x, y: TOP - 0.06, w: pw2, h: 4.5, name: 'proj-' + p0[1] });
  s.addText(p0[1], { x: x + 0.26, y: TOP + 0.14, w: pw2 - 0.52, h: 0.62, fontSize: 13, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
  s.addText(k(p0[3]), { x: x + 0.26, y: TOP + 0.8, w: pw2 - 0.52, h: 0.56, fontSize: 26, bold: true,
    color: p0[2], fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText('year to date', { x: x + 0.26, y: TOP + 1.34, w: pw2 - 0.52, h: 0.26, fontSize: 10,
    color: P.muted, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  const vals = DATA.aif[p0[0]] || [];
  const mx = Math.max(...vals) || 1;
  const sy = TOP + 1.78, sh = 2.1, sw = pw2 - 0.52;
  vals.forEach((v, j) => {
    const bh = Math.max((v / mx) * sh, 0.02);
    s.addShape('rect', { x: x + 0.26 + j * (sw / 9), y: sy + (sh - bh), w: (sw / 9) * 0.66, h: bh,
      fill: { color: j === 8 ? p0[2] : 'B9C9D8' }, line: { type: 'none' },
      objectName: 'aif-spark-' + i + '-' + j });
  });
  s.addText('Jan', { x: x + 0.26, y: sy + sh + 0.06, w: 0.7, h: 0.22, fontSize: 8,
    color: P.dimText, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText('Sep', { x: x + pw2 - 0.96, y: sy + sh + 0.06, w: 0.7, h: 0.22, fontSize: 8,
    color: P.dimText, fontFace: 'Arial', align: 'right', valign: 'middle', margin: 0, isTextBox: true });
  s.addText('September  ' + k(vals[8] || 0), { x: x + 0.26, y: TOP + 4.08, w: pw2 - 0.52, h: 0.28,
    fontSize: 10.5, bold: true, color: P.navy, fontFace: 'Arial', align: 'left',
    valign: 'middle', margin: 0, isTextBox: true });
});
note(s, 'Sparklines are scaled to each project’s own maximum month. Programme total $246K year to date.');

// ---------------------------------------------------------------- Foundry detail
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · AI Foundry', 'Foundry models and tools: $120K across 37 SKUs', { accent: P.violet });

const fTop = topN(DATA.foundry, 5, 'All other SKUs');
s.addChart(pres.ChartType.bar, fTop.map(([n, v]) => ({
  name: n, labels: MON, values: v.map(x => +(x / 1000).toFixed(1))
})), Object.assign(axisBase(false), legendBase(false, 'b'), {
  x: M - 0.12, y: TOP - 0.06, w: 7.9, h: 4.5,
  barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 40,
  chartColors: [P.violet, P.blue, P.green, P.gold, P.slate, P.grey],
  valAxisLabelFormatCode: '#,##0',
  valAxisTitle: '$K per month', showValAxisTitle: true,
  valAxisTitleColor: P.muted, valAxisTitleFontSize: 11, valAxisTitleFontFace: '+mn-lt'
}));
panel(s, { x: 8.72, y: TOP - 0.06, w: CW - 8.1, h: 4.5 });
s.addText('Largest SKUs, year to date', { x: 9.0, y: TOP + 0.16, w: 3.4, h: 0.32, fontSize: 13,
  bold: true, color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle',
  margin: 0, isTextBox: true });
rankList(s, {
  x: 9.0, y: TOP + 0.58, w: 3.44, rowH: 0.42, labelW: 1.84, valueW: 0.8, fontSize: 10,
  items: Object.entries(DATA.foundry).sort((a, b) => sum(b[1]) - sum(a[1])).slice(0, 8)
    .map(([n, v]) => [n, sum(v), P.violet])
});
note(s, 'Document-intelligence page SKUs (S0 Custom / Pre-built / Add-on) and the 5.4 model family dominate.');

// ---------------------------------------------------------------- North Europe
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
const hdr = ['Service', 'Prod', 'SAP Production', 'Shared Resources', 'Total'];
hdr.forEach((h0, i) => s.addText(h0, {
  x: colX[i], y: TOP - 0.06, w: cols[i] - 0.14, h: 0.34, fontSize: 10.5, bold: true,
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
  value: '$70K', label: 'Annualised', sub: '$5,871 × 12', valueSize: 30, valueH: 0.62,
  subH: 0.34, subSize: 10.5 });
note(s, 'The largest single realised saving of FY2026. Figures are the final month of North Europe consumption.');

// ---------------------------------------------------------------- method
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Appendix · Notes', 'How these figures were produced', { accent: P.slate });

const notes = [
  ['Period and currency', 'All figures cover 1 January – 30 September 2026 (nine months) and are stated in US dollars.'],
  ['Consumption vs. committed', '"Consumption" is metered usage. Marketplace and prepaid contracts are reported separately and are excluded from consumption totals unless stated.'],
  ['AWS payers', 'AWS is billed across two payer accounts. The Harel IL payer is $166K of the $792K consumption total.'],
  ['Azure Marketplace', 'Marketplace charges sit under the Shared Resources subscription.'],
  ['Savings basis', 'Realised savings and cost avoidance are annualised run-rate impacts at the point of implementation, not year-to-date cash.'],
  ['AI definition', 'AI services = Amazon Bedrock, Azure AI Foundry (models and tools), Microsoft Copilot Studio, Azure Cognitive Search, GitHub and Copilot, and GCP Vertex AI and Gemini.'],
  ['Sources', 'AWS Cost Explorer, Azure Cost Management, Google Cloud Billing and the GitHub billing portal, as extracted for the September 2026 review.'],
  ['Open reconciliation', 'Azure Marketplace sums to $542K here against $563K quoted in earlier reporting; the $21K difference is under review and does not affect the consumption figures.']
];
const nw = (CW - 0.32) / 2;
notes.forEach((n0, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = M + col * (nw + 0.32), y = TOP - 0.06 + row * 1.18;
  s.addShape('ellipse', { x: x, y: y + 0.1, w: 0.1, h: 0.1,
    fill: { color: i === 7 ? P.gold : P.slate }, line: { type: 'none' },
    objectName: 'note-dot-' + i });
  s.addText(n0[0], { x: x + 0.22, y: y, w: nw - 0.22, h: 0.3, fontSize: 12.5, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(n0[1], { x: x + 0.22, y: y + 0.3, w: nw - 0.3, h: 0.8, fontSize: 11, color: P.muted,
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
});
s.addNotes('Keep this slide. It answers the "where did this number come from" question before it is asked.');

};
