# 08 — Chargeback for a Shared AI Platform

The gap left open by everything before this doc.

## The problem

A single Azure OpenAI resource serving five teams carries **one** set of resource
tags. `azure.resource.tags` can express "this resource belongs to the platform
team" and nothing more. So the allocation model in
[07-finops-operating-model.md](07-finops-operating-model.md) works fine for
dedicated resources and breaks completely for the shared AI platform — which is
usually the largest and fastest-growing AI line item you have.

No amount of Elastic configuration fixes this. The billing data genuinely does
not contain the information. You have to generate it at the gateway.

## The architecture

```
  Team A ──┐  (subscription key A)
  Team B ──┤                         ┌──────────────┐
  Team C ──┼──▶  Azure API Management │ token limit  │──▶ Azure OpenAI
  Team D ──┤     (one subscription    │ emit metric  │    / AI Foundry
  Team E ──┘      per team)           │ semantic     │
                                      │ cache        │
                                      └──────┬───────┘
                                             │ diagnostic settings
                                             ▼
                                        Event Hub
                                             │
                                             ▼
                                     Elastic Agent → Elasticsearch
                                             │
                             cost allocated by each team's token share
```

The gateway is the only place that sees both *who called* and *how many tokens it
cost*. Azure's billing pipeline sees only the resource.

## Step 1 — APIM in front, one subscription per team

Create an APIM **product** per team (or per cost center), and a **subscription**
under each. The subscription key becomes the team's identity on every request.

```bash
RG="rg-ai-platform"
APIM="apim-ai-platform"

for TEAM in support search docintel sales platform; do
  az apim product create -g "$RG" --service-name "$APIM" \
    --product-id "team-$TEAM" --product-name "Team $TEAM" \
    --subscription-required true --state published --approval-required false
done
```

**The attribution only works if every request goes through the gateway.** A team
that keeps calling the Azure OpenAI endpoint directly is invisible, and its spend
silently lands in whatever bucket you use for the remainder. Close that door at
the network layer:

```bash
# Restrict the Azure OpenAI account to the APIM subnet only
az cognitiveservices account network-rule add \
  -g "$RG" -n "aoai-shared" \
  --subnet "/subscriptions/$SUB_ID/resourceGroups/$RG/providers/Microsoft.Network/virtualNetworks/vnet-ai/subnets/snet-apim"

az cognitiveservices account update -g "$RG" -n "aoai-shared" \
  --custom-domain aoai-shared --api-properties '{}' \
  --set properties.publicNetworkAccess=Disabled
```

Do this before you promise anyone chargeback numbers. Partial coverage produces
an allocation that looks precise and is wrong, which is worse than no allocation.

## Step 2 — the policies

Three policies on the API, all first-class APIM features for Azure OpenAI. The
`llm-` prefixed variants (`llm-token-limit`, `llm-emit-token-metric`) do the same
for non-OpenAI Foundry models.

### Enforce a per-team token budget

```xml
<azure-openai-token-limit
    counter-key="@(context.Subscription.Id)"
    tokens-per-minute="50000"
    estimate-prompt-tokens="false"
    remaining-tokens-header-name="x-ratelimit-remaining-tokens"
    tokens-consumed-header-name="x-tokens-consumed" />
```

`estimate-prompt-tokens="false"` uses the actual token counts returned by the
model rather than a pre-request estimate. More accurate, but the limit is applied
after the call — a single very large request can overshoot. Set `true` if you
need a hard pre-flight ceiling and can tolerate estimation error.

This is the control that turns a runaway loop in one team into that team's
problem instead of a platform-wide outage. It is worth deploying on its own
merits, before any chargeback work.

### Emit token counts tagged with the caller

```xml
<azure-openai-emit-token-metric namespace="finops">
    <dimension name="Subscription ID" value="@(context.Subscription.Id)" />
    <dimension name="Product"        value="@(context.Product?.Name ?? "unknown")" />
    <dimension name="API ID"         value="@(context.Api.Id)" />
</azure-openai-emit-token-metric>
```

Emits Total Tokens, Prompt Tokens, and Completion Tokens to Application Insights,
dimensioned by caller.

**Watch the cardinality.** Azure Monitor allows 10 dimension keys per metric and
caps active time series at 50,000 per region per 12-hour window — and the series
count is the *product* of each dimension's distinct values, not the sum. Three
dimensions with 10 values each is 1,000 series; adding Client IP takes you past
the cap immediately and metrics start dropping. Keep dimensions low-cardinality:
subscription, product, API. Never client IP or user ID.

