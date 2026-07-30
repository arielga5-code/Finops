# 00 — Reference Architecture

## The two data planes

Azure AI cost visibility in Elastic is built from two independent pipelines that
meet in Kibana. Keeping them conceptually separate matters, because they have
completely different latency, granularity and cost characteristics.

```
                         ┌─────────────────────────────────────────┐
   COST PLANE            │  Azure Cost Management API              │
   (lagging, $)          │  scope: subscription | dept | billing   │
                         └───────────────┬─────────────────────────┘
                                         │ poll every 24h
                                         ▼
                              Elastic Agent (azure_billing)
                                         │
                                         ▼
                            metrics-azure.billing-default
                                         │
                                         ▼
   ─────────────────────────────────  KIBANA  ──────────────────────────────
                                         ▲
                            metrics-azure_openai.metrics-*
                            logs-azure_openai.*
                            traces-* (EDOT / OTel from your app)
                                         ▲
                                         │ 5-min timegrain / real time
   TELEMETRY PLANE        ┌──────────────┴──────────────────────────┐
   (leading, tokens)      │  Azure Monitor metrics + Event Hub logs │
                          │  Azure OpenAI / Azure AI Foundry        │
                          └─────────────────────────────────────────┘
```

## The latency problem

This is the single most important design constraint, and most Elastic-on-Azure
cost setups get it wrong by alerting only on the cost plane.

| Signal | Source | Freshness | Use it for |
|---|---|---|---|
| `azure.billing.actual_cost` | Cost Management API, 24h poll | 24–48h behind | Budget tracking, chargeback, trend, monthly close |
| `azure.billing.forecast_cost` | Cost Management API, 24h poll | 24–48h behind | Month-end overrun projection |
| `azure.open_ai.*_tokens.total` | Azure Monitor, 300s timegrain | ~5–10 min | **Runaway detection, burn-rate alerting** |
| `azure.open_ai.provisioned_managed_utilization_v2.avg` | Azure Monitor, 300s | ~5–10 min | PTU saturation / throttling risk |
| App spans (EDOT/OTel) | Your application | seconds | Per-tenant, per-feature, per-prompt attribution |

The Elastic Agent polls the billing API twice per 24 hours in the default
configuration. Azure itself does not finalize usage records instantly. Net effect:
**a cost alert cannot save you from a runaway AI job.** By the time
`actual_cost` moves, you have already spent the money.

The design consequence, which threads through the rest of this repo:

- **Cost plane → budget, allocation, and forecast rules.** Daily/weekly cadence.
- **Telemetry plane → real-time protective rules.** Token burn rate, PTU
  utilization, error-rate-driven retry storms. Minute cadence.
- **Join the two** only for unit economics ($ per million tokens, $ per request),
  where a one-day lag is acceptable and the ratio is what you actually care about.

## Deployment options

Three ways to run this. Pick based on who owns the Elastic deployment.

### 1. Elastic Cloud Hosted / Serverless + Agentless integrations

Cost plane needs no infrastructure. The `azure_billing` integration supports an
**Elastic Managed (agentless)** deployment mode on Elastic Cloud and Serverless —
you supply the Azure credentials in Fleet and Elastic runs the collector. This is
the lowest-friction path and the default recommendation for the cost plane, since
it is a low-volume API poll with no host affinity.

### 2. Azure Native Integration ("Elastic Cloud (Elasticsearch) — An Azure Native
ISV Service")

Elastic sold and billed through the Azure Marketplace. Two things it buys you that
matter for FinOps:

- **Elastic spend lands on your Azure invoice**, drawing down an Azure commitment
  (MACC/EA). Your observability tool's cost then shows up in the same
  `azure_billing` data you are already ingesting — meta, but genuinely useful for
  honest TCO reporting.
- **Automatic diagnostic-settings wiring via tag rules** — you declare which
  resources ship logs by tag, instead of configuring diagnostic settings per
  resource.

### 3. Self-managed Elastic Agent on a VM/AKS

Required if your Elastic cluster is self-hosted, or if network policy forbids
Elastic-managed egress to your Azure tenant. Run one agent per billing scope. Do
not run the billing integration on multiple agents against the same scope — you
will double-count cost.

## Recommended shape

For most teams:

- Cost plane: **agentless** `azure_billing`, one policy per billing scope.
- Telemetry plane: `azure_openai` metrics via agentless or a small agent; logs via
  Event Hub (needs an agent with the `azure-eventhub` input and a storage account
  for checkpointing).
- App attribution: **EDOT** (Elastic Distribution of OpenTelemetry) in the
  application, emitting GenAI semantic-convention span attributes.

Start with the cost plane and the Azure OpenAI metrics. Add Event Hub logs only
when you need prompt/response-level detail or content-filter events — it is the
most operationally involved piece and the highest-volume ingest.

## Ingest volume and cost of the monitoring itself

Do not skip this. A FinOps tool that quietly becomes a top-5 line item is a bad
look.

- **Billing metrics**: negligible. Two API calls per 24h; a handful of documents.
  Azure charges for Cost Management API calls, but at this call volume it rounds
  to zero.
- **Azure OpenAI metrics**: small. Per deployment, ~9 metrics at 5-min resolution.
- **Azure OpenAI logs via Event Hub**: this is the one that can get expensive.
  RequestResponse logs scale with your request volume, and if you log prompts and
  completions the documents are large. Sample aggressively, or scope the
  diagnostic setting to the categories you actually query. Consider a shorter ILM
  hot phase and a lower retention than your default.

Next: [01-azure-prerequisites.md](01-azure-prerequisites.md)
