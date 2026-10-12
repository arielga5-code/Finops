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

`build.js` composes seven section modules on the shared theme and component library in
`build_core.js`:

| File | Slides |
|---|---|
| `sec_open.js` | Title, bottom line, agenda, total spend, run-rate, committed purchases |
| `sec_ai.js` | AI spend, AI Factory, Bedrock, GitHub/Copilot, governance |
| `sec_aws.js` | AWS overview, by account, by service, Marketplace |
| `sec_azure.js` | Azure overview, cost centres, services, coverage, Databricks, GCP |
| `sec_value.js` | Savings scorecard, implemented, pipeline |
| `sec_close.js` | Risks, roadmap (Hebrew), the ask, thank you |
| `sec_appendix.js` | Cost-centre small multiples, Harel IL, AI Factory, Foundry, North Europe, notes |

### Conventions that matter

- **All figures come from `deck_data.json`.** Never type a number into a section module
  that is not either derived from that file or a documented constant. If a figure in prose
  (a chip, a stat tile, an action title) is computed from the data, verify it against the
  data before changing it — several percentages in the deck are cross-checked totals.
- **Action titles must fit one line** at 28pt across the 12.09" content width, which is
  about 64 characters. `build.js` prints a warning listing any title that will wrap. Treat
  that warning as an error.
- **Content lives between `TOP` (1.72") and `BOT` (6.58")**, both exported from
  `build_core.js`. The footer sits at 7.04". Anything drawn below `BOT` collides with the
  footnote, and anything below ~6.95" collides with the footer.
- **Side-panel rank lists hold 8 rows at `rowH: 0.42`** starting at `TOP + 0.58`, with the
  summary chip at `TOP + 4.06`. More rows than that overflow the panel.
- **Use the component library**, not raw shapes: `head`, `note`, `stat`, `panel`, `chip`,
  `bulletRow`, `rankList`, `divider`, `axisBase`, `legendBase`. Chart option builders
  return a fresh object per call because pptxgenjs mutates options in place.
- **Colours come from `P`** (hex mirror of the theme) and the theme itself from `THEME`.
  Green is savings, blue Azure, gold AWS, violet AI, red risk. Keep that mapping.
- **Hebrew** (title, roadmap, closing) uses `rtlMode: true` plus the `ltr()` helper in
  `sec_close.js`, which wraps Latin runs in directional isolates and non-breaking spaces.
  Any new Hebrew string with embedded Latin must go through `ltr()` or the word order and
  punctuation will scramble.

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

Always do all three. The first render of any change usually has a real layout defect.

```bash
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
