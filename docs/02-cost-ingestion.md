# 02 — Cost Ingestion

## The `azure_billing` integration

Elastic Agent calls the Azure Cost Management API, retrieves **usage details**
(actual spend) and **forecast** (projected spend), and writes both to a single
data stream:

```
metrics-azure.billing-default
```

Requires Kibana `^8.13.0 || ^9.0.0`. Subscription level: **Basic** — the ingest
and dashboards need no paid tier. (Machine learning in
[06-ai-anomaly-and-assistant.md](06-ai-anomaly-and-assistant.md) does require
Platinum/Enterprise.)

### Install

Fleet → Integrations → **Azure Billing Metrics** → Add.

| Setting | Value | Notes |
|---|---|---|
| Client ID | from app registration | required |
| Client Secret | from app registration | required, stored as a Fleet secret |
| Tenant ID | your Entra tenant | required |
| Subscription ID | one subscription | required — used to reach the API, and as the *default* billing scope |
| Billing Scope Department ID | EA department | optional; **overrides** subscription scope |
| Billing Scope Account ID | EA/MCA billing account | optional; **overrides** department scope |
| Period | `24h` | default; leave it alone |
| Resource Manager Endpoint | blank | set only for Gov/China/sovereign clouds |

Scope precedence, since it is easy to misread: **account ID > department ID >
subscription ID**. Setting an account ID makes the subscription ID purely an API
access credential, not a filter.

**Do not lower `period` below `24h`.** It will not give you fresher data — Azure's
billing pipeline is the bottleneck, not the poll — and it multiplies your Cost
Management API call charges. The API is billed per standard call.

### Deployment mode

The integration supports agent-based and **Elastic Managed (agentless)**. Agentless
is available on Elastic Cloud and Serverless and is the right default for this
integration: it is a scheduled API poll with no host affinity and no local state.

### One policy per scope — and only one

If you install the integration on two agents pointed at the same billing scope,
you will get duplicate documents and every cost figure will be wrong by a factor
of two. Sums over a data stream do not deduplicate. Keep a written inventory of
which agent policy owns which scope.

## Field schema

The full exported schema for `metrics-azure.billing-default`:

### Cost fields

| Field | Type | Meaning |
|---|---|---|
| `azure.billing.actual_cost` | float | Actual spend for the period. **Use this for spend reporting.** |
| `azure.billing.pretax_cost` | float | Cost before tax |
| `azure.billing.forecast_cost` | float | Azure's projected spend for coming periods |
| `azure.billing.currency` | keyword | e.g. `USD`, `EUR` |

`actual_cost` and `forecast_cost` are populated by *different* API responses.
A given document generally carries one or the other, not both — which is why
every query below filters on `IS NOT NULL` for the metric it wants. Summing
without that filter is the most common source of wrong numbers in Azure cost
dashboards built on this data.

### Dimension fields

| Field | Type | Meaning |
|---|---|---|
| `azure.subscription_id` | keyword | Subscription |
| `azure.resource.group` | keyword | Resource group |
| `azure.resource.name` | keyword | Resource name |
| `azure.resource.type` | keyword | e.g. `microsoft.cognitiveservices/accounts` |
| `azure.resource.id` | keyword | Full ARM resource ID |
| `azure.resource.tags` | **flattened** | Azure resource tags |
| `azure.billing.product` | keyword | Product / meter description |
| `azure.billing.department_name` | keyword | EA department |
| `azure.billing.account_name` | keyword | Billing account |
| `azure.billing.billing_period_id` | keyword | Billing period |

### Time fields

| Field | Type | Meaning |
|---|---|---|
| `@timestamp` | date | Ingest time — **not** the date the cost was incurred |
| `azure.billing.usage_date` | date | The date the usage occurred |
| `azure.billing.usage_start` / `usage_end` | date | Period boundaries |

**Bucket on `azure.billing.usage_date`, not `@timestamp`, for anything that
represents "spend on day X".** `@timestamp` tells you when the agent polled. Get
this wrong and a late poll or a re-ingest smears yesterday's spend into today's
bucket. The one exception is ML datafeeds and alert rule time windows, which need
a monotonically increasing ingest-ordered field — those correctly use
`@timestamp`.

