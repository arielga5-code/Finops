const C = require('./build_core.js');
const { DATA, A, P, M, CW, TOP, BOT, k, divider,
        head, note, stat, panel, chip, bulletRow, rankList } = C;

// isolate a left-to-right run inside Hebrew text so bidi keeps it intact
// isolate a left-to-right run inside Hebrew text, and keep its words on one line
const ltr = t => '⁦' + t.replace(/ (?=\S)/g, ' ') + '⁩';

module.exports = function (pres) {
const SEC = '06 Risks and next steps';
pres.addSection({ title: SEC });

// ---------------------------------------------------------------- divider
let s = pres.addSlide({ masterName: 'DIVIDER', sectionTitle: SEC });
divider(s, '06', 'Risks & next steps',
  'Three items that affect the FY2027 budget, the FinOps roadmap, and the decisions we are asking for today.',
  P.red);

// ---------------------------------------------------------------- risks
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Risks', 'Three things that will move the FY2027 budget', { accent: P.red });

const risks = [
  { tag: 'PRICING', c: P.red, t: 'Azure raises prices on 1 February 2027',
    b: 'Microsoft is expected to lift on-demand VM pricing for v1 and v2 series by about 25%, with further regional increases in West EU, North EU, France, Norway and Singapore.',
    m: 'Mitigation — reservations lock today\u2019s rate; buy the RI pipeline before February.',
    f: '+$4,700', fl: 'per month', f2: '+$56,400 a year', fsub: 'Estimated on September usage' },
  { tag: 'COMMITMENT', c: P.gold, t: 'The Databricks commitment burns out two years early',
    b: '29% of the 600,000 prepaid DBU hours were consumed in the first five months of a thirty-six month term. At that rate the $504K commitment is exhausted around September 2027.',
    m: 'Decision — top up in FY2027, or rebalance Classic and Serverless to extend the term.',
    f: 'Sep 2027', fl: 'projected exhaustion', f2: '$504K prepaid', fsub: '29% consumed to date' },
  { tag: 'AI RUN-RATE', c: P.violet, t: 'AI spend has no ceiling yet',
    b: 'AI reached $102K in September and is still climbing. Only GitHub AI credit has a budget with a hard stop; Foundry and Bedrock have neither a cap nor a quota.',
    m: 'Mitigation — extend the GitHub budget pattern to Foundry and Bedrock.',
    f: '$1.22M', fl: 'annualised at Sep run-rate', f2: '11× since January', fsub: '34% of all consumption' }
];
const rh = 1.5;
risks.forEach((r, i) => {
  const y = TOP - 0.06 + i * (rh + 0.16);
  panel(s, { x: M, y: y, w: CW, h: rh, name: 'risk-' + i });
  chip(s, { x: M + 0.3, y: y + 0.24, w: 1.24, h: 0.28, fill: r.c, text: r.tag, fontSize: 9 });
  s.addText(r.t, { x: M + 1.74, y: y + 0.18, w: 6.5, h: 0.38, fontSize: 16, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(r.b, { x: M + 1.74, y: y + 0.58, w: 6.6, h: 0.5, fontSize: 11.5, color: P.muted,
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
  s.addText(r.m, { x: M + 1.74, y: y + 1.1, w: 6.6, h: 0.3, fontSize: 11, bold: true,
    color: r.c, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(r.f, { x: M + 8.6, y: y + 0.2, w: 3.1, h: 0.58, fontSize: 26, bold: true,
    color: P.navy, fontFace: 'Arial', align: 'right', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(r.fl, { x: M + 8.6, y: y + 0.76, w: 3.1, h: 0.28, fontSize: 10.5, color: P.muted,
    fontFace: 'Arial', align: 'right', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(r.f2, { x: M + 8.6, y: y + 1.04, w: 3.1, h: 0.26, fontSize: 11, bold: true,
    color: r.c, fontFace: 'Arial', align: 'right', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(r.fsub, { x: M + 8.6, y: y + 1.26, w: 3.1, h: 0.24, fontSize: 9.5, color: P.muted,
    fontFace: 'Arial', align: 'right', valign: 'middle', margin: 0, isTextBox: true });
});
s.addNotes('Two of these need a decision from you. The third is a budget number to carry into 2027 planning.');

// ---------------------------------------------------------------- roadmap (Hebrew)
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: SEC });
head(s, 'Roadmap', 'The FinOps workplan for the next two quarters', { accent: P.blue });

const HE = 'Arial';
const BADGE_X = 12.33, TXT_X = 4.86, TXT_W = 7.28, CHIP_X = 3.24, OWN_X = M;
// column headers, mirrored for right-to-left reading
[['משימה', TXT_X, TXT_W, 'right'], ['סטטוס', CHIP_X, 1.45, 'center'], ['אחראי', OWN_X, 2.4, 'right']]
  .forEach(h0 => s.addText(h0[0], {
    x: h0[1], y: TOP - 0.1, w: h0[2], h: 0.3, fontSize: 10.5, bold: true, charSpacing: 0.8,
    color: P.muted, fontFace: HE, rtlMode: true, align: h0[3], valign: 'middle',
    margin: 0, isTextBox: true }));

const road = [
  { t: 'פרויקט חיסכון והתייעלות',
    d: 'מימוש תכנית ' + ltr('Cloud FinOps') + ' — ' + ltr('Rightsizing') + ', ' + ltr('Auto Shutdown') + ' ו-' + ltr('Reserved Instances'),
    st: 'מתוכנן', sc: P.blue, own: 'אגף תשתיות' },
  { t: 'הטמעת ' + ltr('WIV.AI'),
    d: 'פלטפורמת ממשל וניטור עלויות ושימושים, ללא עלות רישוי',
    st: 'מתוכנן', sc: P.blue, own: 'אריאל אוראל' },
  { t: 'תיוג משאבים לפי שירות',
    d: 'השלמת תיוג לפי ' + ltr('Service, Application, Cost Center') + ' ו-' + ltr('Environment') + ' לצורך ' + ltr('Chargeback/Showback') + ', כולל ' + ltr('AI Gateway') + ' ו-' + ltr('AWS Bedrock'),
    st: 'בתהליך', sc: P.gold, own: 'אריאל אוראל' },
  { t: 'הטמעת ' + ltr('AWS FinOps Agent'),
    d: 'ניתוח עלויות אוטומטי, זיהוי המלצות חיסכון ואופטימיזציה של שירותי ' + ltr('AWS'),
    st: 'מתוכנן', sc: P.blue, own: 'אריאל' },
  { t: 'אופטימיזציית ' + ltr('Databricks Commitment'),
    d: 'הגדלת ניצול חוזה ה-' + ltr('DBU') + ', מעקב ' + ltr('Utilization') + ' ואיזון ' + ltr('Classic/Serverless'),
    st: 'לקביעה', sc: P.grey, own: '—' }
];
const rowH = 0.94;
road.forEach((r, i) => {
  const y = TOP + 0.28 + i * rowH;
  if (i % 2 === 0) panel(s, { x: M, y: y - 0.04, w: CW, h: rowH - 0.08, fill: 'F6F8FB', name: 'road-' + i });
  s.addShape('ellipse', { x: BADGE_X, y: y + 0.2, w: 0.36, h: 0.36, fill: { color: P.navy },
    line: { type: 'none' }, objectName: 'road-badge-' + i });
  s.addText(String(i + 1), { x: BADGE_X, y: y + 0.2, w: 0.36, h: 0.36, fontSize: 12, bold: true,
    color: 'FFFFFF', fontFace: 'Arial', align: 'center', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(r.t, { x: TXT_X, y: y + 0.06, w: TXT_W, h: 0.34, fontSize: 14.5, bold: true,
    color: P.navy, fontFace: HE, rtlMode: true, align: 'right', valign: 'middle',
    margin: 0, isTextBox: true });
  s.addText(r.d, { x: TXT_X, y: y + 0.4, w: TXT_W, h: 0.44, fontSize: 11.5, color: P.muted,
    fontFace: HE, rtlMode: true, align: 'right', valign: 'top', margin: 0, isTextBox: true });
  s.addShape('roundRect', { x: CHIP_X, y: y + 0.26, w: 1.45, h: 0.32, rectRadius: 0.13,
    fill: { color: r.sc }, line: { type: 'none' }, objectName: 'road-chip-' + i });
  s.addText(r.st, { x: CHIP_X, y: y + 0.26, w: 1.45, h: 0.32, fontSize: 10.5, bold: true,
    color: 'FFFFFF', fontFace: HE, rtlMode: true, align: 'center', valign: 'middle',
    margin: 0, isTextBox: true });
  s.addText(r.own, { x: OWN_X, y: y + 0.26, w: 2.4, h: 0.32, fontSize: 11.5, color: P.navy,
    fontFace: HE, rtlMode: true, align: 'right', valign: 'middle', margin: 0, isTextBox: true });
});
note(s, 'Owners and status as at the September 2026 FinOps review.');
s.addNotes('Five workstreams. Tagging is the one already running and the one everything else depends on.');

// ---------------------------------------------------------------- the ask
s = pres.addSlide({ masterName: 'CONTENT_DARK', sectionTitle: SEC });
head(s, 'The ask', 'Three decisions we would like to close today', { dark: true, accent: P.gold });

const asks = [
  { n: 1, t: 'Approve the reservation purchase programme', c: P.green,
    b: '$78K a year of identified reserved-instance and savings-plan purchases across SAP, CloudIT, '
     + 'AI Factory and Data Cloud. Buying before February 2027 also locks pricing ahead of the Azure increase.',
    w: 'Needs: capital approval  ·  Owner: Cloud Infrastructure' },
  { n: 2, t: 'Set an FY2027 envelope and controls for AI', c: P.violet,
    b: 'Budget for roughly $1.3M of AI consumption, and attach the controls: hard-stop budgets on Foundry '
     + 'and Bedrock, a model-routing policy, and per-project quotas.',
    w: 'Needs: budget line + policy sign-off  ·  Owner: AI Factory + FinOps' },
  { n: 3, t: 'Choose the Databricks path before Q1', c: P.gold,
    b: 'Either top up the DBU commitment in the FY2027 plan, or fund an optimisation sprint on the '
     + 'Classic / Serverless mix to stretch the existing contract.',
    w: 'Needs: a decision by December 2026  ·  Owner: Data Cloud + FinOps' }
];
const aw = (CW - 2 * 0.3) / 3;
asks.forEach((a, i) => {
  const x = M + i * (aw + 0.3);
  panel(s, { x: x, y: TOP, w: aw, h: 4.3, fill: '112C45', name: 'ask-' + a.n });
  s.addShape('ellipse', { x: x + 0.34, y: TOP + 0.34, w: 0.46, h: 0.46, fill: { color: a.c },
    line: { type: 'none' }, objectName: 'ask-badge-' + a.n });
  s.addText(String(a.n), { x: x + 0.34, y: TOP + 0.34, w: 0.46, h: 0.46, fontSize: 17, bold: true,
    color: 'FFFFFF', fontFace: 'Arial', align: 'center', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(a.t, { x: x + 0.34, y: TOP + 1.0, w: aw - 0.68, h: 0.94, fontSize: 17, bold: true,
    color: 'FFFFFF', fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
  s.addText(a.b, { x: x + 0.34, y: TOP + 2.0, w: aw - 0.68, h: 1.5, fontSize: 12, color: 'A9BCCF',
    fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
  s.addText(a.w, { x: x + 0.34, y: TOP + 3.56, w: aw - 0.68, h: 0.56, fontSize: 10.5, bold: true,
    color: a.c, fontFace: 'Arial', align: 'left', valign: 'top', margin: 0, isTextBox: true });
});
note(s, 'Recommended by the Cloud Infrastructure, DevOps & Databases department for CIO decision.', { dark: true });
s.addNotes('Three decisions. One is money, one is policy, one is a choice between two valid options.');

// ---------------------------------------------------------------- thank you
s = pres.addSlide({ masterName: 'STATEMENT', sectionTitle: SEC });
s.addText('Thank you', { x: M, y: 2.5, w: 9.0, h: 1.2, fontSize: 52, bold: true, color: 'FFFFFF',
  fontFace: 'Cambria', align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addText('Questions, and the detailed cost-centre views, are in the appendix.', {
  x: M, y: 3.74, w: 9.0, h: 0.46, fontSize: 17, color: '9EC6E6', fontFace: 'Cambria', italic: true,
  align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addText('מחלקת תשתיות ענן, DevOps ובסיסי נתונים  ·  אגף טכנולוגיות והגנת הסייבר', {
  x: M, y: 4.42, w: 9.0, h: 0.4, fontSize: 13, color: 'A9BCCF', fontFace: 'Arial',
  rtlMode: true, align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addText('בשביל השקט הנפשי שלך', { x: M, y: 4.88, w: 9.0, h: 0.4, fontSize: 13, color: '7FA8C9',
  fontFace: 'Arial', rtlMode: true, align: 'left', valign: 'middle', margin: 0, isTextBox: true });
s.addImage({ path: A + 'harel_light.png', x: 10.6, y: 3.3, w: 1.6, h: 0.69 });
s.addNotes('Thank you.');

};
