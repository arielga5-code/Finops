# Presentations

Management-facing material derived from the practice this repo implements.

| Deck | Length | Audience | Notes |
|---|---|---|---|
| [`finops-cio-brief.pptx`](finops-cio-brief.pptx) | 5 slides | CIO / CTO — a short decision meeting | [`speaker-notes-cio.md`](speaker-notes-cio.md) |
| [`finops-gaining-visibility.pptx`](finops-gaining-visibility.pptx) | 26 slides | Mixed executive leadership | [`speaker-notes.md`](speaker-notes.md) |
| [`finops-gaining-visibility-cfo.pptx`](finops-gaining-visibility-cfo.pptx) | 26 slides | CFO / finance leadership | [`speaker-notes-cfo.md`](speaker-notes-cfo.md) |

**Start with the CIO brief.** It is the argument in five slides and asks for
three decisions; the 26-slide deck is the evidence behind it, better used as a
follow-up than presented in full.

The long deck runs in two parts: **visibility** (what is being spent and by
whom) and **governance** (who owns it, what limits it, what stops it).

**The two long decks have identical slides.** Only the speaker notes differ — same
26 slides, same visuals, argued for a different room. Present either one; pick
the file whose notes match the audience.

[`finops-cio-brief.pdf`](finops-cio-brief.pdf) and
[`finops-gaining-visibility.pdf`](finops-gaining-visibility.pdf) are rendered
copies for quick review without PowerPoint. They carry no speaker notes and are
regenerated from the decks, so never edit them directly.

## FinOps: Visibility & Governance

Part one makes the case for the **Inform** phase — why cost allocation, granular
reporting, unit economics and fresh data have to come before any optimization
programme, what blocks visibility in practice, and how to unblock each one.

Part two covers the **controls**, because a report is not a control: ownership,
budget thresholds, rate limits, alert routing, and who is accountable for what.

Structure:

| Slides | Content |
|---|---|
| 1–3 | The cost problem, and what FinOps is |
| 4–5 | Why visibility comes first; what "good visibility" looks like |
| 6 | The five blockers — tagging, shared resources, commitments, multi-cloud, SaaS |
| 7–10 | One solution slide per blocker |
| 11–12 | Showback vs chargeback; 2025 best practices |
| 13 | **Part two — Governance** divider |
| 14 | Application ownership — a named owner, and what they are accountable for |
| 15 | Budget controls — notify, review, gate; proportional burn vs flat thresholds |
| 16 | Rate limits & quotas — the only control fast enough to stop spend in progress |
| 17 | Automated alerts — three tiers, three destinations, and three ways to get it wrong |
| 18 | Shared responsibility — who decides, who builds, who pays |
| 19 | Shift left — where FinOps belongs in the lifecycle, and the exchange that happens in the design room |
| 20 | The six design-time questions, and the cost target they produce |
| 21 | Avoiding bill shock — the same overrun found at four different moments |
| 22 | The AI line — the same failures on a shorter clock, and time-to-attribute as the metric |
| 23 | Ship the insight — findings need an owner and a date; measure adoption, not accuracy |
| 24–26 | The starting sequence, takeaways, discussion |

The governance half is grounded in this repo's own implementation docs —
the alert tiering and latency figures on slides 16 and 17 come from
[`docs/05-alerting.md`](../docs/05-alerting.md) and
[`docs/00-architecture.md`](../docs/00-architecture.md#the-latency-problem).

**Shift left, slides 19–20.** The point is organizational before it is technical:
FinOps sits in design and intake, understands what the project needs, and leaves
with a cost target recorded beside the latency and availability targets. The
Foundation names this work — *Architecting & Workload Placement* and *Onboarding
Workloads*. Slide 20 is the practical half, six design questions an architect can
answer in the room. The pipeline enforcement it mentions (cost diff on the pull
request, policy as code) is the one practice these decks describe that this repo
does not yet implement — treat it as a roadmap item.

Two slides have deliberate blanks to fill in before presenting: the date on
slide 1 and the contacts on slide 26. Slide 18's responsibility grid is drawn
with role names — fill in real names before the meeting where you want a
decision.

**Before presenting, add your own numbers.** Slides 2, 4 and 5 are written to
carry real figures — current monthly spend, the share of spend landing
unallocated, and growth rate against a business metric. The argument is far
stronger with the organization's actual allocation coverage on it.

### The two note sets

The **default cut** explains the practice: what each slide is for, what to say
that is not printed on it, and where to substitute real figures.

The **CFO cut** argues the same slides in finance terms — variance and whether it
can be explained, accrual and forecast quality, allocation as a coding
discipline, commitments as purchase obligations, and chargeback as an accounting
change that needs a date. Across part two it reads the governance slides as
delegation of authority, budget phasing and exception handling applied to a cost
line that has been running without them. It also front-loads the ask:
sponsorship of the allocation standard, and a decision on when showback becomes
chargeback.

The repo's own operating model doc — [`docs/07-finops-operating-model.md`](../docs/07-finops-operating-model.md)
— is the implementation counterpart to slides 7 and 11: minimum tag set,
enforcement via Azure Policy, allocation coverage as a KPI, and review cadence.

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