### Semantic cache

```xml
<azure-openai-semantic-cache-lookup
    score-threshold="0.05"
    embeddings-backend-id="embeddings-backend"
    embeddings-backend-auth="system-assigned">
    <vary-by>@(context.Subscription.Id)</vary-by>
</azure-openai-semantic-cache-lookup>
<!-- ... backend call ... -->
<azure-openai-semantic-cache-store duration="60" />
```

This is the native version of the semantic caching idea worth taking from
third-party gateways — same cost lever, inside Azure, still visible to your
telemetry. Repeated or near-identical questions get served from cache instead of
billing another completion.

`vary-by` on the subscription keeps one team's cached answers from being served
to another. Drop it only if the content is genuinely tenant-neutral; leaving it
out is a data-leak path between teams.

## Step 3 — logs into Elastic

On the **APIM** resource, add a diagnostic setting for **"Logs related to
generative AI gateway"** and stream to the Event Hub from
[01-azure-prerequisites.md](01-azure-prerequisites.md#3-event-hub-only-if-you-want-azure-openai-logs).

Two categories matter, and you need both:

| Category | Carries |
|---|---|
| `ApiManagementGatewayLlmLog` | `PromptTokens`, `CompletionTokens`, `TotalTokens`, `ModelName`, `CorrelationId` |
| `ApiManagementGatewayLogs` | `ApimSubscriptionId`, `CorrelationId`, status, latency |

**The token counts and the caller identity are in different records.** They join
on `CorrelationId`. This is the single most important implementation detail in
this document — plan for the join rather than discovering it later.

Two more details that will bite:

**Streaming responses.** With `stream: true`, one request produces several log
records. **Sequence number 0 carries the token counts; every subsequent record
reports zero.** Filter to sequence 0, or you will either undercount (if you take
the last record) or handle a pile of zero rows.

**Field paths need verifying.** Exactly where these Azure properties land in
Elastic depends on the integration version and pipeline. Ingest one real request,
open the document in Discover, and confirm the paths before you build the
allocation on them. The queries below use `azure.apimanagement.*` as a
placeholder — treat it as a shape to adjust, not a promise.

## Step 4 — allocate the cost in Elastic

The naive allocation is a straight token share:

```
team_cost = shared_resource_cost × (team_tokens / total_tokens)
```

**Do not ship this.** Output tokens bill at roughly three to five times input
tokens on most models. A team doing summarization (long input, short output) and
a team doing generation (short input, long output) can consume identical total
tokens at very different real cost. A straight token share systematically
overcharges the summarizers and subsidizes the generators — and the subsidized
team never reports the bug.

Weight the completion tokens by the model's actual price ratio:

```
weighted_tokens = prompt_tokens + (completion_tokens × output_input_price_ratio)
team_cost       = resource_cost × (team_weighted / total_weighted)
```

For GPT-4o class models the ratio is around 4. Keep the real numbers in a small
lookup index alongside your budgets so finance can maintain them — see
[`assets/esql/chargeback_by_team.esql`](../assets/esql/chargeback_by_team.esql).

If teams use different models on the same resource, allocate **per model** and
sum, rather than pooling all tokens together. Different models have different
absolute prices, not just different input/output ratios.

## What this costs you

Be honest about this in the business case, because it is not free.

**APIM is a real line item.** Developer tier is not for production; you are
looking at Standard v2 or Premium. At low AI volumes the gateway can plausibly
cost more than the attribution is worth. Run the numbers before committing — and
once deployed, it appears in your own `azure_billing` data, so it is measurable.

**The gateway becomes a dependency.** Every AI request now traverses it. It needs
its own availability design, capacity planning, and on-call story. That is a real
operational commitment, not a config change.

**Allocation is proportional, not exact.** Even weighted, this is a defensible
model rather than a measurement. Write the method down, get finance to agree to
it once, and stop relitigating it monthly. The alternative — no allocation — is
not more accurate, it just hides the imprecision.

## Sequencing

Deploy the token limit policy first and on its own. It delivers protection
immediately, needs no Elastic work, and justifies the APIM investment even if
chargeback never ships. Add metrics and logging next, get the join working on
real documents, and only then build the allocation query and show anyone a
number.
