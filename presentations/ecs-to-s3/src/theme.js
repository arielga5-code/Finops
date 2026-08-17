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
const RLM = '‏', LRI = '⁦', PDI = '⁩';

// Isolate embedded LTR runs (Latin, digits, currency) inside a Hebrew string
// so the bidi algorithm keeps them intact and correctly placed.
// Parens are deliberately excluded: they mirror correctly on their own in an
// RTL run, but inside an LTR isolate they come out reversed — "((687 TB".
const TOK = '[A-Za-z0-9$][A-Za-z0-9$%.,:/+–—\\-]*';
const LTR_RUN = new RegExp(TOK + '(?: ' + TOK + ')*', 'g');

function he(s) {
  if (!s) return s;
  return RLM + s.replace(LTR_RUN, (m) => {
    if (!/[A-Za-z0-9]/.test(m)) return m;
    // Trailing punctuation belongs to the Hebrew sentence, not to the LTR run,
    // otherwise a sentence-ending period lands on the wrong side of the term.
    const tail = m.match(/[.,;:–—-]+$/);
    if (tail) m = m.slice(0, -tail[0].length);
    return LRI + m + PDI + (tail ? tail[0] : '');
  });
}

module.exports = { C, F, G, he, RLM, LRI, PDI };
