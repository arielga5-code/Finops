# 06 — AI-Driven Detection and Investigation

Two distinct things get called "AI" in this context, and conflating them causes
confusion in planning conversations:

1. **Using Elastic's AI/ML to watch cost** — unsupervised anomaly detection,
   AI Assistant, agentic investigation.
2. **Watching the cost of AI workloads** — Azure OpenAI / Foundry spend, covered
   in [03](03-ai-telemetry-ingestion.md), [04](04-dashboards.md) and
   [05](05-alerting.md).

This doc is the first. The two compose well: unsupervised ML is unusually
well-suited to AI workload spend, because AI traffic is spiky, seasonal and
genuinely hard to threshold.

**Licensing:** anomaly detection requires **Platinum or Enterprise** (or the
equivalent Elastic Cloud tier). The ingest and dashboards in the rest of this repo
work on Basic. Budget for this before committing to a design that depends on it.

---

## Anomaly detection jobs

Job configs are in [`assets/ml/`](../assets/ml/). Create with:

```bash
curl -X PUT "$ES_URL/_ml/anomaly_detectors/azure_cost_daily_spend" \
  -H "Content-Type: application/json" \
  -H "Authorization: ApiKey $ES_API_KEY" \
  -d @assets/ml/azure_cost_daily_spend.job.json
```

Then create the matching datafeed and open the job.

### Job 1 — daily spend by service

`bucket_span: 1d`, `high_sum` on `azure.billing.actual_cost`, partitioned by
`azure.resource.type`.

[`assets/ml/azure_cost_daily_spend.job.json`](../assets/ml/azure_cost_daily_spend.job.json)

Partitioning matters. An unpartitioned job models total spend and only catches
estate-wide anomalies — a doubling of one small service disappears into the
aggregate. Partitioned by resource type, the model learns a separate baseline per
service and flags a service that broke its own pattern.

`high_sum` rather than `sum` because a cost *drop* is not usually an incident
worth waking up for. It is worth reviewing — an unexpected drop can mean an
ingest failure, which is why the watchdog rule in
[05-alerting.md](05-alerting.md#8-ingest-watchdog) exists separately.

Note `bucket_span: 1d` needs roughly 3–4 weeks of data before results are
trustworthy. Start the job early, even before you plan to alert on it.

### Job 2 — token consumption by deployment

`bucket_span: 15m`, `high_sum` on `azure.open_ai.token_transaction.total`,
partitioned by `azure.resource.name`.

[`assets/ml/azure_openai_token_volume.job.json`](../assets/ml/azure_openai_token_volume.job.json)

This is the job that earns its licence. At 15-minute buckets it learns the daily
and weekly shape of your AI traffic — quiet nights, Monday morning peaks, batch
windows — and flags departures from it. A static threshold that tolerates the
Monday peak is far too loose to catch a 3 a.m. runaway; this job catches both.

Baselines in ~1–2 weeks at this bucket span.

### Job 3 — cost per token efficiency

`bucket_span: 1d` over the unit-economics summary index described in
[04-dashboards.md](04-dashboards.md#1-unit-economics--cost-per-million-tokens),
using `high_mean` on the cost-per-million-tokens field.

[`assets/ml/azure_ai_unit_economics.job.json`](../assets/ml/azure_ai_unit_economics.job.json)

The most sophisticated of the three, and the one that catches things nothing else
does: spend rising *faster than usage*. Absolute cost growing is ambiguous —
success looks like that too. Cost per unit of work growing is unambiguously a
regression: model mix drifted expensive, caching broke, or context bloated.

Requires the summary index to exist first. Build it last.

### Alerting on anomalies

Rule type `xpack.ml.anomaly_detection_alert`. Fires on `anomaly_score` above a
threshold — default 75.

[`assets/alerts/09-ml-cost-anomaly.json`](../assets/alerts/09-ml-cost-anomaly.json)

Threshold guidance: start at **75**, watch for two weeks, then tune. Dropping to
50 roughly triples volume and is only worth it for the token job where early
warning has real value. Raising to 90 leaves only severe anomalies and suits the
daily spend job, where you are reviewing in a weekly meeting anyway.

Choose the result type deliberately:

- `bucket` — the whole time bucket was anomalous. Fewer, broader alerts.
- `record` — individual anomalous records. More alerts, more specific.
- `influencer` — which entity drove it. Best for routing, since the influencer
  usually *is* the owning team.

For cost, `bucket` on the daily job and `record` on the token job is a good
default.

---

## Elastic AI Assistant for Observability

Natural-language interface over your data. For cost work it does three useful
things:

**Query generation.** "Show me the top 10 resource groups by Azure spend last
week, excluding forecast documents" becomes working ES|QL. This meaningfully
lowers the barrier for finance-side users who will never write ES|QL themselves
but do have good questions. It also converts Query DSL to ES|QL, which is handy
when migrating older saved searches.

**Alert triage.** Attached to a firing alert, it summarizes context and proposes
next steps, pulling in related telemetry rather than making you assemble it.

**Report drafting.** Summarizing a month of spend movement into prose for a
stakeholder update is genuinely tedious work that it does well.

Setup requires connecting an LLM connector. If you are already running Azure
OpenAI, use it — the Assistant's own token consumption then shows up in the same
`azure_openai` metrics you are monitoring. Pleasingly self-referential, and worth
noting in your cost model: the Assistant is not free, and heavy use is visible on
the dashboards it helps you read.

**A caution worth stating plainly:** the Assistant generates queries, and
generated queries can be subtly wrong in ways that matter for money — most
commonly by omitting the `IS NOT NULL` filter that separates forecast from actual
documents, producing inflated totals that look plausible. Verify any
Assistant-generated cost query against a known-good number before putting it in a
dashboard or a board deck.

## Agentic investigation (Elastic 9.4+)

Recent Elastic versions added agentic investigation workflows that trigger on an
alert and return a structured root-cause hypothesis with supporting evidence and
suggested next steps. The initial workflow targets Kubernetes.

There is no cost-specific agentic workflow today. It is worth tracking, since the
"alert fires → assemble evidence → form hypothesis" loop is exactly the tedious
part of cost incident response. In the meantime, the practical substitute is a
good runbook — see
[07-finops-operating-model.md](07-finops-operating-model.md#when-an-alert-fires).

## Sequencing

1. Start Job 2 (tokens) first — fastest to baseline, highest protective value.
2. Start Job 1 (daily spend) at the same time; it just needs longer to be useful.
3. Add AI Assistant once dashboards exist and people are asking questions of them.
4. Add Job 3 (unit economics) after the summary index is built.

Next: [07-finops-operating-model.md](07-finops-operating-model.md)
