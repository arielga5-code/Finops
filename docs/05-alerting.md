# 05 — Alerting

## Design principle

Split alerts by what they can actually prevent.

| Tier | Data plane | Latency | Purpose | Route to |
|---|---|---|---|---|
| **Protective** | Tokens, PTU, errors | minutes | Stop money being burned *now* | On-call, paging |
| **Budget** | Billing | 24–48h | Catch overruns within the month | Team channel |
| **Advisory** | Billing + forecast | daily | Trend, efficiency regressions | Weekly review, ticket |

A cost alert cannot prevent a runaway job — the money is already spent by the time
`actual_cost` moves. Only token-plane alerts can. Do not page anyone on a billing
threshold; you are waking someone up about a fact they cannot change.

Rule payloads are in [`assets/alerts/`](../assets/alerts/). Create them with:

```bash
curl -X POST "$KIBANA_URL/api/alerting/rule" \
  -H "kbn-xsrf: true" -H "Content-Type: application/json" \
  -H "Authorization: ApiKey $KIBANA_API_KEY" \
  -d @assets/alerts/01-token-burn-rate.json
```

Add a `actions` array to each payload with your connector ID before creating —
the payloads ship without actions so they are safe to apply and test first.

---

## Tier 1 — Protective (token plane, minutes)

### 1. Token burn rate spike

The one alert to build if you build only one. Catches a runaway loop, a
misconfigured batch job, or an abuse pattern within ~10 minutes rather than two
days.

Rule type: `.es-query` with ES|QL. Fires when tokens consumed in the last 15
minutes exceed a hard ceiling on any deployment.

[`assets/alerts/01-token-burn-rate.json`](../assets/alerts/01-token-burn-rate.json)

Set the threshold from observed peak, not from a round number. Query your last 30
days of 15-minute buckets, take the 99th percentile, multiply by ~2. Too low and
it cries wolf during legitimate traffic peaks; too high and it never fires.

Note the structural quirk of ES|QL rules: the rule condition is always "the query
returned at least one row". The threshold lives in the `WHERE` clause of the query
itself, not in the rule's threshold field.

### 2. PTU saturation

Fires when `provisioned_managed_utilization_v2.avg` exceeds 90%. Above 100% Azure
throttles and returns 429s. This is a reliability alert with a cost tail — the
usual reflex is to buy more PTU, and it is worth having a human confirm that is
the right answer rather than shifting load or fixing a retry storm.

[`assets/alerts/02-ptu-saturation.json`](../assets/alerts/02-ptu-saturation.json)

### 3. Retry / error storm

High error rate alongside sustained token consumption. Failed and retried requests
still consume tokens and still bill. A client with an aggressive retry policy
hitting a 429 wall can multiply spend with zero delivered value — this is one of
the most common surprise-bill causes in Azure OpenAI, and it is invisible on a
pure cost dashboard until the invoice arrives.

[`assets/alerts/03-retry-storm.json`](../assets/alerts/03-retry-storm.json)

---

## Tier 2 — Budget (cost plane, daily)

### 4. Daily spend threshold

Custom threshold rule on `metrics-azure.billing-default`, summing
`azure.billing.actual_cost` over 24h, grouped by `azure.resource.group`.

[`assets/alerts/04-daily-spend-threshold.json`](../assets/alerts/04-daily-spend-threshold.json)

Group by resource group (or your promoted `finops.cost_center`) rather than
alerting on a single global number. A global threshold tells you something is
wrong; a grouped one tells you where, and routes to the team that can act.

### 5. Month-to-date budget burn

Fires when MTD spend exceeds a percentage of the monthly budget that is ahead of
where the month is. Day 10 of a 30-day month should be at ~33% of budget; being
at 60% is the alert.

[`assets/alerts/05-mtd-budget-burn.json`](../assets/alerts/05-mtd-budget-burn.json)

This is deliberately proportional rather than a flat threshold. A flat "80% of
budget" alert fires on day 24 of a healthy month and on day 8 of a catastrophic
one, with equal urgency. Proportional burn distinguishes them.

Keep the budget figure in the query rather than scattered across dashboards.
Better still, move budgets to a small lookup index and `LOOKUP JOIN` them, so
finance can update budgets without anyone editing rules.

### 6. Forecast overrun

Uses `azure.billing.forecast_cost` — Azure's own projection — to fire when the
projected month-end total exceeds budget. This is the earliest warning available
on the cost plane, typically giving a couple of weeks of notice rather than
finding out at month close.

[`assets/alerts/06-forecast-overrun.json`](../assets/alerts/06-forecast-overrun.json)

Remember the null-filtering rule: forecast documents and actual documents share
the data stream. Filter `WHERE azure.billing.forecast_cost IS NOT NULL`.

---

## Tier 3 — Advisory (efficiency regressions)

### 7. Cache match rate regression

Fires when `context_tokens_cache_match_rate.avg` drops below a floor for a
sustained window. Almost always traceable to a specific deploy that broke a
cacheable prompt prefix. Route to the owning team as a ticket, not a page.

[`assets/alerts/07-cache-regression.json`](../assets/alerts/07-cache-regression.json)

### 8. Ingest watchdog

The alert that protects all the other alerts. Fires when **no** billing documents
have arrived in 48 hours.

[`assets/alerts/08-ingest-watchdog.json`](../assets/alerts/08-ingest-watchdog.json)

An expired client secret, a rotated credential, or a revoked role assignment
silently stops ingestion. Every budget rule above then goes permanently quiet —
and a quiet cost dashboard reads exactly like a healthy one. Build this rule on
day one, not after the first incident.

---

## Anomaly-based alerting

Static thresholds cannot express "unusual for a Tuesday". For that, use ML
anomaly detection jobs with `xpack.ml.anomaly_detection_alert` rules — covered in
[06-ai-anomaly-and-assistant.md](06-ai-anomaly-and-assistant.md).

Rule of thumb on when to use which:

- **Static threshold** — there is a real ceiling you never want crossed (budget,
  PTU 90%, hard token cap). Predictable, explainable, no licensing requirement.
- **Anomaly detection** — the normal range is seasonal or varies by service, and
  you want deviation from *learned* normal. Catches the slow drift and the
  weekend-shaped anomaly that thresholds miss entirely.

Run both. They fail in different directions.

## Routing and noise

- Protective tier → PagerDuty/Opsgenie, or a Slack channel that is genuinely
  watched.
- Budget tier → team channel plus a weekly digest.
- Advisory tier → auto-created ticket. Never a page.
- Set sensible `notify_when` and throttle values. A daily-spend rule that
  re-notifies every 5 minutes for 24 hours will be muted within a week, and muted
  alerts are worse than no alerts because they create false confidence.

Next: [06-ai-anomaly-and-assistant.md](06-ai-anomaly-and-assistant.md)
