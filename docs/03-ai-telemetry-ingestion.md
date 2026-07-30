# 03 — AI Telemetry Ingestion

This is the half that makes the whole exercise worth doing. Cost data alone tells
you *that* you spent money. Token telemetry tells you *why*, and tells you in
minutes rather than days.

## Layer 1 — `azure_openai` metrics (start here)

Elastic Agent scrapes Azure Monitor for the Cognitive Services metrics specific to
Azure OpenAI.

### Configuration

Fleet → Integrations → **Azure OpenAI**.

| Setting | Value |
|---|---|
| Client ID / Secret / Tenant / Subscription | same app registration as billing |
| **Period** | `300s` **or a multiple of it** |
| Resource IDs | `/subscriptions/{guid}/resourceGroups/{rg}/providers/Microsoft.CognitiveServices/accounts/{name}` |
| Resource Groups | alternative: all Azure OpenAI accounts in the listed groups |

`period` must be `300s` or a multiple. The underlying metrics have a 5-minute
timegrain; polling faster returns the same values repeatedly, costs you Azure
Monitor API calls, and inflates any `SUM()` you build on top of gauge metrics.

Prefer **Resource Groups** over enumerating **Resource IDs** if new deployments
appear regularly — otherwise every new Azure OpenAI resource is invisible until
someone remembers to edit the policy. Silent gaps in a cost tool are worse than
loud failures.

### Metric fields — `metrics-azure_openai.metrics-*`

| Field | Type | What it is |
|---|---|---|
| `azure.open_ai.processed_prompt_tokens.total` | long | **Input** tokens processed |
| `azure.open_ai.generated_tokens.total` | long | **Output** tokens generated |
| `azure.open_ai.token_transaction.total` | long | Total inference tokens |
| `azure.open_ai.active_tokens.total` | long | Total tokens minus cached tokens |
| `azure.open_ai.requests.total` | long | API calls |
| `azure.open_ai.fine_tuned_training_hours.total` | float | Fine-tuning training hours |
| `azure.open_ai.time_to_response.avg` | float | Time to first response (PTU / PTU-managed) |
| `azure.open_ai.context_tokens_cache_match_rate.avg` | float | % prompt tokens served from cache (PTU-managed) |
| `azure.open_ai.provisioned_managed_utilization_v2.avg` | float (%) | `(PTUs consumed / PTUs deployed) × 100` |

Four of these deserve specific commentary because they map directly to money:

**`processed_prompt_tokens` vs `generated_tokens`.** Output tokens are billed at
several times the input rate on most models. A dashboard that charts "total
tokens" hides the expensive half. Always split them.

**`active_tokens.total`** is total minus cached. The gap between
`token_transaction.total` and `active_tokens.total` is your cache savings. If that
gap is near zero on a PTU-managed deployment, prompt caching is not working and
there is likely real money in fixing prompt prefixes so they are cacheable.

**`context_tokens_cache_match_rate.avg`** is the same story as a direct
percentage. Treat a falling cache match rate as a cost regression — it usually
means someone put a timestamp or a session ID at the *start* of a system prompt
instead of the end.

**`provisioned_managed_utilization_v2.avg`** is the PTU story, and it cuts both
ways. Above 100% Azure throttles you and returns 429s — a reliability problem that
often gets "solved" by over-provisioning. Persistently *below* ~50% means you are
paying for reserved capacity you do not use, and PAYG would have been cheaper.
Both are alertable; see [05-alerting.md](05-alerting.md).

## Layer 2 — `azure_openai` logs (add when you need detail)

Delivered via Event Hub. Three categories:

- **Audit** — control-plane and access events
- **RequestResponse** — request/response records, including prompt and completion
  content, token counts and model identity
- **ApiManagementGatewayLogs** — when traffic is fronted by APIM

Requires the Event Hub and checkpoint storage account from
[01-azure-prerequisites.md](01-azure-prerequisites.md#3-event-hub-only-if-you-want-azure-openai-logs).
Agent RBAC: `Azure Event Hubs Data Receiver`, `Storage Blob Data Contributor`.

Two warnings, both learned expensively by other people:

1. **RequestResponse logs can contain prompt and completion content.** That is
   customer data, possibly PII, possibly regulated. Decide deliberately whether it
   goes into your observability cluster, and if it does, apply field-level
   security or a redaction pipeline. "We turned on all log categories to see what
   we'd get" is how prompt content ends up in an index that half the company can
   read.
2. **Volume scales with request rate, and documents are large.** This can
   plausibly cost more than the Azure OpenAI usage you are trying to monitor.
   Sample, or restrict to the categories you query.

The APIM gateway logs are the highest-leverage of the three for FinOps
specifically, because APIM subscription keys give you the per-team, per-app
attribution that the resource-level metrics cannot. If you run a central Azure
OpenAI platform for multiple teams, this is how chargeback becomes possible at
all.

## Layer 3 — Azure AI Foundry integration

Elastic ships an **Azure AI Foundry** integration (tech preview) covering the
broader Foundry model catalog — GPT-family, Mistral, Llama and others — rather
than Azure OpenAI alone. Prebuilt dashboards cover model usage, token
consumption, latency, cost and content filtering in one view.

Use it if your estate has moved to Foundry, or if you run multiple model families
and want one pane rather than per-service dashboards. Being tech preview, expect
field names to move between releases — pin your dashboards and alert rules to a
known package version and re-test on upgrade rather than tracking `latest`.

## Layer 4 — application-side attribution with EDOT / OpenTelemetry

Azure-side telemetry attributes cost to a *resource*. It cannot attribute cost to
a **tenant**, a **feature**, a **user cohort**, or an **agent step** — and those
are the questions that actually drive optimization decisions.

For that you need instrumentation in the application. Use **EDOT** (Elastic
Distribution of OpenTelemetry) and emit the GenAI semantic-convention attributes:

```python
# Illustrative — instrument at the boundary where you call the model.
with tracer.start_as_current_span("chat.completion") as span:
    span.set_attribute("gen_ai.system", "az.ai.openai")
    span.set_attribute("gen_ai.request.model", deployment_name)
    span.set_attribute("gen_ai.usage.input_tokens",  usage.prompt_tokens)
    span.set_attribute("gen_ai.usage.output_tokens", usage.completion_tokens)

    # Your own dimensions — this is the part Azure cannot give you
    span.set_attribute("finops.tenant_id",  tenant_id)
    span.set_attribute("finops.feature",    "document_summarize")
    span.set_attribute("finops.cost_center", cost_center)
```

Adding your own `finops.*` dimensions alongside the standard `gen_ai.*` ones is
the whole point. Once those spans are in Elastic, "which customer is unprofitable
on our AI feature" becomes a single ES|QL query instead of a quarter-long project.

Keep the attribute names identical to the tag names you promoted in
[02-cost-ingestion.md](02-cost-ingestion.md#working-with-azureresourcetags). Same
`finops.cost_center` on both planes means you can correlate them without a
translation table.

### Sanity check on token counts

Application-reported token counts and Azure Monitor metrics will not match
exactly — different aggregation boundaries, retries counted differently, streaming
edge cases. Small divergence is normal. A *growing* divergence usually means
retries are being billed but not recorded by your app, which is itself a finding
worth chasing.

## Suggested ingest ordering

1. `azure_billing` — a day to set up, immediate budget value
2. `azure_openai` metrics — a day, immediate real-time protection value
3. EDOT app instrumentation — a sprint, highest long-term value
4. `azure_openai` logs via Event Hub — only when a specific question demands it

Next: [04-dashboards.md](04-dashboards.md)
