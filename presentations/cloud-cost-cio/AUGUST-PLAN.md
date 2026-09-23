# August 2026 briefing — plan

Two deliverables:

1. **`Harel_Cloud_Cost_CIO_August.pptx`** — 9 slides, the briefing actually presented.
2. **`Harel_Cloud_Cost_CIO_Final.pptx` refreshed to Jan–Aug** — the 37-slide pack, held
   as backup for questions, not presented.

## Why a short deck

The CIO accepted the January–July narrative in the last session. Re-presenting 37
slides with an eighth column spends their time on what they already agreed. What is
owed in September is: did what we said would happen, happen; what is new; what needs a
decision.

The July deck is unusually well suited to this because it made four falsifiable
claims, and August is the first month that tests them. That is the spine of the new
deck — slide 2 is a scorecard against those claims, not a table of numbers.

| July said | August |
|---|---|
| s3: "August and September will show which path is emerging" — base $4.01M vs faster $5.78M | first data point |
| s10: MAP credit — "ACTION: Confirm" | answered: one-off, did not recur |
| s20: "Sonnet by default, Opus by exception" | Sonnet 3.0% → 23.2% of model spend |
| s24: untagged 23.4%, "getting worse, not better" | pending Azure |

## Build method

Do **not** rebuild the design. Start from `Harel_Cloud_Cost_CIO_Final.pptx`, delete the
slides not needed, reorder the survivors, then edit their content. Seven of the nine
slides already exist in the right form, so the design is preserved exactly rather than
approximated.

Verified: deleting entries from `slides._sldIdLst` (dropping the relationship with
`part.drop_rel`) and re-appending in the wanted order leaves every chart intact with
its full series and category set.

| New | From | Change |
|---|---|---|
| 1 Cover | 1 | retitle to August |
| 2 Scorecard | *new* | the four claims above |
| 3 Which path is emerging | 3 | plot August actual against both cases |
| 4 AI across the three clouds | 5 | add August; AWS AI +78% |
| 5 Model mix | 9 | add August; Opus 96.3% → 76.4% |
| 6 Marketplace | 12 | rebuild as the three-way split |
| 7 AI ownership by cost centre / project | 32 as base | *new analysis* |
| 8 Tagging | 24 | August untagged share |
| 9 What needs a decision | 28 | carry forward, updated |

## Slide 7 is the one worth the most

The deck asserts that a quarter of the bill has no owner. It never shows who owns the
AI spend that *is* tagged. Proposed: one row per cost centre / project — August AI
spend, change on July, AI as a share of that centre's total, tagged or not.

That turns the governance argument from an assertion into a document, and it is the
cut the CIO can act on.

**Constraint to state on the slide:** AWS Bedrock carries no Project or CostCenter tag;
ownership there is at linked-account level. So the slide reads "Azure by tag, AWS by
account" and must say so, rather than presenting the two as one metric. `ai-factory-dev`
alone is $46,336 of August AWS spend.

## Status

| | |
|---|---|
| AWS August | complete — see `data/aws-2026-08.md` |
| Azure August | **blocked** — 2.1 GB export exceeds the Drive connector's 10 MB download limit; needs `tools/ea-export-aggregator.html` run locally, output attached |
| GCP August | awaited |

Slides 4, 5, 6 and 9 can be built from AWS alone. Slides 3, 7 and 8 — including both
slides the CIO specifically asked to emphasise — need the Azure tag cuts.
