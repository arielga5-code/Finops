# Cloud FinOps decks — Harel, 2026

Eight decks and two drop-in slide sets, from one design system and one set of source data.

| Deck | Build | Slides | For |
|---|---|---|---|
| **Operational review** | `npm run build` → `Cloud_FinOps_Harel_2026.pptx` | 40 | The monthly FinOps walkthrough, Jan–Jul 2026 |
| **CIO briefing (v34)** | `npm run build:cio` → `Harel_Cloud_Cost_CIO_v34.pptx` | 40 | The combined executive deck: v33's narrative plus the operational findings |
| **FinOps for AI** | `npm run build:ai` → `FinOps_for_AI_CIO.pptx` | 11 | Executive cut of the five AI cost levers and the one-page usage policy |
| **Consumption by vendor** | `npm run build:vendor` → `Cloud_Consumption_by_Vendor.pptx` | 8 | One question: what does each cloud cost per month, and how much of it is AI |
| **AI cost by application** | `npm run build:aicost` → `AI_Cost_by_Application.pptx` | 8 | Which application spent the AI budget, and how much of the figure can be proved |
| **AI cost, July 2026** | `npm run build:aijuly` → `AI_Cost_July_2026.pptx` | 7 | The last complete month, on its own terms, as the baseline everything else is measured against |
| **AI cost, August month to date** | `npm run build:aiaug` → `AI_Cost_August_2026_MTD.pptx` | 8 | What changed against July: the daily rate doubled, and why that is adoption rather than price |
| **AI cost window, for the CIO deck** | `npm run build:aiwindow` → `AI_Cost_Window_Slides.pptx` | 2 | Two slides to paste into the CIO presentation: what the whole window cost, and what drives it |
| **AI cost by team and application** | `npm run build:aiapps` → `AI_Cost_by_Team_and_Application.pptx` | 8 | The named detail: every application, its team, and how its money splits across the three providers |
| **AI consumption, the CIO slide** | `npm run build:aiboard` → `AI_Consumption_CIO_Slide.pptx` | 1 | The presented version: a share strip, a card per team, and a band for the money with no owner |
| **AI consumption, the table** | `npm run build:aitable` → `AI_Consumption_Slide.pptx` | 1 | The same numbers as a table, for anyone who wants to audit a line |

```bash
cd deck
npm install                # pptxgenjs only
npm run build              # operational review
npm run build:cio          # combined CIO briefing
npm run build:ai           # FinOps for AI
npm run build:vendor       # consumption by vendor
npm run build:aicost       # AI cost by application
npm run build:aijuly       # AI cost, July 2026
npm run build:aiaug        # AI cost, August month to date
npm run build:aiwindow     # the two window slides for the CIO deck
npm run build:aiapps       # AI cost by team and application
npm run build:aiboard      # the AI consumption CIO slide
npm run build:aitable      # the same numbers as a table
npm run build:patch        # the replacement slides on their own
npm run build:cio -- /path/to/Somewhere_Else.pptx
```

