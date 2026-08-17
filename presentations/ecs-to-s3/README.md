# ECS → AWS S3 — CIO decision deck

`Harel_ECS_to_S3_CIO.pptx` — 10 slides, Hebrew (RTL), 13.333" × 7.5".

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

`src/theme.js` carries the design tokens and the `he()` helper, which wraps embedded
Latin/numeric runs in Unicode isolates (U+2066/U+2069) so the bidi algorithm does not
scramble terms like `AWS S3` or `$695,520` inside Hebrew sentences. Parentheses are
deliberately left outside the isolates — inside one they render mirrored.

## Source data

- `ECS_Forecast_Chart.html` — utilisation actuals Sep-24 → Aug-26, capacity, 80% threshold
- `ECS_to_S3_Migration_Decision.pptx` — original 8-slide Hebrew deck
- Dell quote: $695,520 for 1,800 TB net (3,024 TB gross), $386/TB net

## Corrections applied to the source material

1. **80% breach date.** The dashboard labels Oct-2026. Its own forecast series reaches
   only 695 TB (75.9%) that month; 80% = 733 TB. Restated as a three-scenario range:
   Nov-2026 (accelerated) → Jan-2027 (dashboard slope) → Mar-2027 (12-month trend).
   October is the *procurement* target, not the breach date.
2. **Current utilisation.** 668/916 = 72.9%, not the dashboard's "~75%".
3. **December forecast.** Dashboard tile says 710 TB; its own series says 725 TB.
4. **Growth rate.** 12-month actual is 9.9 TB/month, not "~11". The last three months
   (Jun–Aug 26) are flat.
5. **Slide 2 vs slide 3 of the original deck** disagreed on the breach month
   (November vs October). Resolved to the scenario range above.
6. **Cost comparison tier.** The original compares On-Prem only against S3 Standard.
   For write-once, rarely-read archival data the correct tier is Glacier Instant
   Retrieval (~$25K/100 TB/5yr) or Standard-IA (~$77K), against On-Prem's $116K —
   which reverses the "Dell is 16–30% cheaper" conclusion. Both sides are now shown,
   with the egress/retrieval/minimum-object-size counterweights.

Pricing is AWS list price and needs re-quoting for `il-central-1` if data residency
in Israel is required.
