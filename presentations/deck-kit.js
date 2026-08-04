/*
 * deck-kit — the shared visual system: palette, type, icon rendering and the
 * handful of primitives every slide is built from.
 *
 * Both builders require this, so the full deck and the five-slide CIO brief
 * cannot drift apart. Call setPres(pres) once after creating the presentation;
 * the shape helpers need it to reach pptxgenjs ShapeType.
 */
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const Fi = require("react-icons/fi");
const sharp = require("sharp");

/* ---------- palette ---------- */
const DARK = "141A22";
const DARK_CARD = "1F2936";
const WHITE = "FFFFFF";
const TINT = "F1F3F6";
const INK = "1B2430";
const MUTED = "5C6675";
const MUTED_D = "9EABBA";
const AMBER = "E39B2C";
const AMBER_SOFT = "FBEFD8";
const TEAL = "2E8B7A";
const TEAL_SOFT = "DDEDE9";

const HEAD = "Cambria";
const BODY = "Calibri";

const W = 13.33, H = 7.5, M = 0.6;

/* ---------- icons ---------- */
const iconCache = {};
async function icon(name, hex) {
  const key = name + hex;
  if (iconCache[key]) return iconCache[key];
  const Comp = Fi[name];
  if (!Comp) throw new Error("unknown icon " + name);
  let svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Comp, { size: 256, strokeWidth: 2 })
  );
  svg = svg.replace(/currentColor/g, "#" + hex);
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  const data = "image/png;base64," + buf.toString("base64");
  iconCache[key] = data;
  return data;
}

const softShadow = () => ({
  type: "outer", color: "8C99A8", blur: 10, offset: 2, angle: 90, opacity: 0.16,
});

let pres;
function setPres(p) { pres = p; }

/* ---------- primitives ---------- */
function bg(slide, color) {
  slide.background = { color };
}

function card(slide, o) {
  slide.addShape(pres.ShapeType.roundRect, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: { color: o.fill },
    rectRadius: o.radius === undefined ? 0.09 : o.radius,
    line: o.line ? { color: o.line, width: 1 } : { type: "none" },
    shadow: o.shadow === false ? undefined : softShadow(),
  });
}

async function iconBadge(slide, o) {
  const d = o.d || 0.62;
  slide.addShape(pres.ShapeType.ellipse, {
    x: o.x, y: o.y, w: d, h: d,
    fill: { color: o.bg },
    line: { type: "none" },
  });
  const s = d * 0.5;
  slide.addImage({
    data: await icon(o.icon, o.color),
    x: o.x + (d - s) / 2, y: o.y + (d - s) / 2, w: s, h: s,
  });
}

function kicker(slide, text, dark) {
  slide.addText(text.toUpperCase(), {
    x: M, y: 0.52, w: 8, h: 0.28,
    fontFace: BODY, fontSize: 11, bold: true, charSpacing: 2.2,
    color: AMBER, margin: 0, valign: "middle",
  });
}

function title(slide, text, dark, opts = {}) {
  slide.addText(text, {
    x: M, y: opts.y || 0.84, w: opts.w || 12.13, h: opts.h || 0.88,
    fontFace: HEAD, fontSize: opts.size || 31, bold: true,
    color: dark ? WHITE : INK, margin: 0, valign: "middle",
  });
}

function sub(slide, text, dark, o = {}) {
  slide.addText(text, {
    x: M, y: o.y || 1.68, w: o.w || 11.6, h: o.h || 0.4,
    fontFace: BODY, fontSize: o.size || 15,
    color: dark ? MUTED_D : MUTED, margin: 0, valign: "middle",
    italic: !!o.italic,
  });
}

function quoteBlock(slide, o) {
  card(slide, { x: o.x, y: o.y, w: o.w, h: o.h, fill: o.fill, shadow: o.shadow });
  slide.addText(o.text, {
    x: o.x + 0.32, y: o.y + 0.12, w: o.w - 0.64, h: o.h - 0.24,
    fontFace: HEAD, fontSize: o.size || 14, italic: true,
    color: o.color, margin: 0, valign: "middle", lineSpacing: o.lineSpacing || 20,
  });
}

/* icon + label + description row */
async function iconRow(slide, o) {
  const d = o.d || 0.56;
  await iconBadge(slide, {
    x: o.x, y: o.y + (o.h - d) / 2, d,
    bg: o.badgeBg, icon: o.icon, color: o.iconColor,
  });
  const tx = o.x + d + 0.28;
  slide.addText(
    [
      { text: o.label, options: { bold: true, fontSize: o.labelSize || 15, color: o.labelColor, breakLine: true } },
      { text: o.desc, options: { fontSize: o.descSize || 12.5, color: o.descColor } },
    ],
    {
      x: tx, y: o.y, w: o.w - (d + 0.28), h: o.h,
      fontFace: BODY, margin: 0, valign: "middle", lineSpacing: o.lineSpacing || 16,
    }
  );
}

function dotGrid(slide, o) {
  const { x, y, cols, rows, gap, d } = o;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = o.lit(c, r);
      slide.addShape(pres.ShapeType.ellipse, {
        x: x + c * gap, y: y + r * gap, w: d, h: d,
        fill: { color: lit ? AMBER : o.dim },
        line: { type: "none" },
      });
    }
  }
}


module.exports = {
  DARK, DARK_CARD, WHITE, TINT, INK, MUTED, MUTED_D,
  AMBER, AMBER_SOFT, TEAL, TEAL_SOFT,
  HEAD, BODY, W, H, M,
  setPres, icon, softShadow, bg, card, iconBadge, kicker, title, sub,
  quoteBlock, iconRow, dotGrid,
};
