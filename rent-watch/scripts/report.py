#!/usr/bin/env python3
"""Turn the observation log into a dated market report.

Usage:
    python3 scripts/report.py                # report for the latest date in the log
    python3 scripts/report.py --date 2026-10-30
    python3 scripts/report.py --all          # trend across every date in the log
"""
import argparse
import csv
import json
import os
import statistics as st
from collections import defaultdict

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(HERE, "data", "observations.csv")
CONFIG_PATH = os.path.join(HERE, "config.json")


def load():
    with open(CONFIG_PATH, encoding="utf-8") as fh:
        config = json.load(fh)
    with open(CSV_PATH, encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    for row in rows:
        row["price_ils"] = int(row["price_ils"]) if row["price_ils"] else None
        row["sqm"] = int(row["sqm"]) if row["sqm"] else None
    return config, rows


def countable(rows, config):
    """Rows that may enter the statistics."""
    excluded = set(config["stats"]["exclude_status"])
    lo = config["search"]["criteria"]["price_sanity_min_ils"]
    hi = config["search"]["criteria"]["price_sanity_max_ils"]
    return [
        r for r in rows
        if r["status"] not in excluded
        and r["price_ils"] is not None
        and lo <= r["price_ils"] <= hi
    ]


def summarize(rows):
    prices = sorted(r["price_ils"] for r in rows)
    if not prices:
        return None
    per_sqm = [r["price_ils"] / r["sqm"] for r in rows if r["sqm"]]
    return {
        "n": len(prices),
        "min": prices[0],
        "max": prices[-1],
        "median": int(st.median(prices)),
        "mean": int(st.fmean(prices)),
        "per_sqm": round(st.fmean(per_sqm), 1) if per_sqm else None,
    }


def fmt(n):
    return f"₪{n:,}"


def block(title, summary, baseline):
    if not summary:
        return [f"### {title}", "", "No countable listings.", ""]
    gap = summary["median"] - baseline
    pct = gap / baseline * 100
    out = [
        f"### {title}",
        "",
        f"| Listings | Low | Median | Mean | High | ₪/sqm |",
        f"|---:|---:|---:|---:|---:|---:|",
        f"| {summary['n']} | {fmt(summary['min'])} | **{fmt(summary['median'])}** | "
        f"{fmt(summary['mean'])} | {fmt(summary['max'])} | "
        f"{summary['per_sqm'] if summary['per_sqm'] else '—'} |",
        "",
        f"Median vs your {fmt(baseline)}: **{fmt(gap) if gap >= 0 else '-' + fmt(abs(gap))} "
        f"({pct:+.1f}%)**",
        "",
    ]
    return out


def render(date, rows, config):
    baseline = config["subject_property"]["current_rent_ils"]
    day = [r for r in rows if r["date_observed"] == date]
    ok = countable(day, config)
    core = [r for r in ok if r["zone"] == "core"]
    ring = [r for r in ok if r["zone"] == "ring"]

    lines = [
        f"# Rehovot HaMada — 5-room rental watch",
        "",
        f"**Report date:** {date}  ",
        f"**Your current rent:** {fmt(baseline)}  ",
        f"**Renewal:** {config['subject_property']['renewal_month']}",
        "",
        "---",
        "",
    ]
    lines += block("Core — Rehovot HaMada / Efraim Katzir", summarize(core), baseline)
    lines += block("Ring — adjacent neighborhoods", summarize(ring), baseline)

    lines += ["---", "", "## Listings seen today", "",
              "| Zone | Street | # | Rooms | sqm | Floor | Price | Parking | Storage | Status | Conf. |",
              "|---|---|---|---:|---:|---:|---:|---|---|---|---|"]
    for r in sorted(day, key=lambda x: (x["zone"] != "core", -(x["price_ils"] or 0))):
        lines.append(
            f"| {r['zone']} | {r['street'] or r['neighborhood']} | {r['house_no'] or '—'} | "
            f"{r['rooms']} | {r['sqm'] or '—'} | {r['floor'] or '—'} | "
            f"{fmt(r['price_ils']) if r['price_ils'] else '—'} | {r['parking']} | "
            f"{r['storage']} | {r['status']} | {r['confidence']} |"
        )
    lines.append("")

    excluded = [r for r in day if r not in ok]
    if excluded:
        lines += ["> **Held out of the statistics:** " + "; ".join(
            f"{r['street'] or r['neighborhood']} {r['house_no']} at "
            f"{fmt(r['price_ils']) if r['price_ils'] else '—'} ({r['status']} — {r['notes']})"
            for r in excluded), ""]
    return "\n".join(lines)


def render_trend(rows, config):
    baseline = config["subject_property"]["current_rent_ils"]
    by_date = defaultdict(list)
    for r in countable(rows, config):
        if r["zone"] == "core":
            by_date[r["date_observed"]].append(r)

    lines = ["# Core median over time", "",
             "| Date | Listings | Median | vs your rent |", "|---|---:|---:|---:|"]
    for date in sorted(by_date):
        s = summarize(by_date[date])
        gap = s["median"] - baseline
        lines.append(f"| {date} | {s['n']} | {fmt(s['median'])} | {gap:+,} |")
    return "\n".join(lines) + "\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--write", action="store_true",
                    help="write to reports/<date>.md instead of stdout")
    args = ap.parse_args()

    config, rows = load()
    if args.all:
        print(render_trend(rows, config))
        return

    date = args.date or max(r["date_observed"] for r in rows)
    out = render(date, rows, config)
    if args.write:
        path = os.path.join(HERE, "reports", f"{date}.md")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(out + "\n")
        print(f"wrote {path}")
    else:
        print(out)


if __name__ == "__main__":
    main()
