# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this repo is

Two unrelated bodies of work that happen to share a FinOps subject:

- **`docs/` + `assets/`** — an implementation reference for running Azure cost management
  on the Elastic Stack. Markdown docs plus ready-to-apply ES|QL queries, Kibana alert
  payloads and ML job definitions. Nothing here builds or runs; it is reference material
  that gets copied into Kibana.
- **`presentations/`** — the FY2026 Cloud Cost Summary deck for the CIO, and the
  generator that builds it. This *is* code and it does run.

Changes to one side almost never imply changes to the other.

## Working on the deck

The deck is generated, not hand-edited. **Never edit the `.pptx` directly** — it will be
overwritten on the next build, and hand-edits do not survive a data refresh.

```bash
cd presentations/generator
npm install          # pptxgenjs, once
node build.js        # -> ../Cloud_FinOps_Harel_FY2026_September.pptx
```

`build.js` composes six section modules on the shared theme and component library in
`build_core.js`. The main line of argument is 25 slides; everything else is appendix.

| File | Slides |
|---|---|
| `sec_open.js` | Title, bottom line, agenda, total spend, run-rate, committed purchases |
| `sec_ai.js` | AI spend, GitHub and Copilot, governance controls |
| `sec_platforms.js` | AWS overview, Azure overview, compute coverage, Databricks |
| `sec_value.js` | Savings scorecard, implemented, pipeline |
| `sec_close.js` | Risks, roadmap (Hebrew), the ask, thank you |
| `sec_appendix.js` | AWS and Azure detail, small multiples, AI Factory, Bedrock, Foundry, GCP, North Europe, notes |

**Detail belongs in the appendix.** The CIO deck carries one message per slide. Anything that
is a breakdown rather than an argument (by account, by service, by cost centre, per project)
goes in `sec_appendix.js` and is referenced from the speaker notes of the slide it supports.

### Conventions that matter

- **All figures come from `deck_data.json`.** Never type a number into a section module
  that is not either derived from that file or a documented constant. If a figure in prose
  (a chip, a stat tile, an action title) is computed from the data, verify it against the
  data before changing it — several percentages in the deck are cross-checked totals.
- **Action titles must fit one line** at 28pt across the 12.09" content width, which is
  about 64 characters. `build.js` prints a warning listing any title that will wrap. Treat
  that warning as an error.
- **Take every frame from `G`**, the geometry table in `build_core.js`: `G.chart` and
  `G.rail` for a chart with a detail rail, `G.tileY`/`G.tileH` with `tileX(i,n)`/`tileW(n)`
  for a row of stat tiles, `G.lowChart`/`G.lowPanel` for the band beneath them, and
  `G.statRail` for stacked tiles beside a chart. Never hand-place a frame that `G` already
  describes, or slides of the same type will drift apart.
- **Content lives between `TOP` (1.72") and `BOT` (6.58")**, both exported from
  `build_core.js`. The footer sits at 7.04". Anything drawn below `BOT` collides with the
  footnote, and anything below ~6.95" collides with the footer.
- **Side-panel rank lists hold `G.railRows` (8) rows at `G.railRowH`** from `G.railListY`,
  with the summary chip at `G.railChipY`. More rows than that overflow the rail. In the
  appendix use the local `railChart()` helper, which applies all of this for you.
- **Every `addImage` needs an explicit `altText`.** pptxgenjs otherwise writes the absolute
  source path into the image's `descr` attribute, which is visible to anyone who opens the
  alt-text panel in PowerPoint.
- **Use the component library**, not raw shapes: `head`, `note`, `stat`, `panel`, `chip`,
  `bulletRow`, `rankList`, `divider`, `axisBase`, `legendBase`. Chart option builders
  return a fresh object per call because pptxgenjs mutates options in place.
- **Colours come from `P`** (hex mirror of the theme) and the theme itself from `THEME`.
  Green is savings, blue Azure, gold AWS, violet AI, red risk. Keep that mapping.
- **Hebrew** (title, roadmap, closing) uses `rtlMode: true` plus the `ltr()` helper in
  `sec_close.js`, which wraps Latin runs in directional isolates and non-breaking spaces.
  Any new Hebrew string with embedded Latin must go through `ltr()` or the word order and
  punctuation will scramble.
- **Write the prose like a person wrote it.** No em dashes or en dashes in body text (an en
  dash as a minus sign in `–13%` is fine). No three-item lists unless there are genuinely
  three things, no "not X but Y", no one-line closers that restate the slide, no inflation
  ("the single biggest", "the only line that matters"). Speaker notes are what the presenter
  would actually say out loud, not narration about the slide.

### Refreshing the numbers for a new month

```bash
cd presentations/generator
mkdir -p work
python3 -c "import zipfile;zipfile.ZipFile('NEW_SOURCE.pptx').extractall('work/unpacked')"
WORK=$PWD/work python3 -I tools/dump2.py > work/charts.json   # chart XML -> JSON
WORK=$PWD/work python3 -I tools/prep.py                        # -> work/deck_data.json
WORK=$PWD/work python3 -I tools/agg2.py                        # prints totals — check these
cp work/deck_data.json .
node build.js
```

`tools/dump2.py` honours the `idx` attribute on each `<c:pt>`. That matters: series with
gaps (a service that started mid-year) misalign badly if points are read positionally.

Python deps for the extractors: `lxml`, `Pillow`, `numpy`.

### Checking the output before shipping

Always do all four. The first render of any change usually has a real layout defect.

```bash
# 0. figures — recomputes all 102 quoted numbers from deck_data.json
node tools/verify_figures.js

# 1. file integrity
python <pptx-skill>/scripts/office/validate.py ../Cloud_FinOps_Harel_FY2026_September.pptx

# 2. content — look for missing text, wrong order, stray placeholders
markitdown ../Cloud_FinOps_Harel_FY2026_September.pptx

# 3. visual — render and actually look at every slide you touched
soffice --headless --convert-to pdf ../Cloud_FinOps_Harel_FY2026_September.pptx
pdftoppm -jpeg -r 120 Cloud_FinOps_Harel_FY2026_September.pdf slide
```

Visual QA is not optional. Text overflow, panel collisions and chips landing on top of
list rows all pass validation and all look wrong on a projector. Check slides against each
other too, not just each slide against itself — titles and chart labels drift.

If the `pptx` skill is available it provides `validate.py`, `thumbnail.py` and a
`soffice.py` wrapper that works headless in sandboxes. The generator itself does not
depend on the skill; `apply_theme.js` is vendored here because pptxgenjs cannot write
theme colours on its own.

### Image assets

`assets/` holds the Harel and cloud-provider logos, already right-sized and palette
quantised (31KB total, down from 336KB). If you re-extract them with `tools/assets.py`,
quantise before committing — these are drawn at 1–2 inches and full-colour RGBA at 900px
tripled the deck size for no visible gain.

## Known open item

Azure Marketplace sums to **$542K** across the source charts against the **$563K** quoted
on the original deck's slide 12. The $21K gap is unexplained, is flagged on the deck's
appendix notes page, and does not affect consumption figures. If it gets resolved, update
both `presentations/README.md` and the notes slide in `sec_appendix.js`.

## Data sensitivity

This repo contains real internal cloud spend for Harel Insurance — account names,
cost centres, vendor contract values and savings figures. Treat it as confidential.
Do not paste figures into external services or public issues.
