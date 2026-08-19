#!/usr/bin/env python3
"""
Pull the two AI cost exports into one JSON the decks can be derived from.

    python3 tools/extract-periods.py \
        --july  AI_cost_July_full.xlsx \
        --august AI_cost_by_team_20260801_to_20260819.xlsx \
        --out data/ai-cost-periods.json

The two workbooks are laid out the same way for their first six columns
(application, source, team, invocations, estimate, reconciliation figure) and
differ after that: July carries a Delta % column that August does not. Only the
first six are taken, because everything past them is arithmetic the deck would
rather do itself than inherit.

Both files are written in Hebrew, so sheets are found by shape rather than by
name: the detail sheet is the one whose header row starts with "Application".
That survives the next export being titled differently.

The August file carries a third sheet listing charges the source could not
attribute to any application. Those are read too, and kept out of the row
totals, because that is where they sit in the source.
"""

import argparse
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from importlib import import_module

load = import_module("xlsx-dump").load

# "01/08/2026 עד 19/08/2026" — the only place either workbook states a period.
DATE_RANGE = re.compile(r"(\d{2}/\d{2}/\d{4}).*?(\d{2}/\d{2}/\d{4})")
FIELDS = ["app", "source", "team", "invocations", "est", "ce"]


def num(v):
    if v is None or v == "":
        return None
    if isinstance(v, str):
        try:
            return float(v.replace(",", ""))
        except ValueError:
            return None
    return float(v)


def find_detail(book):
    """The sheet whose header row starts with Application."""
    for name, rows in book.items():
        for i, r in enumerate(rows[:6]):
            if r and str(r[0]).strip().lower() == "application":
                return name, rows[i + 1 :]
    raise SystemExit("no detail sheet: no header row starting with 'Application'")


def find_unattributed(book):
    """Rows the source itself says belong to no application."""
    for name, rows in book.items():
        for i, r in enumerate(rows[:4]):
            if r and len(r) >= 3 and str(r[1]).strip() in ("סכום", "Amount"):
                return [
                    {"item": r2[0], "amount": num(r2[1]), "note": r2[2] if len(r2) > 2 else ""}
                    for r2 in rows[i + 1 :]
                    if r2 and num(r2[1]) is not None
                ]
    return []


def find_range(book):
    for rows in book.values():
        for r in rows[:6]:
            for cell in r:
                m = DATE_RANGE.search(str(cell)) if cell else None
                if m:
                    return m.group(1), m.group(2)
    return None, None


def read(path):
    book = load(path)
    _, body = find_detail(book)
    rows = []
    for r in body:
        if not r or not r[0]:
            continue
        r = list(r) + [None] * (6 - len(r))
        rows.append(
            {
                "app": str(r[0]).strip(),
                "source": str(r[1]).strip(),
                "team": str(r[2]).strip() if r[2] else "unknown",
                "invocations": int(num(r[3]) or 0),
                "est": round(num(r[4]) or 0, 2),
                # None and 0 are different facts here: None means the source
                # gave no reconciliation figure at all, 0 means it gave zero.
                "ce": None if num(r[5]) is None else round(num(r[5]), 2),
            }
        )
    start, end = find_range(book)
    return {
        "start": start,
        "end": end,
        "rows": rows,
        "unattributed": find_unattributed(book),
        "source": os.path.basename(path),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--july", required=True)
    ap.add_argument("--august", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    out = {"july": read(args.july), "august": read(args.august)}

    # July's workbook states no range in a parseable form; its own title says
    # "full July", which is where these dates come from and why they are here
    # rather than in the JS.
    if not out["july"]["start"]:
        out["july"].update(start="01/07/2026", end="31/07/2026", dated="from the sheet title")

    with open(args.out, "w") as f:
        json.dump(out, f, indent=1, ensure_ascii=False)

    for k, p in out.items():
        est = sum(r["est"] for r in p["rows"])
        inv = sum(r["invocations"] for r in p["rows"])
        print(
            f"{k:8} {p['start']} to {p['end']}  {len(p['rows']):3} rows  "
            f"${est:,.2f}  {inv:,} calls  {len(p['unattributed'])} unattributed"
        )


if __name__ == "__main__":
    sys.exit(main())
