# Cloud FinOps decks — Harel, 2026

Four decks, one design system, one set of source data.

| Deck | Build | Slides | For |
|---|---|---|---|
| **Operational review** | `npm run build` → `Cloud_FinOps_Harel_2026.pptx` | 40 | The monthly FinOps walkthrough, Jan–Jul 2026 |
| **CIO briefing (v34)** | `npm run build:cio` → `Harel_Cloud_Cost_CIO_v34.pptx` | 40 | The combined executive deck: v33's narrative plus the operational findings |
| **FinOps for AI** | `npm run build:ai` → `FinOps_for_AI_CIO.pptx` | 11 | Executive cut of the five AI cost levers and the one-page usage policy |
| **Consumption by vendor** | `npm run build:vendor` → `Cloud_Consumption_by_Vendor.pptx` | 8 | One question: what does each cloud cost per month, and how much of it is AI |

```bash
cd deck
npm install                # pptxgenjs only
npm run build              # operational review
npm run build:cio          # combined CIO briefing
npm run build:ai           # FinOps for AI
npm run build:vendor       # consumption by vendor
npm run build:patch        # the three replacement slides on their own
npm run build:cio -- /path/to/Somewhere_Else.pptx
```

There is also `npm run fix:final`, which repairs a hand-assembled deck —
see [Repairing a hand-assembled deck](#repairing-a-hand-assembled-deck).

All four are 13.333" × 7.5", dark theme, native PowerPoint charts and tables
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
| `data/charts.json` | The numeric series, extracted from the source `.pptx` chart parts. |
| `data/vendor-split.js` | Derives the vendor × AI split from `charts.json` at build time. |
| `data/ai-platforms.js` | The five AI platforms, Jan–Jul. Shared by every slide that cites one. |
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
- `criteria` — numbered requirements in two columns, with a closing banner
- `bigStat` — one very large figure with a paragraph beside it
- `platforms` — a share strip over one column per platform: total, share, first and last month, growth
- `mesh` — two columns wired to each other with nothing in between, plus a panel and stats
- `splitBars` — one total split two ways, then the largest lines on a shared scale, coloured by side
- `closing` — sign-off

A chart spec can carry `inline: { cats, series }` instead of an `id`, for
figures that do not come from the extracted workbooks.

If you need a layout none of those covers, add a new renderer to the `RENDER`
map in `lib/engine.js` rather than special-casing an existing one.

**Wide charts.** Source workbooks carry up to 38 series per chart. Each chart
spec takes `top: n` — the n largest series are kept and the rest are rolled into
a single "All other" band. Raise or lower it per slide.

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
    --map 6=2,15=3 \
    --out Harel_Cloud_Cost_CIO_Final_fixed.pptx
```

- **Backgrounds.** It rewrites the master and every layout to the deck's own
  `COLORS.bg` — read out of `lib/theme.js`, so it cannot drift — which means
  anything pasted in future inherits the right colour instead of white. It also
  stamps an explicit background onto every slide that lacks one, so each slide
  is correct on its own terms as well.
- **Slides.** `--map target=source` replaces slides in place, carrying the
  speaker notes across and keeping the target deck's own layout. Chart parts
  left unreferenced by a replacement are swept out, along with their embedded
  workbooks.

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

### The three slides in `content-patch.js`

Slides 5, 7 and 19 of the Final deck had been pasted from v33 and still carried
v33's type scale — eyebrows at 10.5pt and body text down to 8pt, against this
deck's 12pt floor. They are rebuilt here on the current design system.

One editorial change came with the rebuild. Slide 5 was still on v33's May–July
window, which put it directly before a Jan–Jul slide showing a different total
for the same five platforms. It now runs on the deck's single basis — metered
consumption, January to July 2026 — and reads its figures from
`data/ai-platforms.js`, the same source as the chart on slide 6. Both slides now
add up to $199,531.

| Platform | Jan–Jul | Share | Jan | Jul |
|---|---:|---:|---:|---:|
| Azure AI Foundry | $87,158 | 43.7% | $5,764 | $19,613 |
| GitHub Copilot | $57,177 | 28.7% | $2,779 | $19,260 |
| AWS Bedrock — Claude | $42,056 | 21.1% | — | $25,288 |
| Copilot Studio (Cowork) | $9,444 | 4.7% | $97 | $8,920 |
| Google Vertex AI | $3,696 | 1.9% | — | $2,359 |

Growth is stated as a percentage only where January was non-zero. A platform
that started at nothing gets its first billed month named instead — Copilot
Studio against $97 in January would otherwise read "+9,096%", which is
arithmetic theatre, and the two figures are on the slide anyway.

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
