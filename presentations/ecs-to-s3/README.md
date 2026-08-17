# ECS → AWS S3 — CIO decision deck

`Harel_ECS_to_S3_CIO.pptx` — 11 slides, Hebrew (RTL), 13.333" × 7.5".

Design system matches `Harel_Cloud_Cost_CIO_v16.pptx`: dark `0E1422` canvas, `182133`
cards, Calibri, ALL-CAPS eyebrow → claim headline → hairline, KPI stat rails, and the
cyan/green/orange/red/purple accent set.

## Rebuilding

```bash
npm install pptxgenjs
node src/render-pptx.js Harel_ECS_to_S3_CIO.pptx
```

`src/deck.js` holds all content and geometry as a renderer-agnostic op list.
`src/render-pptx.js` emits the .pptx; `src/render-html.js` emits a pixel-accurate HTML
mirror of the same ops for visual QA (screenshot it with Chromium — LibreOffice cannot
render in the build sandbox).

### Hebrew bidi — read before editing any string

`src/theme.js` carries the design tokens and the `he()` helper. Two rules, both learned
the hard way:

1. **Use the classic embeddings (U+202A LRE / U+202B RLE / U+202C PDF), never the
   Unicode 6.3 isolates (U+2066 LRI / U+2069 PDI).** PowerPoint has no glyph for the
   isolates, so every marked number renders wrapped in tofu boxes. The embeddings are
   what the hand-authored Harel decks use and what PowerPoint's bidi engine handles.
2. **Mark whole non-Hebrew spans, not individual tokens.** Marking tokens leaves two
   LTR islands separated only by neutrals — `2025 — 220 TB`, `75% (687 TB)` — and when
   the surrounding RTL run is reversed the two islands swap, so it reads
   `220 TB — 2025`. Keeping the neutrals inside a single embedding keeps the span
   intact. Sentence punctuation (leading `-`, trailing `.` `,` `·`) is trimmed back out
   of the span so it stays in the RTL run.

3. **Never let a bracket open inside an embedding and close outside it.**
   `il-central-1 (תל אביב)` puts `(` inside the LTR span and `)` in the RTL run, and
   the two render mirrored. Keep brackets wholly inside one embedding or wholly
   outside every embedding — in practice, reword to avoid the pattern.

Verify after any change with `node src/qa.js`, which renders `preview.html` and checks
four things: unbalanced bracket spans, text overflow, text-box collisions, and bidi
embedding order (within each RTL box every successive LRE…PDF embedding must sit
further left than the last). Do not eyeball RTL from a screenshot — it is very easy to
misread, and the overflow check alone will not catch two boxes drawn on top of each
other.

## Source data

- `ECS_Forecast_Chart.html` — utilisation actuals Sep-24 → Aug-26, capacity, 80% threshold
- `ECS_to_S3_Migration_Decision.pptx` — original 8-slide Hebrew deck
- Dell quote: $695,520 for 1,800 TB net (3,024 TB gross), $386/TB net

## The deck's spine

Three dates carry the whole argument, and every slide is aligned to them:

| | |
|---|---|
| **Today, Aug 2026** | 75% utilisation — 687 TB of 916 TB usable, 46 TB of headroom |
| **October 2026** | Last date a PO can be issued. Dell lead time is ~2 months. |
| **December 2026** | 80% threshold (733 TB) is crossed, and the disks land — just in time |

80% is framed as an availability risk, not a budget event: above it performance
degrades and downtime exposure rises. The crossing date is not ours to control; the
PO date is. A PO issued after October arrives after the threshold is already breached.

## Corrections applied to the source material

1. **Current utilisation is 75%** (687 TB of 916 TB), per the business. An earlier
   revision of this deck used 668 TB / 72.9% taken from the dashboard's used figure —
   that used figure was stale.
2. **Cost comparison tier.** The original compares On-Prem only against S3 Standard.
   For write-once, rarely-read archival data the correct tier is Glacier Instant
   Retrieval (~$25K/100 TB/5yr) or Standard-IA (~$77K), against On-Prem's $116K —
   which reverses the "Dell is 16-30% cheaper" conclusion. Both sides are shown,
   with the egress/retrieval/minimum-object-size counterweights.
3. **Corpus naming.** The migrated corpus is the imaging (dimut) and Verint
   call-recording data. An earlier revision carried "Commit" over from the source deck.

Pricing is AWS list price and needs re-quoting for `il-central-1` if data residency
in Israel is required.
