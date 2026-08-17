// Design tokens lifted from Harel_Cloud_Cost_CIO_v16.pptx
const C = {
  bg:        '0E1422',
  bgDeep:    '070A12',
  card:      '182133',
  cardAlt:   '141C2C',
  border:    '23304A',
  hair:      '23304A',
  text:      'F4F7FB',
  muted:     '91A0B7',
  dim:       '5E6E85',
  cyan:      '3DD9EB',
  green:     '3DDC97',
  orange:    'FF9F43',
  red:       'FF6B7A',
  purple:    'B07CFF',
  blue:      '2F8CFF',
};

const F = 'Calibri';

// Slide grid (13.333 x 7.5)
const G = {
  W: 13.333, H: 7.5,
  M: 0.9,                 // side margin
  CW: 11.533,             // content width
  eyebrowY: 0.52,
  headY: 0.86,
  hairY: 1.86,
  bodyY: 2.16,
  footHairY: 6.46,
  footY: 6.66,
};

// --- RTL helpers -------------------------------------------------------
// PowerPoint does NOT render the Unicode 6.3 isolates (U+2066 LRI / U+2069 PDI):
// Calibri has no glyph for them, so every marked number shows up wrapped in tofu
// boxes. Use the classic embeddings (U+202A/U+202B/U+202C) instead — the same
// family the hand-authored Harel decks use, which PowerPoint's bidi engine
// handles correctly.
//
// The embedding around each LTR token is still required. Plain bidi inside an
// RTL paragraph mis-orders "220 TB": the digits and "TB" both resolve to an LTR
// level, but the space between them falls back to the paragraph's RTL level, so
// the two halves swap and it renders "TB 220". (The source deck dodges this by
// writing "668TB" with no space.) Wrapping the whole token in LRE…PDF keeps it
// on one level and fixes the order.
const RLE = '‫';   // right-to-left embedding  (U+202B)
const LRE = '‪';   // left-to-right embedding  (U+202A)
const PDF = '‬';   // pop directional formatting (U+202C)

// Mark whole non-Hebrew SPANS, not individual tokens. Marking tokens
// individually leaves two LTR islands separated only by neutrals — "2025 — 220
// TB", "75% (687 TB)" — and when the surrounding RTL run is reversed those two
// islands swap places, so the sentence reads "220 TB — 2025". Keeping the
// neutrals inside one embedding keeps the span in one piece.
const HEB = /[֐-׿]/;
const SEG = /[֐-׿]+|[^֐-׿]+/g;
// Punctuation that belongs to the Hebrew sentence rather than to the LTR span,
// trimmed off both ends so it stays in the RTL run (a sentence-ending period
// must sit on the left, and a "-" prefix must stay glued to its Hebrew letter).
const EDGE = /^[\s.,;:·|\-–—]+|[\s.,;:·|\-–—]+$/g;

function he(s) {
  if (!s) return s;
  // Per line: an unterminated embedding would leak across a line break.
  return s.split('\n').map((line) => {
    if (!line) return line;
    const marked = (line.match(SEG) || []).map((seg) => {
      if (HEB.test(seg) || !/[A-Za-z0-9]/.test(seg)) return seg;
      const core = seg.replace(EDGE, '');
      if (!core) return seg;
      const i = seg.indexOf(core);
      return seg.slice(0, i) + LRE + core + PDF + seg.slice(i + core.length);
    }).join('');
    return RLE + marked + PDF;
  }).join('\n');
}

module.exports = { C, F, G, he, RLE, LRE, PDF };
