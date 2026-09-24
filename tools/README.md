# Tools

## `ea-export-aggregator.html`

Reduces a multi-gigabyte Azure enrollment export to the few kilobytes of aggregates a
monthly deck needs, so the raw file never has to move. Streams the CSV in chunks and
accumulates into totals only — no rows are retained, so memory stays flat and file size
is not a limit. Verified at 1.2 GB / 3.6M rows in 22 seconds, producing 3.4 KB.

Three ways out, all containing totals only:

- **Copy summary for chat** — a compact form on the clipboard, paste straight into a
  message. No file has to move, which matters when the raw export is too large to
  attach and too large for a connector. Capped at 60 KB by trimming the long tails.
- **Download aggregates (CSV / JSON)** — the full aggregates as a file.

Emits daily totals, and cost by subscription, service (meter category),
meter, resource group, **Project tag** and **CostCenter tag**. The last two are read out
of the `Tags` column, because the enrollment's own `CostCenter` column is empty on every
line — the tag is the only source. Both JSON tags (`{"Project":"BI"}`) and `k=v;k=v` are
handled, as is a quoted `Tags` field containing commas, which splits a naive parser.

Use this when the export is too large to attach or upload; use `azure-spend-dashboard.html`
when you want to explore a month interactively.

## `azure-spend-dashboard.html`

A single-file dashboard for a monthly Azure usage export. Open it in a browser and
drop the CSV on the page — parsing and aggregation happen in the browser, so the
billing detail never leaves the machine and there is no upload step for a file that
is routinely hundreds of megabytes.

### Input

Either export works; columns are detected by name, not by position:

| | EA portal export | Cost Management export |
|---|---|---|
| file | `Detail_Enrollment_<id>_<YYYYMM>_en.csv` | `*_CostExport_*.csv` |
| cost | `ExtendedCost` | `CostInBillingCurrency` / `PreTaxCost` |
| service | `MeterCategory` / `ConsumedService` | `ServiceFamily` |
| date | `Date` (`MM/DD/YYYY`) | `UsageDate` (`YYYY-MM-DD`) |

A preamble before the header row is tolerated: the first line that resolves to both a
date and a cost column is treated as the header. Missing optional columns are reported
on the page rather than failing the load.

### What it shows

Total spend, daily average, peak day, dominant service and billed-resource count; a
daily spend curve with a first-half/second-half trend read; top services and top
resource groups; a full subscription breakdown; the twenty most expensive resources;
and the complete meter table. Subscription / resource group / service filters apply to
every panel at once, and the summary can be exported back out as CSV.

Rows carrying no `CostCenter` are totalled separately and surfaced at the top — that is
the spend which cannot be charged back to an owner.

It reads the whole file into memory, so for an export beyond roughly half a gigabyte
use `ea-export-aggregator.html` instead.

## Verifying a change

```bash
npm i playwright
node tools/test/dashboard-test.js
node tools/test/aggregator-test.js          # SIZE_MB=500 for a closer-to-real run
```

Each generates a synthetic EA export, drives the page with it, and asserts the rendered
figures equal the generated ones. The aggregator test additionally asserts the Project
and CostCenter tag cuts are right despite commas inside the quoted `Tags` field, and that
the exported aggregates stay small enough to attach to a message.
