// Automated QA over preview.html: (1) text overflow, (2) bidi embedding order.
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1360, height: 800 } });
  await p.goto('file://' + __dirname + '/preview.html');

  const res = await p.evaluate(() => {
    const out = { overflows: [], pairs: 0, violations: [] };
    document.querySelectorAll('.slide').forEach((sl, si) => {
      sl.querySelectorAll('.t').forEach((el) => {
        const box = el.getBoundingClientRect();
        const inner = el.querySelector('span').getBoundingClientRect();
        if (inner.height > box.height + 1.5) {
          out.overflows.push({ slide: si + 1, text: el.textContent.slice(0, 50), need: +inner.height.toFixed(1), have: +box.height.toFixed(1) });
        }
        // bidi: within an RTL box each successive LRE..PDF embedding must sit further left
        if (getComputedStyle(el).direction !== 'rtl') return;
        const node = el.querySelector('span').firstChild;
        if (!node || node.nodeType !== 3) return;
        const s = node.nodeValue;
        const spans = [];
        for (let i = 0; i < s.length; i++) {
          if (s[i] === '‪') {
            const end = s.indexOf('‬', i);
            if (end < 0) break;
            const r = document.createRange();
            r.setStart(node, i + 1); r.setEnd(node, end);
            const rects = Array.from(r.getClientRects());
            if (rects.length) {
              spans.push({ txt: s.slice(i + 1, end), left: Math.min(...rects.map(x => x.left)), top: Math.min(...rects.map(x => x.top)) });
            }
            i = end;
          }
        }
        for (let k = 1; k < spans.length; k++) {
          const a = spans[k - 1], c = spans[k];
          if (Math.abs(a.top - c.top) > 4) continue; // different visual line
          out.pairs++;
          if (c.left >= a.left) out.violations.push({ slide: si + 1, a: a.txt, b: c.txt });
        }
      });
    });
    return out;
  });

  console.log('OVERFLOWS:', res.overflows.length);
  res.overflows.forEach(o => console.log('  s' + o.slide, JSON.stringify(o.text), o.need + '>' + o.have));
  console.log('BIDI PAIRS:', res.pairs, 'VIOLATIONS:', res.violations.length);
  res.violations.forEach(v => console.log('  s' + v.slide, JSON.stringify(v.a), '->', JSON.stringify(v.b)));
  await b.close();
})();
