// HTML mirror of the exact PPTX geometry, for visual QA (LibreOffice is unusable here).
const fs = require('fs');
const { C, F, G } = require('./theme');
const D = require('./deck');

const PX = 96; // 1 inch = 96px
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function forecastSvg(w, h) {
  const pl = 40, pr = 8, pt = 10, pb = 42;
  const iw = w - pl - pr, ih = h - pt - pb;
  const min = 450, max = 950;
  const X = (i) => pl + (iw * i) / (D.FC_LABELS.length - 1);
  const Y = (v) => pt + ih - (ih * (v - min)) / (max - min);
  const path = (arr) => {
    let d = '', pen = false;
    arr.forEach((v, i) => {
      if (v == null) { pen = false; return; }
      d += (pen ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1) + ' ';
      pen = true;
    });
    return d;
  };
  let g = '';
  for (let v = 450; v <= 950; v += 100) {
    g += `<line x1="${pl}" y1="${Y(v)}" x2="${pl + iw}" y2="${Y(v)}" stroke="#1C2740"/>`;
    g += `<text x="${pl - 6}" y="${Y(v) + 3.5}" fill="#${C.dim}" font-size="10" text-anchor="end">${v}</text>`;
  }
  D.FC_LABELS.forEach((l, i) => {
    g += `<text x="${X(i)}" y="${pt + ih + 12}" fill="#${C.dim}" font-size="8.5" text-anchor="end" transform="rotate(-60 ${X(i)} ${pt + ih + 12})">${l}</text>`;
  });
  const series = [
    [D.CAPACITY, C.blue], [D.THRESHOLD, C.red], [D.FAST, C.purple],
    [D.TREND, C.cyan], [D.ACTUAL, C.orange],
  ];
  series.forEach(([arr, col]) => {
    g += `<path d="${path(arr)}" fill="none" stroke="#${col}" stroke-width="2.5"/>`;
  });
  return `<svg width="${w}" height="${h}">${g}</svg>`;
}

function costSvg(w, h) {
  const pl = 44, pr = 8, pt = 26, pb = 34;
  const iw = w - pl - pr, ih = h - pt - pb;
  const cats = [['Dell ECS On-Prem', 115.8, C.green], ['AWS S3 Standard', 146.5, C.cyan], ['AWS S3 + API', 155.0, C.purple]];
  const max = 180;
  let g = '';
  for (let v = 0; v <= 180; v += 60) {
    const y = pt + ih - (ih * v) / max;
    g += `<line x1="${pl}" y1="${y}" x2="${pl + iw}" y2="${y}" stroke="#1C2740"/>`;
    g += `<text x="${pl - 6}" y="${y + 3.5}" fill="#${C.dim}" font-size="10" text-anchor="end">${v}</text>`;
  }
  const slot = iw / cats.length, bw = slot * 0.42;
  cats.forEach(([n, v, col], i) => {
    const cx = pl + slot * (i + 0.5);
    const bh = (ih * v) / max;
    g += `<rect x="${cx - bw / 2}" y="${pt + ih - bh}" width="${bw}" height="${bh}" fill="#${col}"/>`;
    g += `<text x="${cx}" y="${pt + ih - bh - 8}" fill="#${C.text}" font-size="13" font-weight="700" text-anchor="middle">$${v.toFixed(1)}K</text>`;
    g += `<text x="${cx}" y="${pt + ih + 16}" fill="#${C.muted}" font-size="11.5" text-anchor="middle">${n}</text>`;
  });
  return `<svg width="${w}" height="${h}">${g}</svg>`;
}

let html = `<meta charset="utf-8"><style>
body{margin:0;background:#333;font-family:'Liberation Sans',Arial,sans-serif}
.slide{position:relative;width:${G.W * PX}px;height:${G.H * PX}px;margin:14px auto;overflow:hidden}
.n{position:absolute;left:-40px;top:0;color:#fff;font-size:20px}
.t{position:absolute;display:flex;box-sizing:border-box;white-space:pre-wrap}
.t>span{display:block;width:100%}
</style>`;

D.slides.forEach((sl, si) => {
  html += `<div class="slide" style="background:#${sl.bg || C.bg}"><div class="n">${si + 1}</div>`;
  sl.ops.forEach((op) => {
    if (op.t === 'rect') {
      html += `<div style="position:absolute;left:${op.x * PX}px;top:${op.y * PX}px;width:${op.w * PX}px;height:${op.h * PX}px;`
        + (op.fill ? `background:#${op.fill};` : '')
        + (op.line ? `border:1px solid #${op.line};box-sizing:border-box;` : '')
        + (op.r ? `border-radius:${Math.min(op.w, op.h) * PX * op.r * 2}px;` : '')
        + `"></div>`;
    } else if (op.t === 'text') {
      const va = op.valign === 'middle' ? 'center' : op.valign === 'bottom' ? 'flex-end' : 'flex-start';
      html += `<div class="t" style="left:${op.x * PX}px;top:${op.y * PX}px;width:${op.w * PX}px;height:${op.h * PX}px;`
        + `align-items:${va};font-size:${op.size}px;font-weight:${op.bold ? 700 : 400};color:#${op.color};`
        + `direction:${op.rtl ? 'rtl' : 'ltr'};text-align:${op.align || 'right'};`
        + `letter-spacing:${(op.cs || 0)}px;line-height:${op.lh || 1.0};outline:1px dashed rgba(255,255,255,.10);">`
        + `<span>${esc(op.s)}</span></div>`;
    } else if (op.t === 'chart') {
      const w = op.w * PX, h = op.h * PX;
      html += `<div style="position:absolute;left:${op.x * PX}px;top:${op.y * PX}px;width:${w}px;height:${h}px">`
        + (op.kind === 'forecast' ? forecastSvg(w, h) : costSvg(w, h)) + `</div>`;
    }
  });
  html += `</div>`;
});

fs.writeFileSync(process.argv[2] || 'preview.html', html);
console.log('wrote preview');
