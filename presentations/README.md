# Cloud FinOps — FY2026 executive deck

A rebuild of `Cloud_FinOps_Harel_September_26.pptx` as a CIO-facing presentation.

| File | What it is |
|---|---|
| `Cloud_FinOps_Harel_FY2026_September.pptx` | The deck. 41 slides, 16:9, speaker notes on the narrative slides. |
| `Cloud_FinOps_Harel_FY2026_September.pdf` | Same deck as PDF — a safe fallback for projector/room systems. |
| `generator/` | Source that builds the deck, so next month is a data refresh rather than a redraw. |

## What changed from the source deck

**Structure.** The original was 47 slides of chart-per-cost-centre, each titled with what
it contained (`2026 Consumption By Service Name`). This version is 33 narrative slides plus
an 8-slide appendix, organised as: bottom line → where the money goes → AI → AWS → Azure →
savings → risks and asks. Every slide title now states the finding rather than the contents.

**The headline.** Pulling the AI services out of all three clouds showed the story the
original deck had but never stated: AI went from **$9K to $102K a month** (11x, now 34% of
consumption) while everything else **fell 13%** Q1→Q3. That is slides 2, 6 and 9.

**Charts.** Stacked bars of 22–37 series with 7pt legends became top-5-plus-other at 11.5pt,
plus ranked bar lists where the labels matter more than the shape. Fifteen near-identical
cost-centre slides became one small-multiples page in the appendix.

**Added.** Executive summary, compute-coverage comparison (AWS 93% vs Azure 54%), a savings
pipeline cut by action type as well as by business unit, a consolidated risks slide, an
explicit "three decisions" ask, and a methodology page.

**Recommendations, not source data.** The AI-governance controls (slide 13) and the three
asks (slide 33) are drafted proposals, not figures from the original deck — review before
presenting.

## Open reconciliation

Azure Marketplace sums to **$542K** across the source charts against the **$563K** quoted on
the original slide 12. The $21K gap is unexplained and is flagged on the appendix notes page.
Consumption figures are unaffected.

## Key figures (all year to date, January–September 2026)

| | |
|---|---|
| Total cloud | $4.67M |
| — consumption | $2.31M |
| — committed / Marketplace | $2.36M |
| AWS (consumption + Marketplace) | $792K + $1.82M |
| Azure (consumption + Marketplace) | $1.51M + $542K |
| GCP | $13.5K |
| AI services | $412K YTD · $102K in September |
| Savings realised / avoided | $268K / $310K |
| Identified pipeline | $190K |

## Rebuilding the deck

```bash
cd generator
npm install          # pptxgenjs
node build.js        # writes ../Cloud_FinOps_Harel_FY2026_September.pptx
```

`build.js` composes six section modules (`sec_open`, `sec_ai`, `sec_aws`, `sec_azure`,
`sec_value`, `sec_close`, `sec_appendix`) on the shared theme and component library in
`build_core.js`. It warns on any action title long enough to wrap onto a second line.

### Refreshing the numbers next month

All figures come from `generator/deck_data.json`. To regenerate it from a new source deck:

```bash
cd generator
mkdir -p work && python3 -c "import zipfile;zipfile.ZipFile('NEW.pptx').extractall('work/unpacked')"
WORK=$PWD/work python3 -I tools/dump2.py > work/charts.json   # chart XML -> JSON
WORK=$PWD/work python3 -I tools/prep.py                        # -> work/deck_data.json
WORK=$PWD/work python3 -I tools/agg2.py                        # prints totals, for checking
cp work/deck_data.json .
node build.js
```

`tools/assets.py` re-extracts the Harel and cloud-provider logos from a source deck into
`generator/assets/` — only needed if the branding changes.

### Checking the output

```bash
python <pptx-skill>/scripts/office/validate.py ../Cloud_FinOps_Harel_FY2026_September.pptx
soffice --headless --convert-to pdf ../Cloud_FinOps_Harel_FY2026_September.pptx
```

## Design

Deep navy `0B1B2E` with the Harel swirl colours as accents — green `00A878` for savings,
blue `0F7DC2` for Azure, gold `F2A900` for AWS, violet `7C5CFF` for AI, red `D7263D` for
risk. Cambria for titles, Arial for everything else; both ship with Office, so the deck
renders identically on any machine in the room. Dark title, dividers and conclusion;
light content slides. Body text never drops below 10pt, titles are 28pt.

Hebrew (title, roadmap, closing) uses RTL paragraphs with directional isolates around the
Latin terms, so product names and the `ו-` conjunction stay in the right order.
