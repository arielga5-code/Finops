# Assets

Applyable configuration to go with [`../docs/`](../docs/). Nothing here is
pseudocode, but three things need substituting before you apply them — see
[Before you apply](#before-you-apply).

## Layout

```
esql/     ES|QL queries for dashboard panels and alert rule bodies
alerts/   Kibana alerting API payloads
ml/       Anomaly detection job + datafeed configs
```

## Before you apply

1. **Thresholds are placeholders.** Every numeric threshold (`5000000` tokens,
   `1000` daily spend, `50000.0` monthly budget) is a starting value, not a
   recommendation. Derive real ones from your own percentiles — see
   [05-alerting.md](../docs/05-alerting.md#1-token-burn-rate-spike).
2. **`REPLACE_WITH_DATA_VIEW_ID`** in `alerts/04-daily-spend-threshold.json` must
   be a real Kibana data view ID covering `metrics-azure.billing-*`.
   Get it from `GET kbn:/api/data_views`.
3. **`actions` is empty** in every rule payload. Add your connector before the
   rules are useful. They are shipped actionless deliberately so you can create
   and observe them for a week without paging anyone.

## Applying

### ES|QL queries

Paste into Discover (ES|QL mode) or a Lens panel. They are also the bodies of the
corresponding alert rules — the versions embedded in `alerts/*.json` are the same
queries with a `WHERE` clause appended that encodes the alert condition.

### Alert rules

```bash
export KIBANA_URL="https://your-deployment.kb.region.cloud.es.io"
export KIBANA_API_KEY="..."

for f in assets/alerts/*.json; do
  echo "Creating $f"
  curl -sS -X POST "$KIBANA_URL/api/alerting/rule" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -H "Authorization: ApiKey $KIBANA_API_KEY" \
    -d @"$f" | jq -r '.id // .message'
done
```

### ML jobs

Requires a Platinum or Enterprise licence.

```bash
export ES_URL="https://your-deployment.es.region.cloud.es.io"
export ES_API_KEY="..."

create_job () {
  name="$1"
  curl -sS -X PUT "$ES_URL/_ml/anomaly_detectors/$name" \
    -H "Content-Type: application/json" -H "Authorization: ApiKey $ES_API_KEY" \
    -d @"assets/ml/$name.job.json"

  curl -sS -X PUT "$ES_URL/_ml/datafeeds/datafeed-$name" \
    -H "Content-Type: application/json" -H "Authorization: ApiKey $ES_API_KEY" \
    -d @"assets/ml/$name.datafeed.json"

  curl -sS -X POST "$ES_URL/_ml/anomaly_detectors/$name/_open" \
    -H "Authorization: ApiKey $ES_API_KEY"

  curl -sS -X POST "$ES_URL/_ml/datafeeds/datafeed-$name/_start" \
    -H "Content-Type: application/json" -H "Authorization: ApiKey $ES_API_KEY" \
    -d '{"start": "now-30d"}'
}

create_job azure_openai_token_volume
create_job azure_cost_daily_spend
# create_job azure_ai_unit_economics   # only after the summary index exists
```

Baselining time: ~1–2 weeks for the 15-minute token job, ~3–4 weeks for the daily
cost jobs. Start them well before you intend to alert on them.

## Why the cost jobs use a 48-hour `query_delay`

`azure_cost_daily_spend` and `azure_ai_unit_economics` set
`"query_delay": "172800s"`. That is deliberate and worth understanding before you
"fix" it.

These jobs use `azure.billing.usage_date` as the time field, because that is when
cost was actually incurred. But usage records for a given day keep arriving for
24–48 hours after that day ends, on top of the integration's own 24-hour poll. A
normal short `query_delay` would march the datafeed past a day before its records
had all landed, and ML would permanently model an artificially low value for
every bucket.

Delaying the datafeed by 48 hours lets the day settle before it is analyzed. The
cost is that anomaly results lag reality by two days — acceptable, because these
are advisory-tier signals reviewed weekly. The protective tier runs on
`azure_openai_token_volume`, which uses `@timestamp` and a 120-second delay.

If your billing pipeline settles faster or slower than the default, tune this
value; it is the single most impactful knob on cost-side anomaly quality.

## The unit economics summary index

`cost_per_million_tokens.esql` and `azure_ai_unit_economics.job.json` both read
`finops-ai-unit-economics-*`, which does not exist until you build it. It is a
join of the two data planes, keyed by `(usage_date, resource_name)`:

| Field | Source |
|---|---|
| `usage_date` | `azure.billing.usage_date` |
| `resource_name` | `azure.resource.name` (must match on both sides) |
| `daily_cost` | `SUM(azure.billing.actual_cost)` from `metrics-azure.billing-*` |
| `daily_tokens` | `SUM(azure.open_ai.token_transaction.total)` from `metrics-azure_openai.metrics-*` |
| `cost_per_million_tokens` | computed: `daily_cost / (daily_tokens / 1e6)` |

Build it with two pivot transforms writing into the same index, plus an ingest
pipeline computing the derived field — or with a scheduled ES|QL query if your
deployment count is small. The
[04-dashboards.md](../docs/04-dashboards.md#1-unit-economics--cost-per-million-tokens)
section covers the trade-offs, including the `LOOKUP JOIN` alternative on
Elastic 9.x.

Be aware of the join's one real weakness: it assumes the Azure OpenAI resource
name in billing data matches the one in metrics data. It usually does, but a
resource renamed mid-month will split into two series. Worth a spot-check when
the numbers look odd.

## Version compatibility

Written against `azure_billing` package 1.12.x and Kibana 8.13+/9.x. Two things
to re-verify on upgrade:

- The **Azure AI Foundry** integration is tech preview; its field names may move
  between releases. Pin the package version and re-test dashboards on upgrade
  rather than tracking `latest`.
- Alerting API rule params occasionally gain required fields across major
  versions. If a `POST /api/alerting/rule` returns a 400, diff your payload
  against `GET kbn:/api/alerting/rule_types`.
