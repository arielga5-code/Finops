# Presentations

Management-facing material derived from the practice this repo implements.

| Deck | Length | Audience | Notes |
|---|---|---|---|
| [`finops-vision.pptx`](finops-vision.pptx) | 4 slides | Executive leadership — the vision | [`speaker-notes-vision.md`](speaker-notes-vision.md) |
| [`finops-cio-brief.pptx`](finops-cio-brief.pptx) | 5 slides | CIO / CTO — a short decision meeting | [`speaker-notes-cio.md`](speaker-notes-cio.md) |
| [`finops-gaining-visibility.pptx`](finops-gaining-visibility.pptx) | 15 slides | Mixed executive leadership | [`speaker-notes.md`](speaker-notes.md) |
| [`finops-gaining-visibility-cfo.pptx`](finops-gaining-visibility-cfo.pptx) | 15 slides | CFO / finance leadership | [`speaker-notes-cfo.md`](speaker-notes-cfo.md) |

**Start with the vision deck.** Four slides, one idea each, no repeats: where we
are going, how we get visibility, how we hold it, what is being asked for. It
supersedes the earlier CIO brief as the shortest cut — kept the CIO brief for a
narrower "just the ask" meeting, but the vision deck is the one built to the
"no duplicate ideas" brief.

The long deck runs in two parts: **visibility** (what is being spent and by
whom) and **governance** (who owns it, what limits it, what stops it).

**The two long decks have identical slides.** Only the speaker notes differ — same
15 slides, same visuals, argued for a different room. Present either one; pick
the file whose notes match the audience.

[`finops-cio-brief.pdf`](finops-cio-brief.pdf) and
[`finops-gaining-visibility.pdf`](finops-gaining-visibility.pdf) are rendered
copies for quick review without PowerPoint. They carry no speaker notes and are
regenerated from the decks, so never edit them directly.

## FinOps — the vision (4 slides, no repeats)

Built for one instruction: show the vision to leadership in as few slides as
possible, logical order, zero duplicated ideas.

| Slide | Idea |
|---|---|
| 1 | The vision — every project is named, owned, measured, limited |
| 2 | See it — trace spend to an owner, and price a project whole (including the non-AI stack around it) |
| 3 | Control it — shift left at design, guardrails at runtime |
| 4 | The ask — a 90-day plan, the KPIs, and two decisions needed today |

Each idea appears exactly once. Allocation is argued only on slide 2; ownership
only on slides 1 and 2 (as the tagging owner, not repeated as a topic);
guardrails only on slide 3; the ask only on slide 4. Nothing here overlaps the
15-slide deck's content — it is a distillation, not a subset, and the two can
be presented independently.

The deck originally carried a fifth, "why now" slide built on *State of FinOps
2026* stats. Cut on request rather than folded elsewhere — the four remaining
slides stand on their own without it.

## FinOps: Visibility & Governance

Part one makes the case for **visibility** — why allocation, unit economics and
fresh data come before any optimization programme, and what blocks them. Part
two covers the **controls**, because a report is not a control.

Structure:

| Slide | Content |
|---|---|
| 1 | Title |
| 2 | The problem — spend that cannot be explained |
| 3 | Why visibility first — four business questions and the four capabilities that answer them |
| 4 | The five blockers |
| 5 | Tagging — the foundation, and the minimum tag set |
| 6 | The hard cases — shared platforms and commitments, plus the showback runway |
| 7 | **What a project actually costs** — the model is one line on a longer bill |
| 8 | The AI line — the same failures on a shorter clock; time-to-attribute as the metric |
| 9 | Shift left — a seat at the design table, and the six questions asked there |
| 10 | Ownership — the named owner, and who owns the practice |
| 11 | The controls — quotas, tiered alerts, budget thresholds, ordered by speed |
| 12 | Nobody should learn it from the invoice |
| 13 | Tooling — what a platform adds, using Finout as the worked example |
| 14 | Where to start, and what it buys — with the KPIs that say whether it is working |
| 15 | Questions |

**This deck was 27 slides and is now 15.** The cuts were duplication, not
content: cost allocation had been argued on five separate slides, ownership on
five, showback on three, and the "2025 best practices" slide was an index of
everything else in the deck. The merges were: the two framing slides into one
(3), shared resources and commitments into one (6), the shift-left pair into one
(9), application ownership and the responsibility grid into one (10), budgets,
rate limits and alerts into one (11), and the path forward with the takeaways
into one (14). The FinOps definition slide, the multi-cloud slide and the
governance divider were dropped outright — the first two are covered by the
tooling slide, the third was structural overhead. Git history has the 27-slide
version if a point needs recovering.

