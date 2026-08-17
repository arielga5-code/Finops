const pptxgen = require('pptxgenjs');
const { C, F, G } = require('./theme');
const D = require('./deck');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';           // 13.333 x 7.5
pres.author = 'Harel IT Infrastructure';
pres.title = 'העתקת מסמכי דימות ושיחות לענן';

function drawChart(slide, op) {
  if (op.kind === 'forecast') {
    slide.addChart(pres.ChartType.line, [
      { name: 'קיבולת',      labels: D.FC_LABELS, values: D.CAPACITY },
      { name: 'סף 80%',      labels: D.FC_LABELS, values: D.THRESHOLD },
      { name: 'תרחיש מואץ',  labels: D.FC_LABELS, values: D.FAST },
      { name: 'תחזית מגמה',  labels: D.FC_LABELS, values: D.TREND },
      { name: 'בשימוש',      labels: D.FC_LABELS, values: D.ACTUAL },
    ], {
      x: op.x, y: op.y, w: op.w, h: op.h,
      chartColors: [C.blue, C.red, C.purple, C.cyan, C.orange],
      lineDataSymbol: 'none',
      lineSize: 2.5,
      showLegend: false, showTitle: false,
      valAxisMinVal: 450, valAxisMaxVal: 950, valAxisMajorUnit: 100,
      valAxisLabelColor: C.dim, valAxisLabelFontSize: 10, valAxisLabelFontFace: F,
      catAxisLabelColor: C.dim, catAxisLabelFontSize: 8.5, catAxisLabelFontFace: F,
      catAxisLabelRotate: 300,
      valGridLine: { color: '1C2740', size: 1 },
      catGridLine: { style: 'none' },
      valAxisLineShow: false, catAxisLineShow: true, catAxisLineColor: '23304A',
      plotArea: { fill: { color: C.bg } },
      chartArea: { fill: { color: C.bg }, border: { pt: 0, color: C.bg } },
      displayBlanksAs: 'gap',
    });
  } else if (op.kind === 'cost') {
    slide.addChart(pres.ChartType.bar, [
      { name: 'עלות', labels: ['Dell ECS On-Prem', 'AWS S3 Standard', 'AWS S3 + API'], values: [115.8, 146.5, 155.0] },
    ], {
      x: op.x, y: op.y, w: op.w, h: op.h,
      barDir: 'col', barGapWidthPct: 120,
      chartColors: [C.green, C.cyan, C.purple], varyColors: true,
      showLegend: false, showTitle: false,
      showValue: true, dataLabelPosition: 'outEnd',
      dataLabelColor: C.text, dataLabelFontSize: 13, dataLabelFontBold: true,
      dataLabelFontFace: F, dataLabelFormatCode: '"$"0.0"K"',
      valAxisMinVal: 0, valAxisMaxVal: 180, valAxisMajorUnit: 60,
      valAxisLabelColor: C.dim, valAxisLabelFontSize: 10, valAxisLabelFontFace: F,
      catAxisLabelColor: C.muted, catAxisLabelFontSize: 11.5, catAxisLabelFontFace: F,
      valGridLine: { color: '1C2740', size: 1 },
      catGridLine: { style: 'none' },
      valAxisLineShow: false, catAxisLineShow: true, catAxisLineColor: '23304A',
      plotArea: { fill: { color: C.bg } },
      chartArea: { fill: { color: C.bg }, border: { pt: 0, color: C.bg } },
    });
  }
}

D.slides.forEach((sl) => {
  const slide = pres.addSlide();
  slide.background = { color: sl.bg || C.bg };

  sl.ops.forEach((op) => {
    if (op.t === 'rect') {
      const o = {
        x: op.x, y: op.y, w: op.w, h: op.h,
        fill: op.fill ? { color: op.fill } : { type: 'none' },
      };
      if (op.line) o.line = { color: op.line, width: op.lw };
      else o.line = { color: op.fill || C.bg, width: 0 };
      if (op.r) { o.rectRadius = op.r; slide.addShape(pres.ShapeType.roundRect, o); }
      else slide.addShape(pres.ShapeType.rect, o);
    } else if (op.t === 'text') {
      slide.addText(op.s, {
        x: op.x, y: op.y, w: op.w, h: op.h,
        fontFace: F, fontSize: op.size, bold: !!op.bold, italic: !!op.italic,
        color: op.color, align: op.align || 'right', valign: op.valign || 'top',
        rtlMode: !!op.rtl, lang: op.rtl ? 'he-IL' : 'en-US',
        margin: 0, charSpacing: op.cs || 0,
        lineSpacingMultiple: op.lh || 1.0,
        wrap: true, shrinkText: false,
      });
    } else if (op.t === 'chart') {
      drawChart(slide, op);
    }
  });
});

pres.writeFile({ fileName: process.argv[2] || 'Harel_ECS_to_S3_CIO.pptx' })
  .then((f) => console.log('wrote', f));
