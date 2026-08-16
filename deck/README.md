# Cloud FinOps deck — Harel, 2026

Rebuilds the *Cloud FinOps Harel July 26* review (slides 2 → 42) in the visual
language of the *Harel Cloud Cost — CIO v33* deck, so the operational review and
the executive briefing read as one document.

```bash
cd deck
npm install          # pptxgenjs only
npm run build        # -> Cloud_FinOps_Harel_2026.pptx
npm run build -- /path/to/Somewhere_Else.pptx
```

Output: 40 slides, 13.333" × 7.5", dark theme, native PowerPoint charts and
tables (everything stays editable in PowerPoint — nothing is a picture).

## How it is put together

| File | What it owns |
|---|---|
| `lib/theme.js` | Colours, fonts, type scale, slide geometry. **Restyle the whole deck here.** |
| `lib/components.js` | Slide chrome, cards, stat tiles, tables, chart wrappers. Change how a *kind* of slide is laid out. |
| `content.js` | Every headline, callout, table row and slide order. Change what the deck *says*. |
| `data/charts.json` | The numeric series, extracted from the source `.pptx` chart parts. |
| `build.js` | Assembles the above. One renderer per slide `kind`. |

### Customising it

**Change the colours.** Everything visual routes through `lib/theme.js`. Swapping
`COLORS.bg` to `FFFFFF` and `COLORS.text` to `111111` flips the deck to light;
`SERIES` controls every chart palette. Each cloud keeps one accent across all
40 slides (`azure` blue, `aws` orange, `gcp` green, `ai` purple) — change one
entry and every slide for that cloud follows.

**Change the words.** `content.js` is a plain array. Edit a `title`, `note`,
`foot` or `notes.items`; reorder or delete entries to reorder or drop slides.

**Change the numbers.** Edit `data/charts.json` — each chart is
`{ cats: [...months], series: [{ name, vals: [...] }] }`. Stat tiles written as
`auto:total`, `auto:last`, `auto:top`, `auto:topshare`, `auto:change`,
`auto:series:<name>` are recomputed from that file at build time, so a figure on
a slide can never drift away from the chart beside it. Hard-coded strings
(`"$504,000"`) are used only where the number does not come from a chart.

**Add a slide.** Add an object to `content.js` with one of the existing kinds:

- `section` — part divider
- `agenda` — numbered card grid
- `chart` — one chart plus a right-hand stat rail and optional bullet notes
- `dualChart` — stat strip across the top, two charts below
- `table` — one or two tables plus stats (side by side if they fit, otherwise a right-hand rail)
- `closing` — sign-off

If you need a layout none of those covers, add a new renderer to the `RENDER`
map in `build.js` rather than special-casing an existing one.

**Wide charts.** Source workbooks carry up to 38 series per chart. Each chart
spec takes `top: n` — the n largest series are kept and the rest are rolled into
a single "All other" band. Raise or lower it per slide.

## Source mapping

| Source slides | Rebuilt as |
|---|---|
| 2 | Agenda |
| 3–7 | AWS: accounts, services, Harel IL billing account, Marketplace |
| 8–20 | Azure: cost centres, services, Marketplace, and each cost centre in turn |
| 21 | Coverage by vendor (purchase options) |
| 22 | Databricks reserved capacity |
| 23–24 | GCP |
| 25–35 | AI Factory: projects, Solugen, OCR, INSAIT, Cognitive Search, Foundry, Bedrock, sandbox, GitHub/Copilot |
| 36–40 | Optimisation: recommendations, implemented savings, North Europe |
| 41 | Next steps (Hebrew, right-to-left) |
| 42 | Thank you |

Source slides 36 and 38 were both plain dividers introducing the same section;
they are merged into one.

## Numbers that did not agree with their own charts

Three slides in the source deck carried a stated total that its own embedded
chart does not support. The charts are the same file's data, so this deck uses
the chart-derived figure and flags it here rather than reprinting the caption:

| Source slide | Stated in the caption | Sum of the slide's chart | Used here |
|---|---|---|---|
| 32 — Foundry Models & Tools | $323K | $87,084 | $87K |
| 33 — Bedrock services | $17,208 | $42,057 | $42K |
| 24 — GCP services | $4,505 | $8,212 | $8,212 |

Every other stated total reconciles to its chart within rounding (AWS $584K,
AWS Marketplace $1.54M, Azure $1.12M, Azure Marketplace $551K, DataCloud $339K,
SAP $294K, Cloud IT $216K, AI Factory $92K, and the rest).

Worth confirming which figure is correct before the deck is presented — most
likely the captions are stale text left over from an earlier data refresh.

## Notes on the data

- Chart categories in the source are Excel date serials (46023 … 46204). They
  are converted to month labels **Jan–Jul 2026** during extraction.
- Negative bars are real: the July MAP contract credit on `ai-factory-dev`
  (−$15,320) and a few Azure credits land as negative values, and are left
  visible rather than clipped.
- Marketplace purchases are excluded from every consumption figure and reported
  on their own slides, matching the source deck's convention.
