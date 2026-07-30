# 07 — FinOps Operating Model

Tooling without process produces dashboards nobody opens. This is the thin layer
of practice that makes the preceding six docs pay off.

## Tagging is the prerequisite

Every allocation question — showback, chargeback, "which team owns this" — depends
on tags being present and consistent. No amount of Elastic configuration fixes
missing tags.

Minimum viable tag set, applied to every resource that can carry tags:

| Tag | Purpose |
|---|---|
| `cost-center` | Financial allocation |
| `team` | Operational ownership |
| `environment` | `prod` / `staging` / `dev` — dev spend is usually the easiest win |
| `workload` | Application or product |

Enforce with **Azure Policy** (`deny` on create without required tags, or
`modify` to inherit from the resource group). Retrofitting tags across a live
estate is painful; enforcing them from the start is nearly free.

Then promote them to queryable fields per
[02-cost-ingestion.md](02-cost-ingestion.md#working-with-azureresourcetags).

**Track allocation coverage as a KPI.** Percentage of spend landing in
`unallocated` should be a chart on the executive dashboard, with a target of
under 5%. This is the metric that makes tagging hygiene visible to the people who
can mandate it.

A caveat specific to AI: a shared Azure OpenAI resource serving five teams carries
one set of tags. Resource tags cannot split that bill. Per-team attribution for
shared AI platforms requires either APIM subscription keys
([03](03-ai-telemetry-ingestion.md#layer-2--azure_openai-logs-add-when-you-need-detail))
or application-level `finops.*` attributes
([03](03-ai-telemetry-ingestion.md#layer-4--application-side-attribution-with-edot--opentelemetry)).
Decide which before you promise anyone chargeback.

## Cadence

| Cadence | Who | Agenda |
|---|---|---|
| **Real time** | On-call | Protective alerts only. Token burn, PTU saturation, retry storms. |
| **Weekly, 30 min** | Platform + app leads | Dashboard B. Anomalies from the week, PTU utilization review, open advisory tickets. |
| **Monthly, 60 min** | + Finance | Dashboard A. Budget vs actual, forecast, unit economics trend, allocation coverage, commitment coverage. |
| **Quarterly** | + Leadership | Reservation/PTU commitment decisions, budget resets, architecture-level optimization. |

The weekly meeting is the one that matters and the one most often skipped. Monthly
is too slow to catch a regression that started on day 3.

## When an alert fires

A runbook, in priority order. Most cost incidents resolve in the first three
steps.

### Token burn rate spike

1. **Which deployment?** The alert's `resource.name` group tells you.
2. **Is it a retry storm?** Check the error rate panel. High 429/5xx alongside
   high tokens means a client is retrying into a wall — fix the client, not the
   capacity.
3. **Is it legitimate?** Correlate with app deploys and marketing events. A launch
   looks identical to a runaway on the token chart.
4. **Contain.** If illegitimate: throttle at APIM, or reduce the deployment's
   TPM quota. Both are reversible and take seconds.
5. **Attribute.** Use APIM subscription keys or `finops.*` span attributes to find
   the calling app.
6. **Record.** Add the incident to a log with root cause and estimated cost. That
   log is what justifies the next optimization sprint.

### PTU saturation

1. Confirm sustained, not a momentary peak.
2. Check whether spillover to a PAYG deployment is configured. If not, this is
   the fix — it is cheaper than provisioning for peak.
3. Only then consider buying PTU. Over-provisioning to silence an alert is the
   default failure mode here and it is expensive and permanent.

### Budget / forecast alert

1. Diff against the prior period by resource group. What moved?
2. New resource, or existing resource growing? New resources are usually
   intentional and just need a budget update.
3. If AI-related: is the growth in tokens, or in cost per token? Tokens up means
   usage grew (possibly fine). Cost per token up means efficiency regressed
   (never fine).
4. Route to the owning team with the specific delta, not the total.

### Cache regression

1. Correlate the step change with deploy timestamps.
2. Look for variable content near the start of system prompts.
3. Ticket to the owning team with the before/after cache rate and the estimated
   monthly cost of the regression. Attaching a dollar figure is what gets it
   prioritized.

## Metrics worth reporting

Resist reporting everything. Six numbers, monthly:

1. **Total Azure spend**, vs budget, vs prior month
2. **AI spend as % of total** — the trend line leadership asks about
3. **Cost per million tokens** — the efficiency metric
4. **PTU utilization**, average and peak — the commitment-efficiency metric
5. **Allocation coverage %** — the data-quality metric
6. **Realized savings** from the period's optimizations — the metric that funds
   the practice

Number 6 is the one teams forget, and it is the reason FinOps programs get
defunded. Track what each intervention saved, in dollars, and report it.

## Anti-patterns

Worth naming, because each of these is common and each quietly wastes the effort
spent on everything else in this repo:

- **Paging on cost alerts.** The money is already spent. You are waking someone
  up to feel bad. Page on the token plane; notify on the cost plane.
- **One dashboard for all audiences.** Finance and on-call need different views
  at different refresh rates. A merged dashboard serves neither.
- **Thresholds set to round numbers.** `$1000/day` was chosen because it is round,
  not because it is meaningful. Derive thresholds from observed percentiles.
- **Optimizing before measuring.** "Let's switch to a cheaper model" without unit
  economics in place produces no evidence either way, and the change gets
  reverted the next time someone complains about quality.
- **Ignoring the cost of the monitoring.** Event Hub log ingestion for a
  high-traffic Azure OpenAI service can genuinely exceed the cost of the service
  being monitored. Measure it; it shows up in your own `azure_billing` data.
- **Treating untagged spend as noise.** It is usually the fastest-growing
  category, precisely because nobody owns it.

## A realistic rollout

- **Week 1** — App registration, RBAC, `azure_billing` + `azure_openai` metrics
  ingesting. Prebuilt dashboards live. Ingest watchdog rule created.
- **Week 2** — Token burn rate and PTU saturation rules. Dashboard C for on-call.
  ML jobs 1 and 2 started (baselining).
- **Week 3–4** — Tag enforcement policy, tag promotion pipeline, Dashboard A and
  B. Budget and forecast rules. First weekly review meeting.
- **Month 2** — EDOT app instrumentation. Unit economics summary index and ML
  job 3. First monthly report with all six metrics.
- **Month 3+** — Cost Management Exports if line-item detail is needed. AI
  Assistant. Optimization sprints funded by the savings you can now demonstrate.

Do not attempt this in one push. The ingest is a week; the practice is a quarter.
