---
name: finops
description: Use when analyzing cloud costs, billing/usage exports, budgets, or cost optimization for AWS, Azure, or GCP. Covers cost anomaly detection, rightsizing, idle-resource cleanup, commitment (RI/Savings Plan/CUD) coverage, tagging/allocation compliance, unit economics, and chargeback/showback reporting. Triggers on terms like FinOps, cloud cost, cloud bill, AWS Cost Explorer, CUR (Cost and Usage Report), Azure Cost Management export, GCP Billing export, cost optimization, cost anomaly, budget variance, unit economics, chargeback, showback, savings plan, reserved instance, rightsizing.
---

# FinOps

Cloud financial operations: turning raw billing/usage data into cost
visibility, optimization actions, and accountable reporting. Follow the
FinOps Framework phases — **Inform → Optimize → Operate** — and match the
depth of analysis to what the user actually asked for for; don't build a full
pipeline when they asked one question about last month's spend.

## Workflow

1. **Locate the data.** Find the billing/usage export(s) the user has —
   look for AWS CUR (Cost and Usage Report) CSV/Parquet, Cost Explorer
   exports, Azure Cost Management exports, or GCP Billing export tables
   (BigQuery or CSV). If nothing is provided, ask what data source they have
   before guessing at column names.
2. **Identify the grain and dimensions.** Confirm the time grain (daily/
   monthly) and which dimensions matter for the question: account/
   subscription/project, service, region, resource tag (team, environment,
   product), usage type. See `reference/data-formats.md` for the standard
   column names per provider.
3. **Inform — build visibility first.** Aggregate cost by the relevant
   dimension(s) before optimizing anything. Surface: total spend, spend
   trend (MoM/WoW), top cost drivers, and any untagged/unallocated spend
   (a common FinOps blocker — see `reference/checklist.md`).
4. **Optimize — apply the relevant levers.** Only pursue levers relevant to
   the question; see `reference/checklist.md` for the standard list
   (rightsizing, idle/orphaned resources, storage tiering, commitment
   coverage, spot/preemptible usage, license optimization).
5. **Operate — make it accountable.** If asked for ongoing reporting,
   frame results as chargeback/showback by cost center, and express
   unit economics (cost per customer/transaction/request) when a usage
   driver is available — see `reference/checklist.md` for the formulas.
6. **Report.** For a one-off answer, plain text/tables are fine. For a
   dashboard or chart, load the `dataviz` skill before building it — don't
   hand-roll chart styling here.

## Scripts

`scripts/summarize_cur.py` — aggregates an AWS Cost and Usage Report (or any
CSV with `lineItem/UnblendedCost`-style or simplified `cost` columns) by a
chosen dimension and time bucket. Run `python3 scripts/summarize_cur.py --help`
for usage. Treat it as a starting point, not a black box — read it before
running it against a new export, since real-world CUR files vary in schema
by report version.

## Reference

- `reference/data-formats.md` — column layouts for AWS CUR, Azure Cost
  Management exports, and GCP Billing export tables, plus notes on unit
  normalization (blended vs unblended cost, amortized commitment costs).
- `reference/checklist.md` — the standard FinOps optimization levers and
  unit-economics formulas, used as a checklist so nothing obvious gets
  missed on a cost review.

## Ground rules

- Never invent cost figures. If the data isn't available, say so and ask
  for the export rather than estimating.
- Distinguish **unblended**, **blended**, **amortized**, and **net**
  cost when a provider export offers more than one — they answer different
  questions (actual bill vs. shared-RI-normalized vs. post-discount) and
  mixing them silently produces wrong totals.
- Flag untagged/unallocated spend explicitly rather than dropping it from
  totals — it's usually the most actionable finding in a first review.