There is also `npm run fix:final`, which repairs a hand-assembled deck —
see [Repairing a hand-assembled deck](#repairing-a-hand-assembled-deck).

All seven are 13.333" × 7.5", dark theme, native PowerPoint charts and tables
(everything stays editable in PowerPoint — nothing is a picture).

### Sized for a meeting-room screen

The type scale in `lib/theme.js` is set for a wall-mounted flat panel, not a
laptop. Nothing on a slide is below 12pt except two decorative chips. Reading
distances, assuming the slide fills a 16:9 panel and cap height ≈ 0.7 × font
size (comfortable ≈ 150 × cap height):

| On-slide size | Used for | 55" panel | 65" | 75" | 85" |
|---|---|---|---|---|---|
| 12pt | table cells, footnotes, captions, chart axes | 1.6 m | 1.9 m | 2.2 m | 2.5 m |
| 13pt | body text, bullets, eyebrows | 1.7 m | 2.0 m | 2.4 m | 2.7 m |
| 15pt | card and chart headings | 2.0 m | 2.4 m | 2.8 m | 3.2 m |
| 28pt | slide titles, stat values | 3.8 m | 4.4 m | 5.1 m | 5.8 m |
| 42–110pt | hero figures, sign-off | 5.5 m+ | 6.5 m+ | 7.5 m+ | 8.5 m+ |

So on a 65" screen the titles and the big numbers carry to the back of most
meeting rooms; the supporting tables need viewers within roughly 2 m. That is
the deliberate hierarchy — every slide is built so the title plus one stat
tile makes the point on its own.

If the room is deeper than about 4 m, raise `SIZE` in `lib/theme.js` and
re-run the build, then re-check for overflow: `drawTable` and `statTile`
adapt, but dense tables will need rows cut rather than type shrunk.

## How it is put together

| File | What it owns |
|---|---|
| `lib/theme.js` | Colours, fonts, type scale, slide geometry. **Restyle both decks here.** |
| `lib/components.js` | Slide chrome, cards, stat tiles, tables, chart wrappers. |
| `lib/engine.js` | The renderers — one per slide `kind` — and the `auto:` resolver. Shared by both decks. |
| `content.js` | The operational review: every headline, callout, table row and slide order. |
| `content-cio.js` | The combined CIO briefing. Its appendix imports slides straight from `content.js`. |
| `content-ai.js` | The FinOps for AI briefing. |
| `content-vendor.js` | Consumption by vendor, AI against everything else. |
| `content-patch.js` | Replacement slides for the hand-assembled Final deck. |
| `content-aicost.js` | AI cost by application, from the AI_cost_table workbook. |
| `data/charts.json` | The numeric series, extracted from the source `.pptx` chart parts. |
| `data/vendor-split.js` | Derives the vendor × AI split from `charts.json` at build time. |
| `data/ai-platforms.js` | The five AI platforms, Jan–Jul. Shared by every slide that cites one. |
| `data/ai-cost-apps.json` | The AI_cost_table Details sheet, extracted verbatim. |
| `data/ai-cost-apps.js` | Derives the per-application, per-team and reconciliation figures from it. |
| `build*.js` | Thin wrappers that hand a content array to the engine. |
| `tools/merge-slides.py` | Splices generated slides into a hand-assembled deck and repairs its background. |
| `tools/plain-text.py` | Rewrites em dashes, middots, arrows and × into plain typed punctuation. |

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
- `hero` — one dominant figure, contributor cards, optional bullets
- `reconcile` — A − B = C across the top, variance table below, stats under that
- `flow` — consumers → control point → providers
- `steps` — numbered process cards, optionally badged as gates
- `criteria` — numbered requirements in two columns, with a closing banner. Row height and every font size are derived from how much room the item count actually leaves, not fixed, so a short list gets deliberately large type instead of a band of empty canvas. An item may carry an optional `tip` — a one-line practitioner detail in the accent colour under the description; present on every item or none
- `bigStat` — one very large figure with a paragraph beside it
- `platforms` — a share strip over one column per platform: total, share, first and last month, growth
- `mesh` — two columns wired to each other with nothing in between, plus a panel and stats
- `splitBars` — one total split two ways, then the largest lines on a shared scale, coloured by side
- `projectBars` — one thick bar per item, split into two colours to scale, total and badge labelled — for a short list, not a meter table. Name the split with `split: { aLabel, bLabel, aColor, bColor }` and give items `a`/`b`; `infra`/`ai` still work as aliases
- `closing` — sign-off

A chart spec can carry `inline: { cats, series }` instead of an `id`, for
figures that do not come from the extracted workbooks.

If you need a layout none of those covers, add a new renderer to the `RENDER`
map in `lib/engine.js` rather than special-casing an existing one.

**Wide charts.** Source workbooks carry up to 38 series per chart. Each chart
spec takes `top: n` — the n largest series are kept and the rest are rolled into
a single "All other" band. Raise or lower it per slide.

## AI cost by application

Built from `AI_cost_table.xlsx`, whose Details sheet is extracted verbatim into
`data/ai-cost-apps.json` and turned into every figure on the deck by
`data/ai-cost-apps.js`. $43,547 estimated across 101 application rows and
1,250,052 invocations.

The deck leads with confidence rather than with the total, because two
properties of the source change how every other number should be read.

**Just under half the estimate cannot be checked.** The workbook's `CE Actual`
reconciliation column is blank on all 50 Azure rows — $21,067, 48.4% of the
estimate, with nothing to compare against. The workbook's own Notes sheet says
so, and says the deltas only mean anything where the column exists.

**Where it can be checked, the estimate runs low.** On the Claude rows carrying
both figures the estimate says $19,248 and the actual says $21,673, 12.6% high.
GCP is deliberately excluded from that comparison: its estimate equals its
actual to the cent on all 17 rows, so the two columns are one number rather
than two measurements, and counting it would dilute a real variance with rows
that cannot disagree by construction. Claude is the only genuine check in the
workbook.

The deck states the 12.6% as a sensitivity applied to the unreconciled half
(about $2,654), never as a finding — there is no evidence yet that Azure
behaves like Claude, and the slide notes say so explicitly.

**Two defects in the workbook's own summary tabs**, both fixed here rather than
reproduced:

- `Summary_Team` lists ai-factory twice, as `AI-Factory` and `ai-factory`, each
  carrying the full figure. It totals $56,501 against the Details sheet's
  $43,547 — the difference is exactly the duplicated row — and every share on
  that tab is computed against the inflated denominator. `data/ai-cost-apps.js`
  folds team names case-insensitively, so its totals reconcile with
  `Summary_Source` instead.
- Nine rows are named `unknown` or `(unlabeled)`, $5,342 between them: money
  that cannot be charged to anyone regardless of what the reconciliation says.

**No date range is recorded anywhere in the workbook**, so nothing in the deck
claims a period. That is on the fix-it slide, because without it no figure here
can become a run-rate.

## The two period decks: July and August month to date

Built from `AI_cost_July_full.xlsx` and
`AI_cost_by_team_20260801_to_20260819.xlsx`. Both are extracted by
`tools/extract-periods.py` into `data/ai-cost-periods.json`, one row per
application per provider, and every figure on both decks is derived from there
by `data/ai-cost-periods.js`.

```bash
python3 tools/extract-periods.py \
    --july   /path/to/AI_cost_July_full.xlsx \
    --august /path/to/AI_cost_by_team_20260801_to_20260819.xlsx \
    --out    data/ai-cost-periods.json
npm run build:aijuly && npm run build:aiaug
```

`tools/xlsx-dump.py` is the reader underneath it, and is useful on its own for
surveying any workbook without openpyxl installed:

```bash
python3 tools/xlsx-dump.py book.xlsx --rows 40
python3 tools/xlsx-dump.py book.xlsx --json out.json
```

### 19 days is not comparable to 31

The single thing that makes these two files easy to misread. July is a complete
month, August runs to the 19th. Compared as totals, $24,563 against $19,351
reads as 27% growth. Compared per day, $1,293 against $624 is **2.07x**.

Everything comparative in `data/ai-cost-periods.js` is therefore a daily rate,
and everything describing a single period on its own is a period total. The
August deck says which is which on every slide that shows both, and its cover
quotes the daily figures rather than the totals for exactly this reason.

### What the two decks say

**July is the baseline** and never mentions August. $19,350.71 across 45
applications and 560,227 calls. Azure $8,543 and Claude $8,487 are within $55
of each other on wildly different volumes (455,073 calls against 90,707), which
is the whole unit-cost argument. Two applications are 68% of the month. Just
under half of it — $9,016, every Azure row — has no reconciliation figure, and
on the Claude rows that do carry one the estimate runs 30.8% low.

**August is the change.** The daily rate doubled, and it decomposes exactly:
2.01x the calls per day at 1.03x the price per 1,000, giving 2.07x the cost.
That is an adoption curve, not a pricing problem, and the deck says so before
it says anything else — there is nothing to renegotiate in a 2.9% price move.

Three findings sit behind it:

- **$9,849.64 belongs to nobody.** The August export lists two Bedrock charges
  outside every application row and every team total: $9,183.98 of untagged
  actual spend and $665.66 of guardrail fees. That is 44% of all Bedrock actual
  we can see, and 29% of everything we know we spent on AI this month. The
  month to date is $34,413, not $24,563.
- **Tagging went backwards.** Spend with no application name went from $376
  (1.9%) in July to $5,031 (20.5%) in August. July's largest application,
  `agent` on Claude, shrank while a new `unknown` row appeared on the same team
  and the same provider — very likely the same workload having lost its label.
  The deck says "likely", not "is".
- **The largest single mover is internal.** `cli` on Claude, the AI Factory's
  developer command line, went from $15 to $207 a day, 13.7x, which is 29% of
  the entire increase on its own.

One thing did improve, and both decks say so: the estimator was 30.8% under the
actual in July and is within 0.4% in August.

### What is deliberately not claimed

- **July's export names no unattributed bucket.** That is not the same as there
  not having been one, so nothing claims the Bedrock charges are new — only
  that this export shows them and the previous one did not.
- **GCP is excluded from every estimate-against-actual check**, in both months,
  because its estimate equals its actual to the cent on every row. Those two
  columns are one number, not two measurements.
- **The full-month projection is a run-rate, not a forecast.** $40,077 assumes
  the remaining days look like the first 19, and the last day in the export may
  itself be partial.
- **`AI_cost_table.xlsx` is a different cut** from these two files and is not
  reconciled against them. July plus August comes to $43,914 against that
  workbook's $43,547; near, but not the same extract, so the three decks each
  state their own source and none of them adds the others up.

## The two window slides for the CIO deck

Built from `aicostdata.xlsx`, extracted by `tools/extract-window.py` into
`data/ai-cost-window.json` and turned into every figure by
`data/ai-cost-window.js`. The window is **1 July to 19 August 2026, 50 days**.

```bash
python3 tools/extract-window.py /path/to/aicostdata.xlsx --out data/ai-cost-window.json
npm run build:aiwindow
```

Two slides, not a deck: they are meant to be pasted into the CIO presentation
and they carry the same tokens as everything else in it.

### This workbook supersedes the July and August period decks

Same window, later pull, and far better documented. It counts 1,290,499 calls
against the 1,251,594 in the two separate exports, and it is the only source
that states the untagged Bedrock and guardrail figures. The two period decks
are kept because the July-against-August comparison is not in this file, but
where the two disagree, this one is newer.

### The numbers

| | |
|---|---|
| Grand total, 50 days | **$79,448** |
| Attributed to a team | $49,323, 62.1% |
| Untagged Bedrock spend | $28,370 |
| Guardrail fees | $1,754 |
| Rows named `unknown` or `(unlabeled)` | $5,487, 10 rows |
| **Cannot be charged to a named application** | **$35,612, 44.8%** |
| Run rate | $1,589/day, about $48,300/month |

### Slide 1: nearly half the bill has no name on it

The four rows are a true partition of the grand total, so the split bar above
and the list below are the same money counted two ways. The line that lands:
**the untagged Bedrock bucket alone ($28,370) is larger than our largest team**
(insait, $21,140), and 57% of everything we spend on Bedrock has no application
on it.

### Slide 2: volume is not the cost driver

Two columns, the same four groups, in almost the opposite order. solugen makes
**51% of the calls for 24% of the cost**; insait makes **15% of the calls for
43%**. Cost per 1,000 calls runs $17.92 to $112.40, a **6.3x spread**.

The slide states plainly that unit cost is a property of the work rather than a
score — an agent turn is not a classification call, and insait is not being
wasteful for costing more. The point is the size of the lever: a 6.3x spread
means the bill is set by which model handles which call, and there is no target
on that today. Presenting it as a league table would be both unfair and less
useful.

### What the slides deliberately do not do

- **They never split the untagged bucket by team.** It is billed on AWS with no
  application tag; any allocation would be invented.
- **They follow the workbook's own instruction on which sheet wins.** Its README
  says Teams is authoritative for dollars and Apps for ranking within a team,
  because the source report still estimates the most recent day. The two
  disagree by $753, 1.5%, on identical call volumes. Slide 1 says so in its
  footnote rather than picking the bigger number.
- **They do not treat `apim`, `azure` or `unknown` as owners.** The workbook
  names them as gateway and default rows. They stay in every total and are kept
  out of the ownership comparison.
- **They do not present the estimator as unreliable.** Across every reconcilable
  row the estimate is 7.5% under the billed figure, which is accurate in
  aggregate; `agent` alone is 23.2% under, which is not. Both are in the speaker
  notes, neither is on a slide.

## AI cost by team and application

Same source and same window as the two CIO slides, `aicostdata.xlsx`, 1 July to
19 August 2026. Built by `npm run build:aiapps` from `data/ai-cost-window.js`,
so the two never disagree.

This is the level under the CIO slides: the application names, the team each
belongs to, and how every one's money divides between Claude, Azure OpenAI and
GCP. It is the document somebody opens when they want to argue with a number.

### Shape

| Slide | What it does |
|---|---|
| 1 | Top ten applications, each bar split by provider. Ten names are 97% of the bill |
| 2 | **Every row with no application name, in full.** No aggregation |
| 3–5 | One page per team: insait, ai-factory, solugen |
| 6 | The other 13 teams, in one table |
| 7 | Four naming rules that would make the file readable |

Colour means the same thing on every chart: Claude orange, Azure OpenAI blue,
GCP green, as in the rest of the FinOps decks.

### The unnamed slide is the point of the deck

Two of the ten largest applications are called `unknown` and `(unlabeled)`.
Putting them in a ranked chart and moving on would let a room read them as
applications, so they get their own slide, early, with all ten rows listed
rather than summarised:

- `unknown`, Claude, insait, **$2,849** over 31,457 calls
- `(unlabeled)`, Azure, insait, **$2,260** over 23,227 calls
- eight more, $378 between them

$5,487, 11.3% of attributed spend. Both of the large ones are priced at $91 and
$97 per thousand calls, which is production agent traffic rather than a stray
test. Add the $28,370 of untagged Bedrock that never reaches the application
table at all and the figure is **$35,612, 44.8% of the bill**.

### What the team pages show

- **insait**, $21,140, 43% of attributed spend. `agent` is $13,870 of it, on
  both Claude and Azure. The two unnamed rows are here, $5,109, 24% of the team.
- **ai-factory**, $14,871, the only team using all three providers for three
  distinct jobs: Azure for `claims-copilot`, Claude for `cli`, GCP for both OCR
  pipelines. 36 application names, most worth pennies.
- **solugen**, $11,852, one application. `insureGen` is 643,475 calls, 50% of
  everything we send to any provider, at $18 per thousand. This is what good
  looks like.

### Naming defects the deck names

Counted from the file, not asserted: 10 `IVR - *` rows for one service, 7
pension-copilot rows across two spellings, 34 rows with `test` in the name,
`microservice-name` in three different teams, personal names (`yacovz`,
`yakir`, `dvir`, `peled`) used as application names, and two Azure names still
carrying a percent-encoded em-dash.

### Renderer work this deck required

A horizontal stacked bar (`rankStack`) did not exist and is what makes the
provider split visible per application. Four layout defects were fixed rather
than worked around, all the same shape, a box sized for less content than it
was given:

- the `table` renderer pinned its stat strip to a fixed height, so a long table
  was drawn underneath it; the strip now starts below the table's real bottom
  and the build fails rather than shipping a clipped tile
- a slide note that needed a fourth line was clipped; the box now holds four,
  and a fifth is a build error
- the `criteria` banner body did not measure itself, so a three-line paragraph
  crossed the card border; its type now steps down to the 12pt floor instead
- `statTile` labels wider than the rail still wrap, so the labels here are kept
  short deliberately

## The AI consumption CIO slide

`npm run build:aiboard`. The presented version of the consumption table: same
window, same source, same `data/ai-cost-window.js`, laid out to be read from
the back of a room rather than scanned with a finger. The table version stays
because somebody always wants to audit a line.

A new `teamCards` renderer, built for this:

- **A share strip** across the top, so the eye sizes the bill before it reads a
  figure. Five segments, and the red one on the right is the largest.
- **One card per team**: the total, calls and unit cost, a provider split bar
  with the amounts, and the applications inside, each on its own meter.
- **A full-width band** for the $30,125 that belongs to no team, which gets the
  width because it is larger than any card above it, with the 13 remaining
  teams kept on the same band so the slide is a partition of the whole $79,448.
  The build throws if the cards and the band stop adding up.

### Two rules the layout follows

**Colour is the provider, never the team.** Claude orange, Azure OpenAI blue,
GCP green, as everywhere else in the deck. A team's accent appears only on its
own name and the rule above its card, so nothing coloured is ever a team.

**Rows with no application name are forced onto the card above their rank**,
but only above $100. Showing a $5 unnamed row while a $2,394 named application
hid in the roll-up would distort the card to make a point the band already
makes with the full figure.

## The one-slide AI consumption table

`npm run build:aitable`. One slide for the CIO deck, from `aicostdata.xlsx`,
1 July to 19 August 2026, derived from the same `data/ai-cost-window.js` as
everything else so it cannot disagree with the other slides.

Team, application, and the three providers side by side, because those are
asked as one question. Deliberately a table and not a chart: a CIO reading a
cost table wants to find a line and point at it.

### What is listed and what is rolled

About twenty rows fit at the deck's 12pt floor and there are 79 application
names, so the three teams carrying the bill list their largest applications and
the rest is rolled into one line per team, carrying the count.

Two things are never rolled, whatever their size:

- **every row named `unknown` or `(unlabeled)`**, in red, because the point of
  the slide is that they are visible
- **the untagged Bedrock spend and guardrail fees**, $30,125, which have no
  application row at all and are the largest single line on the slide

The roll-up lines say "N more applications", not "N smaller applications". The
tail is not all small — insait's contains its fourth largest — and the slide
should not claim otherwise.

### It is a partition, not a selection

The rows add to $79,448 exactly, and `content-aitable.js` throws at build time
if they stop doing so. The bar on the CIO summary slide and this table are the
same money counted two ways.

### Renderer work

- `drawTable`'s height estimate was calibrated against rendered output: a 12pt
  row measures 0.247", which is one line at 1.15 leading plus the 4pt vertical
  cell margin. The old constants (1.25 leading, 0.14" padding) ran about an
  inch and a half long over twenty rows. That was harmless while nothing was
  positioned against the result, and is not any more.
- A table that would run past its own footnote is now a build error rather than
  something to find in a rendered PDF. It caught two existing slides.
- Table cells can name their own fill, which is what lets the team header rows
  read as headers instead of as whichever zebra stripe they landed on.

## Repairing a hand-assembled deck

The CIO deck that actually gets presented is assembled by hand in PowerPoint —
slides from these builds, reordered, with a few pasted in from the older v33
briefing. That works, with one trap worth knowing about.

**Why pasted slides come through white.** Our slides carry the dark canvas as an
explicit `<p:bg>` on the slide itself. The presentation's master, inherited from
Office, still declares `bg1` — which resolves through the theme to `FFFFFF`.
PowerPoint drops a slide-level background when you paste onto a different
master, so the pasted slide falls back to the master's white and its near-white
text disappears. Nothing is broken and nothing is lost; the slide is just
invisible.

`tools/merge-slides.py` fixes both halves of that:

```bash
npm run build:patch
python3 tools/merge-slides.py \
    --into Harel_Cloud_Cost_CIO_Final.pptx \
    --from patch-slides.pptx \
    --map 6=2,7=4,15=3,18=5 \
    --out Harel_Cloud_Cost_CIO_Final_fixed.pptx
```

- **Backgrounds.** It rewrites the master and every layout to the deck's own
  `COLORS.bg` — read out of `lib/theme.js`, so it cannot drift — which means
  anything pasted in future inherits the right colour instead of white. It also
  stamps an explicit background onto every slide that lacks one, so each slide
  is correct on its own terms as well.
- **Slides.** `--map target=source` replaces slides in place, carrying the
  speaker notes across and keeping the target deck's own layout. A replacement
  brings its own parts with it — a chart and its embedded workbook — which land
  under names the target deck is not using, and the slide's relationship ids are
  preserved rather than rebuilt, because the slide XML refers to its chart by
  id. Parts the replacement orphans are swept out along with their workbooks.

Run it with no `--map` to do the background repair alone.

**The map is not stable.** The deck gets re-cut in PowerPoint between rounds —
slides move, some get deleted — so a slide's number is a property of the copy
in hand, not of the slide. `Harel_Cloud_Cost_CIO_Final.pptx` is whatever
arrangement came back last, and the `--map` in `fix:final` is the mapping for
*that* file. Check the target position before re-running it on a newer export.

### Plain punctuation

`tools/plain-text.py` rewrites the deck's typography into the punctuation a
person types: em dashes become commas, colons or full stops; middots become
slashes; `→` becomes "to"; `–` becomes a hyphen; `×` becomes `x`.

An em dash is not one thing, so it does not get one rule. The script carries a
curated replacement for every dash on a slide, because the choice between a
comma, a colon and a full stop is a judgement about that sentence and a blanket
rule leaves comma splices behind. Mechanical characters are swept afterwards,
and any curated phrase it cannot find is reported rather than passed over.

It runs over both the .pptx and the .js sources, so a rebuild does not undo it:

```bash
python3 tools/plain-text.py Harel_Cloud_Cost_CIO_Final_fixed.pptx
python3 tools/plain-text.py content.js content-cio.js content-patch.js data/ai-platforms.js
```

Two rules are deliberately narrow. Every pattern matches spaces and tabs rather
than `\s`, because a dash at the end of a comment line would otherwise swallow
the newline and splice two lines of source together. And the rule that closes a
gap left by a hand-deleted dash (`$29,927 a month  billed AI`) is applied only
to slide text — speaker notes and the sources both contain space-aligned tables
it would turn into nonsense.

`content-ai.js` and `content-vendor.js` have not been through this pass; they
build decks of their own, not the Final deck.

### The five slides in `content-patch.js`

Five slides in the Final deck are generated here rather than assembled by
hand, either because the pasted version came in unreadable (white background,
v33's 8-9pt type), because the CIO cut needed a different level of detail than
the operational review it was drawn from, or because a fixed-size layout was
leaving real vertical room empty on a screen meant to be read from across a
room. In build order:

**1 — Spend by AI platform.** Reads from `data/ai-platforms.js`, the same
source as the "AI went from 4% of the bill to 27%" chart, so the two can never
show different totals for the same five platforms.

| Platform | Jan–Jul | Share | Jan | Jul |
|---|---:|---:|---:|---:|
| Azure AI Foundry | $87,158 | 43.7% | $5,764 | $19,613 |
| GitHub Copilot | $57,177 | 28.7% | $2,779 | $19,260 |
| AWS Bedrock (Claude) | $42,056 | 21.1% | — | $25,288 |
| Cowork | $9,444 | 4.7% | $97 | $8,920 |
| Google Vertex AI | $3,696 | 1.9% | — | $2,359 |

Growth is stated as a percentage only where January was non-zero. A platform
that started at nothing gets its first billed month named instead — Cowork
against $97 in January would otherwise read "+9,096%", which is arithmetic
theatre, and the two figures are on the slide anyway.

**2 — Infrastructure across the AI Factory programme.** Was a 13-row, 7-column
table of every meter under the AIFactory tag — ninety numbers to say that most
of the tag is not AI. Replaced with a ranked bar list of every infrastructure
service across all four projects, one colour, one number per line: $77,049,
46.5% of the $165,588 programme. AI meters (models, tools, search, OCR) are
excluded entirely — the programme's AI total appears once, as a single
contrast figure, not as a second colour fighting the chart for attention.

**3 — AI spend is outpacing governance.** The consumer/provider mesh; unchanged
in substance from earlier rounds, still reads from `data/ai-platforms.js` for
its one AI-specific stat.

**4 — The same programme, built four different ways.** Was a seven-month
stacked column, four series, every label under 9pt. Replaced with one large bar
per project — infrastructure and AI drawn to scale within each bar, so both the
size of a project and what it is made of read at a glance:

| Project | Total | Infrastructure | Share |
|---|---:|---:|---:|
| AI Factory | $92,247 | $61,169 | 66% |
| Solugen | $31,631 | $6,189 | 20% |
| Document Intelligence | $30,970 | $0 | 0% |
| INSAIT | $10,740 | $9,692 | 90% |

The spread — 0% to 90% — is the point of the slide: Document Intelligence buys
OCR as a hosted API and carries no infrastructure at all, INSAIT builds its
own, and AI Factory sits in between because it is the shared platform
everyone's model traffic runs through.

Slides 2 and 4 both read from `data/ai-projects.js`, so a project's total, its
infrastructure share and its growth badge cannot say something different on
one slide than on the other. That module derives everything from
`data/charts.json` at build time and throws if a project's rollup total and its
service-level breakdown disagree by more than half a percent — the two are
different extracts of the same workbook, and if they drift apart the split on
the slide is no longer describing the project.

**What counts as AI**, on both slides: Foundry Models, Foundry Tools, Azure
Cognitive Search, and the whole of Document Intelligence (it bills nothing but
OCR page meters). Everything else a project consumes — the gateway, the
servers, the databases, the network — counts as infrastructure. Inference
running on a plain virtual machine still bills as infrastructure, so the
infrastructure figure is a floor, not a ceiling.

**5 — Nothing reaches production unowned.** The seven-item ownership criteria
list, pulled by reference from `content-cio.js` rather than redefined here —
it is the exact object the combined CIO briefing itself builds, so a change to
one is a change to both. Each item now carries a one-line practitioner tip
(`Set the hard quota at 75–85% of budget`, `One key per application, never
shared`), most of them lifted straight from the enforcement slide's own APIM
mechanics two slides earlier, so the two read as one argument. See
`criteria` in the kind list above for how the layout fills the frame.

### A pptxgenjs colour bug, in `rankChart` and `columnChart`

Both single-series chart wrappers built their options object as
`{ chartColors: [color], ...axisStyle }` — and `axisStyle` (shared by every
chart in the deck) carries its own `chartColors: SERIES`, the deck's full
multi-colour palette. A later spread key wins, so the single-colour override
was silently overwritten every time, and every "one colour" ranked bar or
labelled column chart in the deck rendered with a different colour per bar —
including the two "Marketplace purchases" slides in the operational review,
which had been shipping like that unnoticed. Fixed by moving `chartColors`
after the `...axisStyle` spread, matching the order `stackedChart` already
used correctly.

### A pptxgenjs paragraph bug, in mixed-run text

`addText` accepts an array of `{ text, options }` runs for mixed formatting
inside one line — a bold word followed by a plain sentence, say. pptxgenjs's
own docs show exactly that shape. But its serializer emits a full
`<a:pPr>` (paragraph properties) block once *per run* rather than once per
*paragraph*, so a two-run line comes out as invalid OOXML: a second `<a:pPr>`
sitting between two runs of the same `<a:p>`, which the schema does not
allow. PowerPoint tolerates it and renders the line normally; LibreOffice
does not — it silently drops the run (or the whole line) rather than erring,
which is why this took a while to pin down: the file opens fine, the text
is present if you read the XML, and nothing complains.

The `criteria` renderer's tip line originally used this pattern for a bold
`"Tip:"` prefix. Fixed by dropping to one run, one style — the colon and the
italic carry the "this is an aside" signal well enough on their own. No other
call in the codebase builds a multi-run array; if you add one, verify it in
whichever renderer you actually ship from, not just PowerPoint.

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


## The combined CIO briefing (v34)

`content-cio.js` merges the *Harel Cloud Cost · CIO v33* deck with this
operational review. The two were on different clocks — v33 covers May–July on an
invoiced basis, the operational review covers January–July on a consumption
basis — so the merge follows three rules, stated at the top of that file: one
spine, no story told twice, and every repeated number must reconcile or explain
itself.

### What the merge produced that neither deck had

**The $16,100.27 credit is identified.** v33 flagged an undocumented charge on
`ai-factory-dev` that was reversed, and concluded it was "not a discount on
Claude consumption". Cross-referencing July Bedrock consumption line by line:

| Claude model, July 2026 | Operational (gross) | v33 (net) | Difference |
|---|---:|---:|---:|
| Claude Opus 4.8 | $11,361.86 | — | $11,361.86 |
| Claude Opus 4.6 | $9,873.22 | $5,134.81 | $4,738.41 |
| All other Claude models | $3,362.97 | $3,362.97 | — |
| **Total** | **$25,288.33** | **$9,188.06** | **$16,100.27** |

That matches the credit to the cent, and the operational deck names the reason:
a MAP contract credit. Confirm with the reseller before treating it as closed.

**The December projection is a range, not a number.** v33 projects $5.8M by
December from Azure growing 13.3% a month, measured May→July. Over the full
seven months Azure has grown 3.0% a month — May was a local low. The combined
deck shows all three readings ($3.4M flat / $4.0M seven-month trend / $5.8M
three-month trend) rather than only the steepest one.

**The savings story exists.** v33 contains no optimisation programme at all.
The combined deck carries $278,868 implemented, $193K identified, and the
purchase-option coverage gap (AWS buys 93% of compute at a discount, Azure 59%).

**Databricks is a decision, not a footnote.** v33 mentions the 600,000 DBCU
pre-purchase; it does not mention that it cost $504,000 in April and is 18%
utilised.

### What moved to the appendix

Per-cost-centre and per-project detail — SAP, Cloud IT, Actuary, ITSec,
Basasach, Investments, Opswat, Risk Agility, the smaller AI projects and the
sandbox. `APPENDIX_PICKS` in `content-cio.js` selects them by index from
`content.js`, so they are the same slide objects and cannot drift.

## Consumption by vendor — how the AI split is defined

`content-vendor.js` answers one question: what does each cloud cost per month,
and how much of that is AI. Every series is derived in `data/vendor-split.js`
from the same extracted workbooks the other decks use — there are no typed-in
figures in the content file, so a stat tile cannot disagree with the bar next
to it.

**The basis**, stated once and applied on every slide:

| | |
|---|---|
| Vendor total | That vendor's consumption, **plus Amazon Bedrock** |
| AI | Azure AI Foundry (models and tools), GitHub Copilot, Copilot Studio; Amazon Bedrock; Vertex AI, Gemini API |
| Everything else | All remaining consumption, **including Azure Databricks** |
| Excluded | AWS Marketplace other than Bedrock — $1.5M of security, database and observability subscriptions |

Bedrock is pulled in because it bills as an AWS Marketplace subscription rather
than as consumption, and leaving it where the invoice puts it would show AWS as
having no AI at all. That is an invoicing artefact, not an accounting judgement.

Databricks stays in "everything else" deliberately: it is a data platform, and
its 600,000-DBCU pre-purchase was paid up front in April, so it bills at $0 from
May. Folding it into AI would put a fixed, prepaid data cost inside a line whose
whole job is to track generative-AI growth — and it would make the AI line fall
in May, when it in fact doubled.

The definition is conservative in both directions that matter. Azure Cognitive
Search is reported inside "other services" in the source and cannot be split out
cleanly, and the VMs, storage and API Management that serve AI workloads bill as
ordinary consumption. **The real AI-attributable cost is higher than these
charts show, not lower.**

### What the split shows

| | January | July | Change |
|---|---:|---:|---:|
| AI | $8,640 | $75,439 | **+773%** |
| Everything else | $225,476 | $217,302 | −3.6% |
| Total | $234,115 | $292,742 | +25.0% |

Non-AI cloud spend is flat to slightly down across the seven months. Every
dollar of growth in the estate this year is AI. AI went from 3.7% of the monthly
bill to 25.8%.

One figure to be aware of when presenting alongside the CIO deck: July Bedrock
is shown **gross**, at $25,288, before the $16,100 MAP contract credit. The
credit is still to be confirmed with the reseller, and the AWS slide says so.

### Colour language

AI is purple on every slide. Vendors keep their accents (Azure blue, AWS orange,
GCP green) for ordinary consumption. On the combined chart the AI bands stack on
top in three tints of purple, so AI reads as one block across every column while
the base of each column still says which cloud it is.
