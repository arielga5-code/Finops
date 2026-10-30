# Rent Watch — Rehovot HaMada, 5 rooms

A weekly price watch on 5-room rentals in **Rehovot HaMada** (רחובות המדע),
centred on **Prof. Efraim Katzir St**, with a ring of adjacent neighborhoods
tracked separately.

The point is not to find an apartment. It is to build a defensible number for a
rent review: an owned unit there is let at **₪7,300**, and the renewal is in
**August**.

## Where it stands today (2026-10-30)

| | Median asking rent | vs ₪7,300 |
|---|---:|---:|
| Core — Rehovot HaMada / Efraim Katzir (4 listings) | **₪8,650** | **+₪1,350 (+18.5%)** |
| Ring — adjacent neighborhoods (2 listings) | ₪8,000 | +₪700 (+9.6%) |

Range in the core set: ₪8,300 – ₪9,500, about ₪64/sqm.

City context, for the direction of travel: average Rehovot rent across all
sizes was ₪4,691 in January 2026 (CBS, +4.6% y/y) and ₪4,870 by May 2026
(+5.4%), and nationally 5–6 room apartments rose faster than the 3.6% overall
Q1 2026 rise. Large units are where the increases are concentrated.

**Treat the ₪8,650 as directional, not evidence.** See
[Confidence](#confidence) — it is built from search snippets, and none of the
four core comps has parking and storage confirmed yet.

## Layout

| Path | What it is |
|---|---|
| `config.json` | The search spec: neighborhood and street list, criteria, the ₪7,300 baseline |
| `data/observations.csv` | Append-only log. One row per listing per week observed |
| `scripts/report.py` | Turns the log into a dated report, or a trend across dates |
| `reports/` | Generated reports, one file per date |
| `SOURCES.md` | Verified live search URLs, and why this uses search instead of a scraper |

## Cadence

Runs automatically **every Sunday at 08:43 Israel time**, as a scheduled task
that searches, appends to the log, regenerates the report, commits, and sends a
short summary. Weekly is the right interval here: listings on one street do not
turn over daily, and the renewal is months out, so a weekly point still gives
tens of observations before August without re-reading the same snippets.

## Running it

```bash
python3 scripts/report.py
```

```bash
python3 scripts/report.py --write
```

```bash
python3 scripts/report.py --all
```

`--write` saves to `reports/<date>.md`; `--all` prints the core median over
every date in the log, which is the number that matters as August approaches.

## The data model

Each row in `data/observations.csv`:

- **`zone`** — `core` (Rehovot HaMada) or `ring` (adjacent). The two are never
  mixed into one median; a ring comp is weaker evidence for the rent review.
- **`status`** — `active`, or `stale`/`excluded` to keep a row in the record but
  out of the statistics. Undated aggregator pages land here.
- **`confidence`** — `high` (read off the listing page, amenities confirmed),
  `medium` (listing page, amenities unknown), `low` (search snippet only).
- **`parking`, `storage`** — `yes`/`no`/`unknown`. `unknown` is the honest
  default; amenities are usually in free text, not structured fields.

Prices outside the ₪6,000–₪14,000 sanity band in `config.json` are dropped from
the statistics automatically, which catches both scrape errors and listings
that are not really comparable.

## Confidence

Today's figures are **low-to-medium confidence** and should not be quoted at a
tenant yet:

1. Prices come from search snippets, not listing pages. Two of the four core
   comps (Katzir 15 and 17) are snippet-only.
2. None of the core comps has **parking and storage confirmed**. Both add real
   money in this neighborhood, so the true like-for-like median may sit above
   ₪8,650.
3. Snippets carry no posting date, so some listings may already be let. A
   ₪6,600 comp at Katzir 24 was held out for exactly this reason — it sits far
   below every other comp and its page is undated.
4. Four listings is a thin sample. The value of running this weekly is turning
   four into forty, and asking prices into a distribution.

What raises confidence fastest is allowing the rental domains through the
network policy so listing pages can be read directly — see
[SOURCES.md](SOURCES.md#upgrading-to-direct-scraping).

## Working the renewal

Asking rents are not achieved rents, and a sitting tenant who pays on time has
value that a vacancy month erases. On the numbers so far, the gap to market is
roughly ₪1,350/month — but a 18.5% increase in one step is the kind of move
that makes a good tenant leave. Closing part of the gap, with the comps to
justify it, is usually the better trade. By August this log should contain
months of data rather than one week's snapshot, which is the whole point of
running it on a schedule.
