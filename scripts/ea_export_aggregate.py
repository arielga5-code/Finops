#!/usr/bin/env python3
"""Aggregate an Azure EA / Cost Management detail export into dashboard-sized CSVs.

A Detail_Enrollment_*.csv is one row per meter per resource per day — gigabytes for
a mid-size enrollment, and far past what any dashboard or API will accept. None of
the FinOps panels in docs/04-dashboards.md plot individual line items, so this
streams the export once and writes the four aggregates they actually need.

Streaming, stdlib only, constant memory except for the group-by dicts. Column names
are resolved against the EA legacy, Cost Management export and FOCUS spellings, so
the same script works whichever export type produced the file.

    python3 scripts/ea_export_aggregate.py Detail_Enrollment_51378402_202608_en.csv -o out/

Outputs in -o:
    daily_cost.csv   date, subscription, resource_group, meter_category, cost_center, currency, cost, quantity
    resource_cost.csv  month, subscription, resource_group, resource, meter_category, currency, cost   (top -n)
    ai_cost.csv      date, subscription, resource, meter_category, meter_name, currency, cost
    allocation.csv   date, allocation, currency, cost
"""

import argparse
import csv
import os
import sys
from collections import defaultdict

# Column aliases, most specific first. EA legacy, Cost Management export, FOCUS.
ALIASES = {
    "date": ["Date", "UsageDate", "UsageDateTime", "usage_date", "ChargePeriodStart", "DateTime"],
    "cost": ["ExtendedCost", "CostInBillingCurrency", "BilledCost", "PreTaxCost", "Cost", "CostInUsd"],
    "currency": ["BillingCurrency", "BillingCurrencyCode", "Currency", "CurrencyCode"],
    "subscription": ["SubscriptionName", "SubAccountName", "SubscriptionId", "SubscriptionGuid"],
    "resource_group": ["ResourceGroup", "ResourceGroupName", "x_ResourceGroupName"],
    "meter_category": ["MeterCategory", "ServiceCategory", "ServiceName", "ConsumedService"],
    "meter_name": ["MeterName", "SkuPriceDetails", "SkuId", "Product"],
    "cost_center": ["CostCenter", "x_CostCenter"],
    "resource": ["ResourceName", "InstanceId", "ResourceId", "InstanceName"],
    "quantity": ["ConsumedQuantity", "Quantity", "UsageQuantity", "PricingQuantity"],
    "tags": ["Tags", "ResourceTags", "x_ResourceTags"],
}

# Meter categories / products that bill Azure AI. Matched case-insensitively as substrings.
AI_MARKERS = ("cognitive", "openai", "azure ai", "machine learning", "machinelearning", "ai foundry")


def resolve(header):
    """Map our field names onto the export's actual column names."""
    lowered = {name.strip().lower().lstrip("﻿"): name for name in header}
    resolved = {}
    for field, candidates in ALIASES.items():
        for candidate in candidates:
            actual = lowered.get(candidate.lower())
            if actual is not None:
                resolved[field] = actual
                break
    return resolved


def normalize_date(value):
    """EA exports use MM/DD/YYYY; Cost Management and FOCUS use ISO. Return YYYY-MM-DD."""
    value = (value or "").strip()
    if not value:
        return ""
    head = value.split("T")[0].split(" ")[0]
    if "/" in head:
        parts = head.split("/")
        if len(parts) == 3:
            month, day, year = parts
            if len(year) == 2:
                year = "20" + year
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
        return head
    return head


def to_float(value):
    """Cost columns carry thousands separators and parenthesised negatives."""
    text = (value or "").strip().replace(",", "").replace(" ", "")
    if not text:
        return 0.0
    if text.startswith("(") and text.endswith(")"):
        text = "-" + text[1:-1]
    try:
        return float(text)
    except ValueError:
        return 0.0


def short_resource(value):
    """InstanceId is a full ARM path; the resource name is its last segment."""
    value = (value or "").strip()
    if "/" in value:
        tail = value.rstrip("/").rsplit("/", 1)[-1]
        if tail:
            return tail
    return value or "(no resource)"


