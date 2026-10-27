# Dashboard page

Source for the three-dashboard FinOps page: the Executive, Engineering and AI
operations views specified in
[../../docs/04-dashboards.md](../../docs/04-dashboards.md).

This is the page as published, kept here so it is reviewable and diffable. The
published copy lives in a Claude Artifact and is edited there; treat this
directory as the record of what was published, and copy changes in both
directions deliberately rather than assuming they are in sync.

## Layout

```
page/     the page itself — markup, shared helpers, one module per dashboard
schema/   the column contract for each of the nine sources
```

| File | What it holds |
|---|---|
| `page/index.html` | markup, styles, tab controller, headline sentence |
| `page/charts.js` | formatting, data access, empty and error states, bar/line/table drawing |
| `page/exec.js` | dashboard A — Executive / monthly, and its calculations |
| `page/eng.js` | dashboard B — Engineering / weekly |
| `page/ops.js` | dashboard C — real-time AI operations |

The page runs inside a host that supplies `d3` v7 and a `dash` object for data,
parameters and theming, so it is not a standalone HTML file and will not render
by opening it in a browser.

## The nine sources

`schema/*.csv` carry column headers and no rows. They are the contract between
whatever produces the data and the page that reads it — the page's scripts and
its source marks are written against exactly these column names.

| Source | Produced by |
|---|---|
| `daily_cost` | [`../../scripts/ea_export_aggregate.py`](../../scripts/ea_export_aggregate.py) |
| `resource_cost` | same |
| `ai_cost` | same |
| `allocation` | same |
| `tokens_by_deployment` | [`../esql/tokens_by_deployment.esql`](../esql/tokens_by_deployment.esql) |
| `ptu_utilization` | [`../esql/ptu_utilization.esql`](../esql/ptu_utilization.esql) |
| `cache_effectiveness` | [`../esql/cache_effectiveness.esql`](../esql/cache_effectiveness.esql) |
| `openai_errors` | Azure Monitor request and error counts per status code |
| `ml_anomalies` | the jobs in [`../ml/`](../ml/) |

The first four come from a cost export. The rest are Azure Monitor telemetry and
appear in no cost export at any grain, which is why dashboard C has no cost panel
and dashboard B is only partly fillable from billing data alone. See
[../../docs/03-ai-telemetry-ingestion.md](../../docs/03-ai-telemetry-ingestion.md).

## Before you apply

1. **The monthly budget is a placeholder.** `exec.js` carries `50000`, the same
   placeholder as
   [`../esql/forecast_vs_actual.esql`](../esql/forecast_vs_actual.esql), in two
   places: the `budget_status` calculation and the reference line. It appears on
   the page labelled as a placeholder. Substitute your figure in both, or move
   budgets into a lookup index so finance can maintain them without editing code.
2. **Currency is read from the data, not assumed.** Every panel takes it from the
   first row's `currency` column. Mixed-currency estates need filtering to one
   currency first, or the totals are meaningless.
3. **The top-resources change column needs two months** in `resource_cost` before
   it computes anything.

## Conventions the page follows

Worth knowing before editing, because they are deliberate:

- Cost is bucketed on the date usage occurred, never on ingest time. A late poll
  otherwise smears yesterday's spend into today.
- Untagged spend is charted as an explicit `unallocated` bucket rather than
  dropping out of a group-by.
- No chart has two y-scales. Error rate and AI spend are two charts on a shared
  time axis for exactly this reason.
- Categorical colors are assigned in fixed order and never cycled. Resource
  groups past the seventh fold into `Other` instead of generating more hues.
- A series is identified by a legend and, where there are four or fewer, by a
  label at the line's end — never by color alone.
- Every displayed number is either a column of a source or a named calculation
  whose formula readers can inspect. There are no numbers in the markup.
