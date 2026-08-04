# FinOps — Elastic + Azure

Implementation reference for running Azure cost management on the Elastic Stack,
with a deliberate focus on **AI workload spend** (Azure OpenAI / Azure AI Foundry).

The goal is not "another cost dashboard". Azure's own Cost Management already does
that. The reason to put Azure cost data into Elastic is to sit cost *next to*
telemetry — tokens, latency, request rates, deployment utilization — so you can
answer questions Cost Management structurally cannot, such as "which model, in
which app, made yesterday's bill jump 40%, and was it worth it?"

## Contents

| Doc | What it covers |
|---|---|
| [00-architecture.md](docs/00-architecture.md) | Reference architecture, data flows, the latency problem, deployment options |
| [01-azure-prerequisites.md](docs/01-azure-prerequisites.md) | App registration, RBAC roles per billing scope, event hub, diagnostic settings |
| [02-cost-ingestion.md](docs/02-cost-ingestion.md) | `azure_billing` integration, full field schema, Cost Management Exports fallback |
| [03-ai-telemetry-ingestion.md](docs/03-ai-telemetry-ingestion.md) | `azure_openai`, Azure AI Foundry, EDOT/OpenTelemetry for app-side attribution |
| [04-dashboards.md](docs/04-dashboards.md) | Prebuilt dashboards, the four custom panels worth building, unit economics |
| [05-alerting.md](docs/05-alerting.md) | Budget, spike, forecast, PTU and token-burn rules — with API payloads |
| [06-ai-anomaly-and-assistant.md](docs/06-ai-anomaly-and-assistant.md) | ML anomaly detection jobs, AI Assistant, agentic investigation |
| [07-finops-operating-model.md](docs/07-finops-operating-model.md) | Tagging, showback, review cadence, what to do when an alert fires |

## Presentations

- [`presentations/finops-gaining-visibility.pptx`](presentations/finops-gaining-visibility.pptx) —
  15-slide management briefing on the Inform phase: why visibility precedes
  optimization, the five things that block it, and how to unblock each one.
- [`presentations/finops-gaining-visibility-cfo.pptx`](presentations/finops-gaining-visibility-cfo.pptx) —
  the same slides with speaker notes rewritten for a CFO: variance
  explainability, accrual and forecast quality, commitments as purchase
  obligations, chargeback as an accounting change.

Both are generated from [`presentations/build-deck.js`](presentations/build-deck.js);
see [`presentations/README.md`](presentations/README.md).

## Assets

Ready to apply, not pseudocode:

- `assets/esql/` — ES|QL queries for dashboards and alert rules
- `assets/alerts/` — Kibana alerting API payloads (`POST kbn:/api/alerting/rule`)
- `assets/ml/` — anomaly detection job + datafeed configs

## Read this first

Billing data lands in Elastic on a **24-hour poll**, on top of Azure's own
billing latency. Cost-based alerts are therefore lagging indicators — typically
24–48h behind reality. Token and utilization metrics arrive on a **5-minute**
timegrain. Any alerting design that needs to catch a runaway AI workload *before*
it bills must be built on the token metrics, not the cost metrics. See
[00-architecture.md](docs/00-architecture.md#the-latency-problem) — it drives most
of the design decisions in this repo.
