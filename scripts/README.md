# scripts

## `ea_export_aggregate.py`

Turns an Azure EA / Cost Management detail export into the four aggregates the
FinOps dashboards need.

A `Detail_Enrollment_*.csv` is one row per meter per resource per day — a mid-size
enrollment produces gigabytes a month. None of the panels in
[../docs/04-dashboards.md](../docs/04-dashboards.md) plot individual line items, so
there is no reason to move the whole export anywhere. This streams it once, in
constant memory, and writes aggregates that fit comfortably inside an 8 MB
dashboard attachment.

```bash
python3 scripts/ea_export_aggregate.py Detail_Enrollment_51378402_202608_en.csv -o out/
```

| Flag | Meaning |
|---|---|
| `-o`, `--out-dir` | where the aggregates go (default `out`) |
| `-n`, `--top` | resources to keep in `resource_cost.csv` (default 200) |
| `--skip-rows` | title rows before the column header, which the EA portal sometimes prepends |

### Outputs

| File | Grain | Feeds |
|---|---|---|
| `daily_cost.csv` | date × subscription × resource group × meter category × cost center | daily spend, MTD vs budget, spend by cost center |
| `resource_cost.csv` | month × resource, top N by cost | top resources, month-over-month delta |
| `ai_cost.csv` | date × resource × meter, AI meters only | AI spend, AI as % of total |
| `allocation.csv` | date × allocated/unallocated | allocation coverage KPI |
| `untagged_resources.csv` | month × resource with no project tag, top N by cost | which resources are untagged |

Column names are resolved against the EA legacy, Cost Management export and FOCUS
spellings, so the same script works whichever export type produced the file. It
reports which columns it resolved, and exits with the candidate list if it cannot
find a date or cost column.

### Things it handles because real exports contain them

- `MM/DD/YYYY` dates (EA legacy) alongside ISO (Cost Management, FOCUS)
- Thousands separators inside quoted numeric fields
- Credits written as `(12.50)` rather than `-12.50`
- `InstanceId` as a full ARM path, reduced to the resource name
- Tag JSON containing commas, via the `csv` module rather than a field split
- Mixed billing currencies — carried through every output as a column, with a
  warning, per [../docs/04-dashboards.md](../docs/04-dashboards.md#practical-notes)

### Untagged spend

Rows with no `CostCenter` land in an explicit `unallocated` bucket rather than
dropping out of the group-by, matching the ingest pipeline in
[../docs/02-cost-ingestion.md](../docs/02-cost-ingestion.md#working-with-azureresourcetags).
Allocation coverage you cannot see is allocation coverage that rots.

### Before you publish anything from this

The script prints the total cost across the export. Check it against the Azure
portal for the same window first. A 2x difference means duplicate rows; a lower
figure usually means the export scope is narrower than you think, or marketplace
charges are excluded.

### What it cannot give you

Token counts, PTU utilization, cache match rate and 429 rates are not in any cost
export — they are Azure Monitor metrics on the Azure OpenAI resource. The unit
economics and AI operations panels need the telemetry side from
[../docs/03-ai-telemetry-ingestion.md](../docs/03-ai-telemetry-ingestion.md).
