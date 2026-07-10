# Billing export formats

## AWS Cost and Usage Report (CUR / CUR 2.0)

Key columns (legacy CUR; CUR 2.0 renames some to snake_case without the
`lineItem/` prefix):

- `lineItem/UsageAccountId` — account the usage occurred in
- `lineItem/ProductCode`, `product/ProductName` — service (e.g. AmazonEC2)
- `lineItem/UsageType`, `lineItem/Operation` — specific usage/rate dimension
- `lineItem/UsageStartDate`, `lineItem/UsageEndDate` — usage window
- `lineItem/UnblendedCost` — actual cost to that account, undiscounted by
  shared commitments — use for "what did this account actually cost"
- `lineItem/BlendedCost` — cost with shared RI/Savings Plan benefit
  averaged across the payer account's linked accounts — use for
  organization-wide effective rate, not per-account attribution
- `lineItem/NetUnblendedCost` (Enterprise Discount Program only) — after
  negotiated discounts
- `savingsPlan/SavingsPlanEffectiveCost`, `reservation/EffectiveCost` —
  amortized commitment cost, spreads an upfront/partial-upfront payment
  across its term — use this for accurate monthly trend analysis of
  committed spend, not the sporadic upfront charge
- `resourceTags/user:<TagKey>` — cost allocation tags; absence of a value
  here is "untagged spend" and worth calling out explicitly

## Azure Cost Management exports

- `SubscriptionId`, `ResourceGroup`, `ResourceId`
- `MeterCategory`, `MeterSubCategory`, `MeterName` — service and SKU
- `UsageDateTime` / `Date`
- `CostInBillingCurrency` (post-discount) vs `PayGPrice` (list price) —
  compare the two to quantify negotiated/reservation savings
- `Tags` — JSON blob of resource tags; parse before aggregating by tag

## GCP Billing export (BigQuery table)

- `project.id`, `service.description`, `sku.description`
- `usage_start_time`, `usage_end_time`
- `cost` (list cost) and `credits` (array — CUD/SUD/promo credits, negative
  values); **net cost = cost + SUM(credits.amount)** — always net out
  credits before reporting "actual" spend, since raw `cost` overstates it
- `labels` — repeated record of key/value; GCP's equivalent of cost
  allocation tags

## Normalization notes

- Always state which cost basis (unblended/blended/amortized/net) a number
  uses when reporting it — the same line item can differ 2-3x between bases
  when heavy commitment discounts are in play.
- Currency: exports are usually in the payer/billing account's currency;
  don't sum across accounts with different billing currencies without
  converting first.