The governance material is grounded in this repo's implementation docs — the
alert tiering and latency figures on slide 11 come from
[`docs/05-alerting.md`](../docs/05-alerting.md) and
[`docs/00-architecture.md`](../docs/00-architecture.md#the-latency-problem).

**Slide 7 is the project-cost slide.** It exists because an AI feature gets
quoted at its token cost while running on compute, databases, cache, storage,
gateway and log ingestion that bill monthly regardless. The ask on it is
procedural: one ApplicationID across every resource a project touches, so a
review sees one number and one owner, then divided by a business unit.

**Slide 13 names a vendor, and the deck argues against buying one prematurely.**
That tension is handled in the notes: a platform earns its licence when there
are several billing sources to normalize or when allocation cannot be fixed at
source. The capabilities come from Finout's published material and are
representative of the category; the published outcome figures (~30% cost
reduction, ~50% engineer time saved) are labelled on the slide as marketing
claims. Slide 8 carries vendor-sponsored survey data and says so on the slide.

Two slides have deliberate blanks: the date on slide 1 and the contacts on
slide 15.

**Before presenting, add your own numbers.** Slides 2 and 3 are written to carry
real figures — current monthly spend and the share of spend landing unallocated.

### The two note sets

The **default cut** explains the practice: what each slide is for, what to say
that is not printed on it, and where to substitute real figures.

The **CFO cut** argues the same slides in finance terms — variance and whether it
can be explained, accrual and forecast quality, allocation as a coding
discipline, commitments as purchase obligations, and the controls as delegation
of authority and budget phasing.

The repo's own operating model doc — [`docs/07-finops-operating-model.md`](../docs/07-finops-operating-model.md)
— is the implementation counterpart to slides 5 and 6.

## FinOps — CIO brief (v2, five slides)

The same case, cut to a short meeting with one decision-maker:

| Slide | Content |
|---|---|
| 1 | The gap — no owner on the change, data arrives late, nothing stops a runaway — and the three asks |
| 2 | Why now — *State of FinOps 2026*: 78% of practices report into the CTO/CIO org, 98% manage AI spend, governance now outranks optimization |
| 3 | See it — tag, allocate, showback, unit cost; the allocation KPI |
| 4 | Control it — two moments: shift left (priced architecture review, cost diff on the pull request, policy as code) and runtime (quotas, tiered alerts, budget thresholds) |
| 5 | The ask — a 90-day sequence and the three decisions needed in the room |

Slide 2 carries external evidence rather than assertion, and is the reason the
brief works on a CIO: the industry moved cost control out of finance reporting
and into the technology organization this year. Cite the source out loud.

Slide 1's three bullets are written to be replaced with our own position before
presenting — how long the last unexplained increase took to explain, the current
unallocated share, and whether any workload has a hard ceiling today.

### Rebuilding

The decks are generated, so edits belong in [`build-deck.js`](build-deck.js)
(layout) or [`notes-exec.js`](notes-exec.js) / [`notes-cfo.js`](notes-cfo.js)
(speaker notes) rather than in PowerPoint.

```bash
npm install pptxgenjs react-icons react react-dom sharp

node build-deck.js finops-gaining-visibility.pptx exec
node build-deck.js finops-gaining-visibility-cfo.pptx cfo
node build-cio-brief.js finops-cio-brief.pptx

python export-notes.py finops-cio-brief.pptx speaker-notes-cio.md
```

[`deck-kit.js`](deck-kit.js) holds the palette, type scale, icon rendering and
the shape primitives. Both builders require it, so the brief and the long deck
cannot drift apart visually — and a corporate re-skin is one file.

The second argument selects the note set and nothing else; adding a third
audience means adding a `notes-<name>.js` and one line in `build-deck.js`.

To export a PDF, open the deck in PowerPoint, Google Slides or Keynote and
export from there, or `soffice --headless --convert-to pdf <deck>.pptx` where
LibreOffice Impress is installed.

Applying a corporate template: replace the palette constants at the top of
`deck-kit.js` (`DARK`, `AMBER`, `TEAL`, `TINT`) and the two font constants
(`HEAD`, `BODY`). Every slide in every deck derives from those.

### Sources for the CIO brief

Slide 2 cites the FinOps Foundation's *State of FinOps 2026*. Verify the figures
against the source before presenting them as ours:

- [State of FinOps 2026 data](https://data.finops.org/)
- [Linux Foundation announcement](https://www.linuxfoundation.org/press/state-of-finops-survey-ai-value-and-skills-top-priorities-as-finops-matures-across-technology-value-98-manage-ai-90-saas-64-licensing-48-data-center-1)
- [2026 FinOps Framework update](https://www.finops.org/insights/2026-finops-framework/) — FinOps Scopes, beyond public cloud
- [FOCUS 1.3](https://www.finops.org/insights/introducing-focus-1-3/) — shared-cost splitting, contract commitments, data recency

Shift left (slide 19 of the long deck, and the left column of the brief's slide 4):

- [Architecting & Workload Placement](https://www.finops.org/framework/capabilities/architecting-for-cloud/) and [Governance, Policy & Risk](https://www.finops.org/framework/capabilities/policy-governance/) — the two Framework capabilities it sits across
- [Shift Left, defined](https://www.infracost.io/resources/glossary/shift-left) — cost feedback in IaC and pull requests
- [FinOps 2026: shift left and up](https://thecuberesearch.com/finops-2026-shift-left-and-up-as-ai-drives-technology-value/) — pre-deployment costing as the top requested capability
- [Onboarding Workloads](https://www.finops.org/framework/capabilities/onboarding-workloads/) — decision support during design and intake
- [Cost-aware product decisions](https://www.finops.org/insights/cost-aware-product-decisions/) — cost as a non-functional requirement

**Slide 22 uses vendor-sponsored research and says so on the slide.** The
Harness / Sapio *2026 State of AI in FinOps* survey (700 practitioners, May–June
2026) is published by a company selling AI cost tooling. The ownership,
surprise-bill and diagnosis-time findings are repeated by independent coverage
and are safe to cite; the 26% waste figure is what respondents estimated, not a
measurement, and the slide labels it as such. Several figures that circulate in
summaries of this report — policy-enforcement rates, maturity self-scores,
engineers' cost awareness — could not be verified outside the vendor's own
material and were deliberately left off the slide.

**Slide 24 names a vendor, and the deck argues against buying one prematurely.**
That tension is deliberate and the speaker notes handle it: slide 10 still says
native tooling is sufficient for a single-cloud estate, and a platform earns its
licence only when there are several billing sources to normalize or when
allocation cannot be fixed at source. The six capabilities are drawn from
Finout's published product material and are representative of the enterprise
category rather than unique to it — send the same list to any competing vendor.
The published outcome figures (~30% cost reduction, ~50% engineer time saved)
are vendor marketing, labelled as such on the slide, and must not be presented
as our forecast. The slide ends with three proofs to run on our own data before
any purchase.

Slide 23 (ship the insight) was prompted by a "FinOps is a product" infographic
by Bhaskara Balaga, shared on LinkedIn. The practices on the slide — findings
carrying an owner and a date, reporting realized against identified savings, and
treating adoption as the leading indicator — are standard FinOps practice; the
product framing is his, and worth crediting if you repeat it verbatim.
- [Policy-as-code for cost governance](https://www.firefly.ai/blog/shift-left-finops-how-governance-policy-as-code-are-enabling-cloud-cost-optimization)

The AI line (slide 22 of the long deck, and the first gap bullet of the brief):

- [2026 State of AI in FinOps](https://www.harness.io/state-of-ai-in-finops-2026) — the vendor's own report page
- [Press release with methodology](https://www.prnewswire.com/news-releases/new-harness-report-reveals-enterprise-ai-spend-has-outgrown-the-systems-built-to-track-it-302837776.html) — Sapio Research, 700 respondents across five countries
- Independent coverage repeating the headline findings: [CIO Dive](https://www.ciodive.com/news/control-AI-costs-spending-harness/826492/), [Digitalisation World](https://digitalisationworld.com/news/23121-enterprises-waste-26-of-ai-spend-amid-unclear-cost-ownership-harness-finds), [digit.fyi](https://www.digit.fyi/ai-spend-outpaces-financial-oversight/)

Tooling (slide 24) — all vendor-published material:

- [Finout platform](https://www.finout.io/finops-platform) and [product overview](https://www.finout.io/product)
- [CostGuard waste detection](https://www.finout.io/costguard) · [integrations](https://www.finout.io/integrations) · [billing connectors](https://docs.finout.io/billing-integrations/cloud-providers)
- [FinOps Foundation member listing](https://www.finops.org/members/finout/)
- Third-party context on pricing model and alternatives: [CloudZero on Finout pricing](https://www.cloudzero.com/blog/finout-pricing/), [Gartner Peer Insights](https://www.gartner.com/reviews/product/finout)
