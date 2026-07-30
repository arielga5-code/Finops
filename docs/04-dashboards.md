# 04 — Dashboards

## What you get for free

Installing the integrations brings prebuilt Kibana dashboards:

- **Azure Billing** — spend overview, breakdown by resource group / type /
  subscription, actual vs forecast
- **Azure OpenAI** — request rate, error rate, token usage, chat completion
  latency, PTU utilization
- **Azure OpenAI Billing** — an enhanced view that appears once *both* the
  `azure_openai` and `azure_billing` integrations are installed, tying AI usage to
  AI spend
- **Azure AI Foundry** — model usage, tokens, latency, cost, content filtering
  (tech preview)

Install both integrations before judging the out-of-box experience. The billing
integration alone gives generic cloud cost; the pairing is what produces the
AI-specific view.

Prebuilt dashboards are read-only on upgrade. **Clone before editing** — an edited
managed dashboard either blocks the package upgrade or gets reverted.

## The four panels worth building yourself

The prebuilt dashboards answer "what is happening". These four answer "should I do
something about it", which is the FinOps job. All queries are in
[`assets/esql/`](../assets/esql/).

### 1. Unit economics — cost per million tokens

The single most important AI FinOps metric, and the one no vendor dashboard gives
you, because it requires joining the two planes.

Absolute AI spend going up is not inherently bad — it may mean the product is
succeeding. Cost per million tokens going up is *always* worth investigating: it
means model mix drifted to something pricier, caching regressed, or someone
shipped a prompt that ballooned context.

Cross-index joins are awkward in ES|QL. Two workable approaches:

**Option A — transform to a summary index (recommended).** A pivot transform
writes daily AI cost per resource; a second writes daily tokens per resource;
a third query joins them, or you write both into one summary index keyed by
`(usage_date, resource_id)`. Chart from the summary index. Robust, cheap to query,
and the summary index becomes the natural home for your FinOps KPIs.

**Option B — `LOOKUP JOIN` (Elastic 9.x).** Join the token index against a
lookup-mode cost index directly in ES|QL. Fewer moving parts, but requires the
cost side to be in a `lookup` mode index and is subject to lookup index size
limits. Good for a modest number of deployments.

Either way the metric is:

```
cost_per_million_tokens = daily_ai_cost / (daily_total_tokens / 1e6)
```

Track it as a line chart with a target band, not a single number. The trend is the
signal.

### 2. Input vs output token split, by deployment

Two series, never one. Output tokens cost several times input tokens on most
models, so a chart of "total tokens" can stay flat while cost climbs. Stacked area
by deployment name, with the input/output split visible, immediately exposes a
service that started generating longer completions.

Query: [`assets/esql/tokens_by_deployment.esql`](../assets/esql/tokens_by_deployment.esql)

### 3. PTU utilization band

A gauge or time series of `provisioned_managed_utilization_v2.avg` per deployment,
with two reference bands drawn:

- **> 90%** — approaching throttling; 429s incoming
- **< 50% sustained** — over-provisioned; you are paying for idle reserved capacity

The area between them is the zone where PTU is doing its job. Most PTU waste comes
from teams provisioning for peak and never revisiting after traffic patterns
shifted. Reviewing this chart monthly is one of the highest-ROI habits available
in Azure AI FinOps.

Query: [`assets/esql/ptu_utilization.esql`](../assets/esql/ptu_utilization.esql)

### 4. Cache effectiveness

`context_tokens_cache_match_rate.avg` over time per deployment, alongside the gap
between `token_transaction.total` and `active_tokens.total`.

Read it as a cost regression detector. A step change downward almost always traces
to a specific deploy — someone put a variable (timestamp, session ID, user name)
near the *start* of a system prompt, invalidating the cacheable prefix. Cheap to
fix, easy to miss without this chart.

Query: [`assets/esql/cache_effectiveness.esql`](../assets/esql/cache_effectiveness.esql)

## Dashboard set to build

Three dashboards, three audiences. Resist merging them — the failure mode of
FinOps dashboards is one 40-panel page nobody reads.

### A. Executive / monthly (audience: finance, leadership)

- MTD spend vs budget, with forecast to month end
- Spend by cost center (from your promoted tags), including an explicit
  `unallocated` slice
- AI spend as % of total cloud spend — the number leadership will actually ask for
- Cost per million tokens, monthly trend
- Top 10 resources by spend, month over month delta

### B. Engineering / weekly (audience: platform and app teams)

- Daily spend by resource group and resource type
- Token volume by deployment, input vs output
- PTU utilization band
- Cache match rate
- Error rate vs token spend — retry storms are billable

### C. Real-time AI operations (audience: on-call)

- Token burn rate, last 6h, per deployment, against expected rate
- PTU utilization, live
- 429 / quota error rate
- Active anomaly detection alerts from
  [06-ai-anomaly-and-assistant.md](06-ai-anomaly-and-assistant.md)

Dashboard C is the one that pairs with the real-time alerting in
[05-alerting.md](05-alerting.md) — an alert fires, on-call opens C, and the
context is already there.

## Practical notes

- **Time field.** Cost visualizations must aggregate on
  `azure.billing.usage_date`, not `@timestamp`. See
  [02-cost-ingestion.md](02-cost-ingestion.md#time-fields).
- **Currency.** If you have subscriptions billing in different currencies, filter
  by `azure.billing.currency` or you will sum euros and dollars into a
  meaningless number. Add the currency to every panel title.
- **Null filtering.** Every cost aggregation needs
  `WHERE azure.billing.actual_cost IS NOT NULL` (or the forecast equivalent).
  Forecast and actual documents coexist in the same data stream.
- **Gauges vs counters.** The Azure OpenAI token metrics are gauges reported per
  5-minute timegrain. `SUM()` over them across time is the right aggregation for
  volume; do not apply counter-rate functions.

Next: [05-alerting.md](05-alerting.md)
