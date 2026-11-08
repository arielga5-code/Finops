# Rent Watch — Rehovot HaMada, 5 rooms

A weekly price watch on 5-room rentals in **Rehovot HaMada** (רחובות המדע),
centred on **Prof. Efraim Katzir St**, with a ring of adjacent neighborhoods
tracked separately.

The point is not to find an apartment. It is to build a defensible number for a
rent review: an owned unit there is let at **₪7,300**, and the renewal is in
**August**.

## Where it stands today (2026-11-08)

| | Median asking rent | vs ₪7,300 |
|---|---:|---:|
| Core — Rehovot HaMada, live listings (3) | **₪9,500** | **+₪2,200 (+30.1%)** |
| Ring — adjacent neighborhoods (4) | ₪7,625 | +₪325 (+4.5%) |

**Week 3 changed the picture, because the data source changed.** Until now every
price came from search snippets. The rental domains were allowed through the
network policy on 2026-11-08, so the Realta neighbourhood page — a daily
aggregate of Yad2, Madlan, OnMap, Homeless, Komo and Facebook — was read
directly, rendered, with per-listing update dates.

The live 5-room listings in Rehovot HaMada are ₪8,500 (124sqm, floor 1/17,
updated 28 Sept), ₪9,500 (floor 2/12, updated 20 days ago) and ₪12,000 (161sqm,
floor 8/9, updated 13 days ago). Realta puts the neighbourhood average across
all sizes at **₪9,900** — not the ₪7,650 that search snippets reported in weeks
1 and 3, which was stale.

**None of the Katzir 15 / 17 / 24 / 26 listings appear in the live aggregate.**
Those were the source of the earlier ₪8,300–₪8,600 cluster and of the ₪6,500
low outlier. They are now recorded as superseded: stale cached aggregator
content, not the live market. The snippet-based medians were therefore
systematically **low**.

On ₪/sqm the live comps run 68.5–74.5. A 130sqm unit at that rate implies
roughly **₪8,900–₪9,700**.

City context: renewing tenants' rents rose about 2.6% year on year while new
tenants paid about 6% more (CBS); the January 2026 CPI put annual rent growth
at 3.2% with rental supply down 8%. Renewals move far more slowly than asking
rents.

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
