// Automated QA over preview.html: (1) text overflow, (2) bidi embedding order.
const { chromium } = require('playwright');
const D = require('./deck');

// A bracket that opens inside an LRE…PDF embedding but closes outside it (or the
// reverse) is rendered mirrored: "il-central-1 (תל אביב)" comes out with the
// parens swapped. Brackets must sit either wholly inside one embedding or
// wholly outside every embedding.
function bracketCheck() {
  const bad = [];
  D.slides.forEach((sl, si) => {
    sl.ops.filter((op) => op.t === 'text' && op.rtl).forEach((op) => {
      const spans = String(op.s).match(/\u202A[^\u202C]*\u202C/g) || [];
      spans.forEach((sp) => {
        const open = (sp.match(/[([]/g) || []).length;
        const close = (sp.match(/[)\]]/g) || []).length;
        if (open !== close) bad.push({ slide: si + 1, span: sp.replace(/[\u202A\u202C]/g, '') });
      });
    });
  });
  return bad;
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1360, height: 800 } });
  await p.goto('file://' + __dirname + '/preview.html');

  const res = await p.evaluate(() => {
    const out = { overflows: [], pairs: 0, violations: [], collisions: [] };
    document.querySelectorAll('.slide').forEach((sl, si) => {
      // Two text boxes must never share space — that is always a layout bug.
      const boxes = Array.from(sl.querySelectorAll('.t')).map((el) => ({
        r: el.getBoundingClientRect(), s: el.textContent.slice(0, 34),
      }));
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i].r, b = boxes[j].r;
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (ox > 2 && oy > 2) {
            out.collisions.push({ slide: si + 1, a: boxes[i].s, b: boxes[j].s, ox: +ox.toFixed(0), oy: +oy.toFixed(0) });
          }
        }
      }
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

  const brackets = bracketCheck();
  console.log('UNBALANCED BRACKET SPANS:', brackets.length);
  brackets.forEach(b => console.log('  s' + b.slide, JSON.stringify(b.span)));
  console.log('OVERFLOWS:', res.overflows.length);
  res.overflows.forEach(o => console.log('  s' + o.slide, JSON.stringify(o.text), o.need + '>' + o.have));
  console.log('COLLISIONS:', res.collisions.length);
  res.collisions.forEach(c => console.log('  s' + c.slide, JSON.stringify(c.a), 'X', JSON.stringify(c.b), c.ox + 'x' + c.oy + 'px'));
  console.log('BIDI PAIRS:', res.pairs, 'VIOLATIONS:', res.violations.length);
  res.violations.forEach(v => console.log('  s' + v.slide, JSON.stringify(v.a), '->', JSON.stringify(v.b)));
  await b.close();
})();