### Working with `azure.resource.tags`

Tags are the backbone of FinOps allocation, and `flattened` is an awkward type for
them: no aggregation on subfields in the way you would want, limited ES|QL
support. If you allocate cost by tag, promote the tags you care about to proper
`keyword` fields with an ingest pipeline:

```json
PUT _ingest/pipeline/azure-billing-tag-promotion
{
  "description": "Promote FinOps allocation tags to top-level keyword fields",
  "processors": [
    { "set":    { "field": "finops.cost_center", "copy_from": "azure.resource.tags.cost-center", "ignore_empty_value": true, "ignore_failure": true } },
    { "set":    { "field": "finops.team",        "copy_from": "azure.resource.tags.team",        "ignore_empty_value": true, "ignore_failure": true } },
    { "set":    { "field": "finops.env",         "copy_from": "azure.resource.tags.environment", "ignore_empty_value": true, "ignore_failure": true } },
    { "set":    { "field": "finops.workload",    "copy_from": "azure.resource.tags.workload",    "ignore_empty_value": true, "ignore_failure": true } },
    { "set":    { "field": "finops.cost_center", "value": "unallocated", "if": "ctx.finops?.cost_center == null" } }
  ]
}
```

Attach it as a `@custom` pipeline so package upgrades do not overwrite it:

```json
PUT _ingest/pipeline/metrics-azure.billing@custom
{
  "processors": [
    { "pipeline": { "name": "azure-billing-tag-promotion" } }
  ]
}
```

The explicit `unallocated` default is deliberate. Untagged spend that silently
vanishes from group-by results is how allocation coverage quietly rots; make it a
visible bucket you can chart and drive toward zero.

Add matching mappings via a component template so the new fields are `keyword`
and aggregatable.

## When the API is not enough

The Cost Management query API returns aggregated data. You will hit its limits
when you need:

- Individual meter line items and unit prices
- Reservation and savings-plan amortization
- Marketplace / third-party charges broken out
- Complete tag coverage on every charge record
- More than ~12 months of history

At that point, switch to **Cost Management Exports** (configured in
[01-azure-prerequisites.md](01-azure-prerequisites.md#4-cost-management-exports-optional-for-line-item-granularity))
and ingest the blobs.

Export type options: **Actual Cost**, **Amortized Cost**, or **FOCUS** — the
FinOps Foundation's vendor-neutral schema, which is the right choice if you plan
to ever put AWS or GCP data in the same indices and compare apples to apples.
Format CSV or Parquet, gzip or snappy compressed.

Ingest path: **Azure Blob Storage input** on Elastic Agent (or the Custom Azure
Blob Storage Logs integration) → a custom ingest pipeline that parses the CSV
columns to a FOCUS-aligned mapping → a dedicated `logs-azure.costexport-*` data
stream.

Realistic caveats before you commit to this path:

- Exports **overwrite the month-to-date file daily**. Naively ingesting every day
  gives you ~30 copies of the same charges by month end. You need either
  `FileOverwrite` export mode plus a delete-by-query on the reingested period, or
  a deterministic `_id` derived from the line-item key so the duplicates
  upsert over each other. The `_id` approach is more robust; the fingerprint
  processor is the tool for it.
- Volume is real — hundreds of thousands of rows per month for a mid-size estate.
  Size your cluster and ILM accordingly.
- Parquet is not natively parsed by the agent's blob input. Use CSV unless you are
  adding a transformation step.

Do not build this on day one. The `azure_billing` integration covers budget
tracking, trend, forecast and service-level breakdown, which is the majority of
the value. Add exports when a specific question forces you to.

## Verify ingestion

```
GET metrics-azure.billing-default/_search
{
  "size": 1,
  "sort": [{ "@timestamp": "desc" }]
}
```

Then sanity-check the total against the Azure portal for the same window. They
should match closely. If Elastic is exactly 2x the portal, you have the duplicate
policy problem described above. If Elastic is lower, check whether your scope is
narrower than you think, or whether marketplace charges are excluded.

Next: [03-ai-telemetry-ingestion.md](03-ai-telemetry-ingestion.md)
