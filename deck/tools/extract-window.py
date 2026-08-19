#!/usr/bin/env python3
"""
Pull the AI cost dataset workbook into JSON the deck can be derived from.

    python3 tools/extract-window.py aicostdata.xlsx --out data/ai-cost-window.json

The workbook is unusually well built: an Apps sheet, a Teams sheet, a BySource
sheet and a Metrics sheet, with a README that documents its own defects. Two
things follow from that.

First, its derived columns (Best_USD, USD_per_1k, everything on Metrics) are
live formulas with no cached values, so there is nothing to read out of them.
That is fine, and better: the deck recomputes them from the source columns, so
its figures cannot inherit a stale calculation.

Second, the two figures that appear in neither table, untagged Bedrock spend and
guardrail fees, are written into the README as labelled constants. They are read
from there by label rather than retyped here, so a corrected workbook produces a
corrected deck without anyone editing this file.
"""

import argparse
import json
import os
import sys
from importlib import import_module

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
load = import_module("xlsx-dump").load

# The two header figures, by the label the README gives them.
CONSTANTS = {
    "untaggedBedrock": "untagged bedrock",
    "guardrails": "guardrail fees",
}


def num(v):
    if v is None or v == "":
        return None
    if isinstance(v, str):
        try:
            return float(v.replace(",", "").replace("$", ""))
        except ValueError:
            return None
    return float(v)


def header_row(rows, first):
    """Index of the row whose first cell is `first`, case-insensitive."""
    for i, r in enumerate(rows):
        if r and str(r[0]).strip().lower() == first:
            return i
    raise SystemExit(f"no header row starting with {first!r}")


def read_apps(rows):
    i = header_row(rows, "application")
    out = []
    for r in rows[i + 1 :]:
        if not r or not r[0]:
            continue
        r = list(r) + [None] * (6 - len(r))
        out.append({
            "app": str(r[0]).strip(),
            "source": str(r[1]).strip(),
            "team": str(r[2]).strip() if r[2] else "unknown",
            "invocations": int(num(r[3]) or 0),
            "est": round(num(r[4]) or 0, 2),
            # null and 0 are different facts: null means the workbook gave no
            # reconciliation figure, 0 means it gave zero.
            "ce": None if num(r[5]) is None else round(num(r[5]), 2),
        })
    return out


def read_teams(rows):
    i = header_row(rows, "team")
    out = []
    for r in rows[i + 1 :]:
        if not r or not r[0]:
            continue
        name = str(r[0]).strip()
        if name.upper().startswith("TOTAL"):
            continue  # a formula row, recomputed here
        r = list(r) + [None] * (8 - len(r))
        out.append({
            "team": name,
            "claude": num(r[1]) or 0,
            "azure": num(r[2]) or 0,
            "gcp": num(r[3]) or 0,
            "invocations": int(num(r[4]) or 0),
            "est": round(num(r[5]) or 0, 2),
            "ce": None if num(r[6]) is None else round(num(r[6]), 2),
            # The workbook's own README calls this the authoritative attributed
            # figure, so it is carried across rather than recomputed.
            "best": round(num(r[7]) or 0, 2),
        })
    return out


def read_constants(book):
    found = {}
    for rows in book.values():
        for r in rows:
            if not r or len(r) < 2 or not r[0]:
                continue
            label = str(r[0]).strip().lower()
            for key, want in CONSTANTS.items():
                if label == want and num(r[1]) is not None:
                    found[key] = round(num(r[1]), 2)
    missing = set(CONSTANTS) - set(found)
    if missing:
        raise SystemExit(f"constants not found in the workbook: {sorted(missing)}")
    return found


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("xlsx")
    ap.add_argument("--out", required=True)
    ap.add_argument("--start", default="01/07/2026")
    ap.add_argument("--end", default="19/08/2026")
    args = ap.parse_args()

    book = load(args.xlsx)
    if "Apps" not in book or "Teams" not in book:
        raise SystemExit(f"expected Apps and Teams sheets, found {list(book)}")

    out = {
        "start": args.start,
        "end": args.end,
        "source": os.path.basename(args.xlsx),
        "apps": read_apps(book["Apps"]),
        "teams": read_teams(book["Teams"]),
        **read_constants(book),
    }
    with open(args.out, "w") as f:
        json.dump(out, f, indent=1, ensure_ascii=False)

    est = sum(a["est"] for a in out["apps"])
    inv = sum(a["invocations"] for a in out["apps"])
    tinv = sum(t["invocations"] for t in out["teams"])
    best = sum(t["best"] for t in out["teams"])
    print(f"{out['start']} to {out['end']}")
    print(f"  apps  {len(out['apps']):3} rows  est ${est:,.2f}  {inv:,} calls")
    print(f"  teams {len(out['teams']):3} rows  best ${best:,.2f}  {tinv:,} calls")
    print(f"  untagged Bedrock ${out['untaggedBedrock']:,.2f}  guardrails ${out['guardrails']:,.2f}")
    if inv != tinv:
        print(f"  WARNING: app and team invocation totals differ by {inv - tinv:,}")


if __name__ == "__main__":
    sys.exit(main())
