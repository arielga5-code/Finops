# 01 — Azure Prerequisites

Everything Azure-side that must exist before you install a single Elastic
integration.

## 1. App Registration (service principal)

One app registration serves both the cost plane and the metrics plane.

```bash
# Create the app registration + service principal
az ad app create --display-name "elastic-finops-collector"

APP_ID=$(az ad app list --display-name "elastic-finops-collector" --query "[0].appId" -o tsv)
az ad sp create --id "$APP_ID"

# Create a client secret (record the value — it is shown once)
az ad app credential reset --id "$APP_ID" --append \
  --display-name "elastic-agent" --years 1 \
  --query "{clientId:appId, clientSecret:password, tenantId:tenant}"
```

You now have the four values every Azure integration in Fleet asks for:

| Fleet field | Value |
|---|---|
| Client ID | `appId` |
| Client Secret | `password` from the credential reset |
| Tenant ID | `tenant` |
| Subscription ID | the subscription the agent uses to reach the Azure APIs |

> **Secret rotation.** Set a calendar reminder for expiry. A silently expired
> secret produces an integration that stops ingesting without any obvious alert —
> which for a cost tool means budget alerts stop firing exactly when you stop
> looking. Mitigate with a "no billing data in 48h" watchdog rule; see
> [05-alerting.md](05-alerting.md#8-ingest-watchdog).

## 2. RBAC — the role depends on your billing scope

This is the step that most often goes wrong. The role you need is **not** the same
for a subscription-scoped install as for an EA/MCA-wide install.

| Billing scope | Required role | Where assigned |
|---|---|---|
| Subscription | **Billing Reader** | The subscription |
| Department (EA only) | **Department Reader** | EA portal / billing account |
| Billing account (EA or MCA) | **Billing Account Reader** | EA portal / billing account |

Subscription-scoped assignment:

```bash
SUB_ID="00000000-0000-0000-0000-000000000000"
az role assignment create \
  --assignee "$APP_ID" \
  --role "Billing Reader" \
  --scope "/subscriptions/$SUB_ID"
```

Department and billing-account roles are **not** assignable with
`az role assignment create` — they are billing RBAC, granted in the Cost
Management + Billing blade or the EA portal, not Azure RBAC. Budget for a
back-and-forth with whoever owns the enrollment; in most organizations that is
procurement or a central platform team, not the engineers doing this work.

Choosing a scope:

- **Subscription** — simplest, and correct if one team owns one subscription.
  You will need one integration policy per subscription.
- **Department / Billing account** — one policy covers everything below it. Prefer
  this if you have more than a handful of subscriptions. Set
  `billing_scope_department` or `billing_scope_account_id` in the integration;
  they override the subscription scope (account ID wins over department ID).

Additionally, for the metrics plane the principal needs read access to the
resources it scrapes:

```bash
az role assignment create --assignee "$APP_ID" \
  --role "Monitoring Reader" --scope "/subscriptions/$SUB_ID"
```

## 3. Event Hub (only if you want Azure OpenAI *logs*)

Metrics do not need this. Logs — audit, request/response, content-filter results,
APIM gateway logs — are delivered by streaming diagnostic settings to an Event Hub
that Elastic Agent consumes.

```bash
RG="rg-elastic-finops"
NS="evhns-elastic-finops"
HUB="insights-logs-openai"

az eventhubs namespace create -g "$RG" -n "$NS" --location eastus --sku Standard
az eventhubs eventhub create -g "$RG" --namespace-name "$NS" -n "$HUB" \
  --partition-count 4 --cleanup-policy Delete --retention-time-in-hours 24

# Storage account for consumer-group checkpointing (required by the agent input)
az storage account create -g "$RG" -n "stelasticfinops" --sku Standard_LRS
```

Then point the Azure OpenAI resource's diagnostic settings at it:

```bash
OPENAI_ID="/subscriptions/$SUB_ID/resourceGroups/$RG/providers/Microsoft.CognitiveServices/accounts/my-openai"

az monitor diagnostic-settings create \
  --name "to-elastic" \
  --resource "$OPENAI_ID" \
  --event-hub "$HUB" \
  --event-hub-rule "/subscriptions/$SUB_ID/resourceGroups/$RG/providers/Microsoft.EventHub/namespaces/$NS/authorizationRules/RootManageSharedAccessKey" \
  --logs '[{"category":"Audit","enabled":true},{"category":"RequestResponse","enabled":true}]'
```

If your traffic goes through API Management (a common pattern for multi-team
Azure OpenAI, and the right place to enforce per-team token quotas), also enable
the **ApiManagement Gateway** log category on the APIM resource. That is where
per-subscription-key attribution lives, which is usually how you get from
"the platform spent $X" to "team B spent $X".

Authentication from the agent to the Event Hub is either a **connection string**
(default) or **Microsoft Entra ID** via client secret. For Entra, the principal
needs:

- `Azure Event Hubs Data Receiver` on the namespace
- `Storage Blob Data Contributor` on the checkpoint storage account

Prefer Entra ID. Connection strings are long-lived shared secrets that end up
pasted in three places.

## 4. Cost Management Exports (optional, for line-item granularity)

The billing API gives daily aggregates. If you need line-item detail — individual
meters, reservation amortization, per-resource tags on every charge — configure a
Cost Management **export** to blob storage instead. See
[02-cost-ingestion.md](02-cost-ingestion.md#when-the-api-is-not-enough).

```bash
az costmanagement export create \
  --name "daily-focus-export" \
  --type "FocusCost" \
  --scope "/subscriptions/$SUB_ID" \
  --storage-account-id "/subscriptions/$SUB_ID/resourceGroups/$RG/providers/Microsoft.Storage/storageAccounts/stelasticfinops" \
  --storage-container "cost-exports" \
  --storage-directory "focus" \
  --recurrence Daily \
  --recurrence-period from="2026-08-01T00:00:00Z" to="2027-08-01T00:00:00Z" \
  --schedule-status Active \
  --timeframe MonthToDate
```

## Pre-flight checklist

- [ ] App registration created, secret recorded, expiry calendared
- [ ] Billing role assigned at the correct scope (and *verified* — see below)
- [ ] `Monitoring Reader` assigned for metrics
- [ ] Event Hub + storage account created (only if ingesting logs)
- [ ] Diagnostic settings enabled on each Azure OpenAI / AI Foundry resource
- [ ] Outbound network path from the agent (or Elastic's agentless egress) to
      `management.azure.com` and `login.microsoftonline.com`

Verify the billing role actually works before touching Elastic — this saves a lot
of time debugging an integration that is silently returning empty result sets:

```bash
az login --service-principal -u "$APP_ID" -p "$CLIENT_SECRET" --tenant "$TENANT_ID"
az rest --method post \
  --url "https://management.azure.com/subscriptions/$SUB_ID/providers/Microsoft.CostManagement/query?api-version=2023-11-01" \
  --body '{"type":"ActualCost","timeframe":"MonthToDate","dataset":{"granularity":"Daily","aggregation":{"totalCost":{"name":"Cost","function":"Sum"}}}}'
```

A `200` with rows means you are good. A `401`/`403` means the role assignment has
not propagated or is at the wrong scope.

Next: [02-cost-ingestion.md](02-cost-ingestion.md)
