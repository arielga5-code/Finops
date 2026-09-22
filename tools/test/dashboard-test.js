// Loads azure-spend-dashboard.html with a synthetic EA usage export and asserts the
// rendered numbers match the generated ones. Run: node tools/test/dashboard-test.js
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = path.resolve(__dirname, '..', 'azure-spend-dashboard.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// Deterministic PRNG so an assertion failure is reproducible.
let seed = 7;
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const pick = (a) => a[Math.floor(rnd() * a.length)];

function sampleCsv() {
  const svc = [['Virtual Machines', 'Compute Hours'], ['Storage', 'Blob Storage'],
    ['Azure OpenAI', 'Tokens'], ['SQL Database', 'vCore'], ['Bandwidth', 'Data Transfer Out'],
    ['Azure Kubernetes Service', 'Node Hours'], ['Log Analytics', 'Data Ingestion']];
  const rgs = ['rg-prod-core', 'rg-prod-data', 'rg-dev', 'rg-shared-net', 'rg-ai-platform'];
  const subs = ['Harel-Production', 'Harel-NonProd', 'Harel-Sandbox'];
  const header = ['AccountName', 'SubscriptionName', 'Date', 'Product', 'MeterCategory',
    'MeterSubCategory', 'MeterName', 'ConsumedQuantity', 'ResourceRate', 'ExtendedCost',
    'ResourceLocation', 'InstanceId', 'CostCenter', 'UnitOfMeasure', 'ResourceGroup', 'BillingCurrency'];
  const lines = [header.join(',')];
  let total = 0, untagged = 0;
  for (let d = 1; d <= 31; d++) {
    const ramp = 1 + 0.5 * (d / 31);
    for (let k = 0, m = 90 + Math.floor(rnd() * 60); k < m; k++) {
      const [cat, sub] = pick(svc), rg = pick(rgs);
      const qty = +(1 + rnd() * 900).toFixed(3), rate = +(0.002 + rnd() * 1.4).toFixed(5);
      const cost = +(qty * rate * ramp).toFixed(4);
      const cc = rnd() < 0.17 ? '' : pick(['CC-1001', 'CC-2004', 'CC-3300']);
      total += cost;
      if (!cc) untagged += cost;
      lines.push(['Harel IT', pick(subs), `08/${String(d).padStart(2, '0')}/2026`, cat, cat, sub,
        `${sub} - Standard`, qty, rate, cost, 'IL Central',
        `/subscriptions/x/resourceGroups/${rg}/providers/Microsoft.Compute/x/${rg.split('-').pop()}-vm${k % 18}`,
        cc, 'Hours', rg, 'USD'].join(','));
    }
  }
  return { csv: lines.join('\n'), total, untagged, rows: lines.length - 1 };
}

(async () => {
  const { csv, total, untagged, rows } = sampleCsv();
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'azdash-')), 'sample_ea.csv');
  fs.writeFileSync(file, csv);

  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  await page.goto('file://' + PAGE);
  await page.setInputFiles('#file', file);
  await page.waitForSelector('#dash:not(.hide)', { timeout: 30000 });

  const fails = [];
  const near = (a, b, eps, what) => {
    if (Math.abs(a - b) > eps) fails.push(`${what}: rendered ${a}, expected ${b}`);
  };

  const got = await page.evaluate(() => ({
    total: window.__agg.total,
    rows: window.__agg.rows,
    untagged: window.__agg.untagged,
    days: document.querySelectorAll('#dailyChart circle').length,
    period: document.getElementById('dailyNote').textContent,
  }));
  near(got.total, total, 0.05, 'total spend');
  near(got.rows, rows, 0, 'line item count');
  near(got.untagged, untagged, 0.05, 'untagged spend');
  near(got.days, 31, 0, 'days plotted');
  if (!/August 2026/.test(got.period)) fails.push(`period: got "${got.period}"`);

  // A filter must narrow the total, and clearing must restore it exactly.
  await page.selectOption('#fSub', { index: 1 });
  const filtered = await page.evaluate(() => window.__agg.total);
  if (!(filtered > 0 && filtered < got.total)) fails.push(`filter did not narrow: ${filtered}`);
  await page.click('#clearF');
  near(await page.evaluate(() => window.__agg.total), got.total, 0.001, 'total after clearing filters');

  if (errors.length) fails.push('console errors: ' + errors.join(' | '));
  await browser.close();

  if (fails.length) { console.error('FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log(`PASS  ${rows} rows, total ${total.toFixed(2)}, untagged ${untagged.toFixed(2)}`);
})();
