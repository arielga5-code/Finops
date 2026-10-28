# Dashboard page

Source for the published Azure cost dashboard: Overview, Where it goes, AI and
Savings tabs, built from real figures in the May to July 2026 cost report for
Azure enterprise enrollment 51378402.

This is the page as published, kept here so it is reviewable and diffable. The
published copy lives in a Claude Artifact and is edited there; treat this
directory as the record of what was published, and copy changes in both
directions deliberately rather than assuming they are in sync.

## Layout

```
page/        the published page: markup, shared helpers, one module per area
schema/      column contract for each source the page reads (headers only)
telemetry/   the Engineering and AI operations views from docs/04-dashboards.md
```

| File | What it holds |
|---|---|
| `page/index.html` | markup, styles, tab controller, headline sentence |
| `page/charts.js` | formatting, data access, empty and error states, bar/line/table drawing |
| `page/report.js` | Overview, Where it goes and AI tabs, and their calculations |
| `page/savings.js` | Savings tab: opportunities, reservations, idle disks, App Service plans |

The page runs inside a host that supplies `d3` v7 and a `dash` object for data,
parameters and theming, so it is not a standalone HTML file and will not render
by opening it in a browser.

## Sources

Rows are not committed. They are company cost data and resource names, so only
the column headers live in `schema/`. The page's scripts and source marks are
written against exactly those names.

| Source | Origin |
|---|---|
| `invoiced_months` | header cards of the cost report: invoiced total per month |
| `by_subscription`, `by_service`, `by_cost_centre`, `by_project`, `meter_movers`, `ai_platforms`, `ai_drivers`, `aifactory` | tables of the same report, parsed to numbers |
| `savings_opportunities`, `reservations`, `idle_disks`, `app_service_plans` | sheets of the July 2026 recommendations workbook |

## Two totals that do not match

The invoiced total for the three months is 500,216. Every breakdown table
(subscription, service, cost centre, project) sums to 632,185. They are different
bases: invoiced against consumption cost. The page keeps them separate, labels
each, and shows the gap on the Overview tab. Databricks consumed against a prepaid
balance (88,666) explains part of it. The files do not explain the remaining
43,303, so find that out from the source report before quoting either total.

## Other things worth knowing

- The Savings total is an upper bound. It counts the 3-year reserved instance
  line and leaves out the 1-year line, because they are alternatives, and the
  workbook does not say whether its other lines overlap.
- The idle-disk list in the workbook totals less than the idle-disk lines in its
  own summary.
- Untagged spend is charted as an explicit bucket and in red, never dropped.
- No chart has two y-scales, and categorical colors are assigned in fixed order.
- Every figure on the page is a column of a source or a named calculation whose
  formula readers can inspect. There are no numbers in the markup.

## Telemetry views

`telemetry/` holds the Engineering and AI operations views that need Azure
Monitor data: tokens, PTU utilization, cache match rate, error rates and anomaly
records. They are not part of the published page. No cost export contains that
data at any grain, so those views stay unpublished until the `azure_openai`
integration is ingesting. See
[../../docs/03-ai-telemetry-ingestion.md](../../docs/03-ai-telemetry-ingestion.md).
Their sources are the ES|QL queries in [`../esql/`](../esql/).
