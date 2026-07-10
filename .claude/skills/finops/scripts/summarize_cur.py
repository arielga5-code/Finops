#!/usr/bin/env python3
"""Summarize an AWS Cost and Usage Report (or similar cost CSV) by dimension and time bucket.

Accepts either raw CUR column names (lineItem/UnblendedCost, lineItem/ProductCode, ...)
or simplified column names (cost, service, date, ...) via --cost-col/--dim-col/--date-col.

Examples:
    python3 summarize_cur.py cur.csv --dim lineItem/ProductCode --bucket month
    python3 summarize_cur.py export.csv --cost-col cost --dim-col service --date-col usage_date --bucket day
"""
import argparse
import csv
import sys
from collections import defaultdict
from datetime import datetime

DEFAULT_COST_COL = "lineItem/UnblendedCost"
DEFAULT_DIM_COL = "lineItem/ProductCode"
DEFAULT_DATE_COL = "lineItem/UsageStartDate"

DATE_FORMATS = ("%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d")


def parse_date(value: str) -> datetime:
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(value[: len(fmt) + 2].strip(), fmt)
        except ValueError:
            continue
    raise ValueError(f"Unrecognized date format: {value!r}")


def bucket_key(dt: datetime, bucket: str) -> str:
    if bucket == "day":
        return dt.strftime("%Y-%m-%d")
    if bucket == "month":
        return dt.strftime("%Y-%m")
    raise ValueError(f"Unknown bucket: {bucket}")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("csv_path", help="Path to the billing/usage CSV export")
    ap.add_argument("--cost-col", default=DEFAULT_COST_COL, help=f"Cost column name (default: {DEFAULT_COST_COL})")
    ap.add_argument("--dim-col", default=DEFAULT_DIM_COL, help=f"Dimension column to group by (default: {DEFAULT_DIM_COL})")
    ap.add_argument("--date-col", default=DEFAULT_DATE_COL, help=f"Date column name (default: {DEFAULT_DATE_COL})")
    ap.add_argument("--bucket", choices=["day", "month"], default="month", help="Time bucket granularity")
    ap.add_argument("--top", type=int, default=15, help="Show only the top N dimension values by total cost")
    args = ap.parse_args()

    totals = defaultdict(float)
    by_bucket_dim = defaultdict(lambda: defaultdict(float))
    skipped = 0

    with open(args.csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if args.cost_col not in (reader.fieldnames or []):
            print(f"error: cost column {args.cost_col!r} not found. Available columns:", file=sys.stderr)
            for col in reader.fieldnames or []:
                print(f"  {col}", file=sys.stderr)
            return 1
        for row in reader:
            raw_cost = row.get(args.cost_col, "")
            try:
                cost = float(raw_cost) if raw_cost not in ("", None) else 0.0
            except ValueError:
                skipped += 1
                continue
            dim = row.get(args.dim_col) or "(unknown)"
            date_raw = row.get(args.date_col)
            try:
                bkt = bucket_key(parse_date(date_raw), args.bucket) if date_raw else "(no date)"
            except ValueError:
                bkt = "(unparseable date)"
            totals[dim] += cost
            by_bucket_dim[bkt][dim] += cost

    ranked = sorted(totals.items(), key=lambda kv: kv[1], reverse=True)
    grand_total = sum(totals.values())

    print(f"Grand total: {grand_total:,.2f}")
    if skipped:
        print(f"(skipped {skipped} rows with unparseable cost)")
    print(f"\nTop {args.top} by {args.dim_col}:")
    for dim, cost in ranked[: args.top]:
        pct = (cost / grand_total * 100) if grand_total else 0
        print(f"  {dim:<40} {cost:>14,.2f}  ({pct:5.1f}%)")

    print(f"\nBy {args.bucket}:")
    for bkt in sorted(by_bucket_dim):
        bkt_total = sum(by_bucket_dim[bkt].values())
        print(f"  {bkt}: {bkt_total:,.2f}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