def is_ai(meter_category, meter_name):
    haystack = f"{meter_category} {meter_name}".lower()
    return any(marker in haystack for marker in AI_MARKERS)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("export", help="path to the Detail_Enrollment_*.csv (or Cost Management export)")
    parser.add_argument("-o", "--out-dir", default="out", help="directory for the aggregate CSVs (default: out)")
    parser.add_argument("-n", "--top", type=int, default=200, help="resources to keep in resource_cost.csv (default: 200)")
    parser.add_argument("--skip-rows", type=int, default=0,
                        help="header rows to skip before the column header (EA portal exports sometimes prepend a title row)")
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)

    daily = defaultdict(lambda: [0.0, 0.0])        # key -> [cost, quantity]
    resources = defaultdict(float)
    ai = defaultdict(float)
    allocation = defaultdict(float)

    rows_read = 0
    rows_costed = 0
    total_cost = 0.0
    currencies = set()

    # newline="" per the csv module; errors="replace" because these exports carry
    # stray encodings in tag and resource names.
    with open(args.export, newline="", encoding="utf-8-sig", errors="replace") as handle:
        for _ in range(args.skip_rows):
            handle.readline()
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            sys.exit("error: no header row found. If the export prepends title rows, pass --skip-rows.")

        cols = resolve(reader.fieldnames)
        for required in ("date", "cost"):
            if required not in cols:
                sys.exit(
                    f"error: could not find a {required} column.\n"
                    f"  looked for: {', '.join(ALIASES[required])}\n"
                    f"  found: {', '.join(reader.fieldnames[:40])}"
                )
        print(f"resolved columns: {', '.join(f'{k}={v}' for k, v in sorted(cols.items()))}", file=sys.stderr)

        def get(row, field, default=""):
            column = cols.get(field)
            if column is None:
                return default
            return (row.get(column) or default).strip()

        for row in reader:
            rows_read += 1
            if rows_read % 1_000_000 == 0:
                print(f"  {rows_read:,} rows, {total_cost:,.2f} cost so far", file=sys.stderr)

            cost = to_float(row.get(cols["cost"]))
            date = normalize_date(row.get(cols["date"]))
            if not date:
                continue
            rows_costed += 1
            total_cost += cost

            currency = get(row, "currency", "USD") or "USD"
            currencies.add(currency)
            subscription = get(row, "subscription", "(unknown)") or "(unknown)"
            resource_group = get(row, "resource_group", "(none)") or "(none)"
            meter_category = get(row, "meter_category", "(unknown)") or "(unknown)"
            meter_name = get(row, "meter_name")
            cost_center = get(row, "cost_center")
            tags = get(row, "tags")
            quantity = to_float(row.get(cols["quantity"])) if "quantity" in cols else 0.0

            # An explicit "unallocated" bucket, per docs/02-cost-ingestion.md: untagged
            # spend that drops out of a group-by is how allocation coverage rots unseen.
            if not cost_center:
                cost_center = "unallocated"

            daily_key = (date, subscription, resource_group, meter_category, cost_center, currency)
            bucket = daily[daily_key]
            bucket[0] += cost
            bucket[1] += quantity

            resources[(date[:7], subscription, resource_group, short_resource(get(row, "resource")),
                        meter_category, currency)] += cost

            if is_ai(meter_category, meter_name):
                ai[(date, subscription, short_resource(get(row, "resource")), meter_category, meter_name, currency)] += cost

            allocated = "allocated" if (cost_center != "unallocated" or tags) else "unallocated"
            allocation[(date, allocated, currency)] += cost

    def write(name, header, rows):
        path = os.path.join(args.out_dir, name)
        with open(path, "w", newline="", encoding="utf-8") as handle:
            # LF, not the csv module's default CRLF: a stray \r otherwise rides
            # along in the last column for strict readers.
            writer = csv.writer(handle, lineterminator="\n")
            writer.writerow(header)
            writer.writerows(rows)
        size = os.path.getsize(path)
        print(f"wrote {path}  {len(rows):,} rows  {size / 1_048_576:.2f} MB", file=sys.stderr)
        if size > 8 * 1_048_576:
            print(f"  warning: over the 8 MB dashboard attachment limit — raise the grain or narrow the period",
                  file=sys.stderr)

    write("daily_cost.csv",
          ["date", "subscription", "resource_group", "meter_category", "cost_center", "currency", "cost", "quantity"],
          [[d, s, rg, mc, cc, cur, round(v[0], 4), round(v[1], 4)]
           for (d, s, rg, mc, cc, cur), v in sorted(daily.items())])

    top = sorted(resources.items(), key=lambda kv: kv[1], reverse=True)[:args.top]
    write("resource_cost.csv",
          ["month", "subscription", "resource_group", "resource", "meter_category", "currency", "cost"],
          [[m, s, rg, r, mc, cur, round(c, 4)] for (m, s, rg, r, mc, cur), c in top])

    write("ai_cost.csv",
          ["date", "subscription", "resource", "meter_category", "meter_name", "currency", "cost"],
          [[d, s, r, mc, mn, cur, round(c, 4)] for (d, s, r, mc, mn, cur), c in sorted(ai.items())])

    write("allocation.csv", ["date", "allocation", "currency", "cost"],
          [[d, a, cur, round(c, 4)] for (d, a, cur), c in sorted(allocation.items())])

    print(f"\n{rows_read:,} rows read, {rows_costed:,} with a usable date", file=sys.stderr)
    print(f"total cost across the export: {total_cost:,.2f} {'/'.join(sorted(currencies)) or 'USD'}", file=sys.stderr)
    if len(currencies) > 1:
        print("warning: more than one billing currency — filter by currency before summing", file=sys.stderr)
    print("Sanity-check that total against the Azure portal for the same window before publishing.", file=sys.stderr)


if __name__ == "__main__":
    main()
