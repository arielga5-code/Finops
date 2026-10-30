# Where the numbers come from

## Verified live search URLs

These carry the Yad2 IDs confirmed from search results: Rehovot is **city 8400**
(not 8300), area 12, top area 41, and Rehovot HaMada is **neighborhood 1234**.

| What | URL |
|---|---|
| Rent — Rehovot HaMada, all property types | https://www.yad2.co.il/realestate/rent/center-and-sharon?area=12&city=8400&neighborhood=1234 |
| Rent — Rehovot HaMada, apartments only | https://www.yad2.co.il/realestate/rent/center-and-sharon?area=12&city=8400&neighborhood=1234&property=1 |
| Rent — Rehovot HaMada, 5–5.5 rooms | https://www.yad2.co.il/realestate/rent/center-and-sharon?area=12&city=8400&neighborhood=1234&minRooms=5&maxRooms=5.5 |
| Rent — Shikun Ephraim (ring), 4+ rooms | https://www.yad2.co.il/realestate/rent?topArea=41&area=12&city=8400&neighborhood=1207&minRooms=4 |
| Rent — all Rehovot, 4.5+ rooms | https://www.yad2.co.il/realestate/rent/center-and-sharon?minRooms=4.5&area=12&city=8400 |
| Madlan — 5-room rentals, Rehovot HaMada | https://www.madlan.co.il/for-rent/%D7%A9%D7%9B%D7%95%D7%A0%D7%94-%D7%A8%D7%97%D7%95%D7%91%D7%95%D7%AA-%D7%94%D7%9E%D7%93%D7%A2-%D7%A8%D7%97%D7%95%D7%91%D7%95%D7%AA-%D7%99%D7%A9%D7%A8%D7%90%D7%9C/5-bd |
| Madlan — Efraim Katzir street page | https://www.madlan.co.il/street-info/%D7%A4%D7%A8%D7%95%D7%A4-%D7%A7%D7%A6%D7%99%D7%A8-%D7%90%D7%A4%D7%A8%D7%99%D7%9D-%D7%A8%D7%97%D7%95%D7%91%D7%95%D7%AA-%D7%99%D7%A9%D7%A8%D7%90%D7%9C |
| Realta — 5-room rentals, Rehovot | https://realta.co.il/he/rekhovot/5-rooms/ |
| Homeless.co.il — Rehovot / Ness Ziona board | https://www.homeless.co.il/rent/ |

**Not yet verified:** the Yad2 query parameters for *parking* and *storage*
(machsan) filters. Set those two filters in the Yad2 UI and copy the resulting
URL back into this table — amenities are often only in the free-text
description, so the field filters alone under-report.

## Why the weekly job uses web search, not a scraper

This repo's cloud environment runs behind an allowlist egress proxy. Every
rental host is denied at the `CONNECT` stage:

```
connect_rejected  www.yad2.co.il:443    gateway answered 403 to CONNECT
connect_rejected  gw.yad2.co.il:443     gateway answered 403 to CONNECT
connect_rejected  www.madlan.co.il:443  gateway answered 403 to CONNECT
connect_rejected  www.homeless.co.il:443 gateway answered 403 to CONNECT
```

`curl`, Playwright and `WebFetch` all fail the same way — `WebFetch` returns
`getaddrinfo ENOTFOUND`. Only `WebSearch`, which runs server-side rather than
from the container, reaches these sites today. So the weekly job is built on
search, and every price it records is a **search-snippet price** carrying a
confidence flag, not a figure read off a listing page.

## Upgrading to direct scraping

To read listing pages directly — which is what makes parking/storage
verification and posting dates reliable — add these to the environment's
**Network access → Allowed domains** (cloud environment menu in the session
title bar, then Edit), keeping *Allow package managers* ticked:

```
www.yad2.co.il
gw.yad2.co.il
www.madlan.co.il
www.homeless.co.il
realta.co.il
```

Steps: https://code.claude.com/docs/en/cloud-environments#network-access

Once allowed, `gw.yad2.co.il/realestate-feed/rent/search` is Yad2's own JSON
feed and is a far better target than the HTML. Chromium and Playwright are
already installed in the image if the feed needs a real browser session.

## Known failure mode: push 403 on scheduled runs

Sessions fired by the scheduled task start with **no repository in their
authorized set** (they come up tagged `config:no-git-repo`). The clone over
public HTTPS succeeds, the searches run and the report regenerates — then
`git push` fails:

```
403: arielga5-code/Finops is not in this session's authorized
repository set, so the proxy will not inject a credential for it
```

The commit is left local and dies with the container. Two manual test runs hit
this; the first presented as a silent hang at the push step.

The task prompt now works around it by calling
`mcp__claude-code-remote__add_repo` (owner `arielga5-code`, repo `Finops`,
access `push`) as its first action, before cloning, and by pushing as soon as
the files change rather than at the end of the run. It also verifies the commit
reached origin with `git log --oneline origin/<branch> -1` and reports the SHA.

The cleaner fix, if it is available in the environment's settings, is to add
the repository to the scheduled task's own **sources**, so every fired session
starts with it authorized and no workaround is needed.
