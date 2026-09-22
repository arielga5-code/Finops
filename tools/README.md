# Tools

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

### Verifying a change

```bash
node tools/test/dashboard-test.js   # needs: npm i playwright
```

It generates a synthetic EA export, loads it through the page, and asserts the rendered
total equals the generated total, that a filter narrows and clearing restores it, and
that the console is clean.
