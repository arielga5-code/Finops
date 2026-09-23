// Feeds the EA aggregator a generated export and asserts every aggregate matches.
// Covers the case that breaks naive parsers: a quoted Tags field containing commas.
// Run: node tools/test/aggregator-test.js   (needs: npm i playwright)
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = path.resolve(__dirname, '..', 'ea-export-aggregator.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TARGET_BYTES = +(process.env.SIZE_MB || 60) * 1048576;

let seed = 11;
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const pick = (a) => a[Math.floor(rnd() * a.length)];

function generate(file) {
  const svc = [['Virtual Machines', 'Compute Hours'], ['Storage', 'Blob Storage'],
    ['Azure Databricks', 'DBU'], ['Azure OpenAI and AI services', 'GPT-5.4'],
    ['GitHub', 'Copilot Business'], ['Networking', 'Data Transfer']];
  const rgs = ['rg-prod-core', 'rg-data', 'rg-dev', 'rg-net', 'rg-ai'];
  const subs = ['DataCloud prod', 'Shared Resources', 'Prod', 'SAP Dev/Test'];
  const prjs = ['BI', 'FPSL', 'AIFactory', 'DataCloud', ''];
  const ccs = ['DataCloud', 'SAP', 'CloudIT', ''];
  const hdr = ['AccountName', 'SubscriptionName', 'Date', 'MeterCategory', 'MeterSubCategory',
    'MeterName', 'ConsumedQuantity', 'ResourceRate', 'ExtendedCost', 'InstanceId', 'Tags',
    'CostCenter', 'UnitOfMeasure', 'ResourceGroup', 'BillingCurrency'];

  const out = fs.createWriteStream(file);
  out.write(hdr.join(',') + '\n');
  const exp = { total: 0, rows: 0, sub: {}, svc: {}, prj: {}, cc: {}, days: new Set() };
  let size = 0;
  while (size < TARGET_BYTES) {
    const d = 1 + Math.floor(rnd() * 31);
    const [cat, mn] = pick(svc), rg = pick(rgs), s = pick(subs);
    const prj = pick(prjs), cc = pick(ccs);
    const qty = +(1 + rnd() * 500).toFixed(3), rate = +(0.002 + rnd() * 1.2).toFixed(5);
    const cost = +(qty * rate).toFixed(4);
    // Quoted JSON with embedded commas — must not be split on.
    const tags = `"{""Project"":""${prj}"",""CostCenter"":""${cc}"",""env"":""prod""}"`;
    const inst = `"/subscriptions/x/resourceGroups/${rg}/providers/Microsoft.Compute/vm/${rg}-${Math.floor(rnd() * 4000)}"`;
    const line = ['Harel IT', s, `08/${String(d).padStart(2, '0')}/2026`, cat, mn, mn,
      qty, rate, cost, inst, tags, '', 'Hours', rg, 'USD'].join(',') + '\n';
    out.write(line); size += line.length;
    exp.total += cost; exp.rows++;
    exp.days.add(d);
    exp.sub[s] = (exp.sub[s] || 0) + cost;
    exp.svc[cat] = (exp.svc[cat] || 0) + cost;
    exp.prj[prj || '(untagged)'] = (exp.prj[prj || '(untagged)'] || 0) + cost;
    exp.cc[cc || '(untagged)'] = (exp.cc[cc || '(untagged)'] || 0) + cost;
  }
  return new Promise((res) => out.end(() => res(exp)));
}

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eaagg-'));
  const file = path.join(dir, 'Detail_Enrollment_00000000_202608_en.csv');
  const exp = await generate(file);
  const mb = (fs.statSync(file).size / 1048576).toFixed(0);

  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('file://' + PAGE);
  const t0 = Date.now();
  await page.setInputFiles('#file', file);
  await page.waitForSelector('#out:not(.hide)', { timeout: 900000 });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);

  const got = await page.evaluate(() => {
    const g = (m) => Object.fromEntries([...m.entries()]);
    return { total: state.total, rows: state.rows, months: state.months, days: state.A.day.size,
      sub: g(state.A.sub), svc: g(state.A.svc), prj: g(state.A.prj), cc: g(state.A.cc) };
  });

  const fails = [];
  const near = (a, b, eps, what) => { if (Math.abs(a - b) > eps) fails.push(`${what}: got ${a}, expected ${b}`); };
  near(got.total, exp.total, 1, 'total cost');
  near(got.rows, exp.rows, 0, 'row count');
  near(got.days, exp.days.size, 0, 'days');
  if (JSON.stringify(got.months) !== JSON.stringify(['2026-08'])) fails.push('months: ' + got.months);
  for (const [dim, want] of [['sub', exp.sub], ['svc', exp.svc], ['prj', exp.prj], ['cc', exp.cc]])
    for (const k of Object.keys(want)) near(got[dim][k] || 0, want[k], 0.5, `${dim} "${k}"`);

  // The deliverable has to stay small enough to attach to a message.
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#dl')]);
  const kb = fs.readFileSync(await dl.path(), 'utf8').length / 1024;
  if (kb > 512) fails.push(`aggregate export too large: ${kb.toFixed(0)} KB`);

  if (errors.length) fails.push('console: ' + errors.join(' | '));
  await browser.close();
  fs.rmSync(dir, { recursive: true, force: true });

  if (fails.length) { console.error('FAIL\n  ' + fails.slice(0, 15).join('\n  ')); process.exit(1); }
  console.log(`PASS  ${mb} MB / ${exp.rows.toLocaleString()} rows in ${secs}s -> ${kb.toFixed(1)} KB of aggregates`);
})();
