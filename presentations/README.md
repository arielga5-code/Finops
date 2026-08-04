# Presentations

Management-facing material derived from the practice this repo implements.

| Deck | Audience | Notes |
|---|---|---|
| [`finops-gaining-visibility.pptx`](finops-gaining-visibility.pptx) | Mixed executive leadership | [`speaker-notes.md`](speaker-notes.md) |
| [`finops-gaining-visibility-cfo.pptx`](finops-gaining-visibility-cfo.pptx) | CFO / finance leadership | [`speaker-notes-cfo.md`](speaker-notes-cfo.md) |

22 slides in two parts: **visibility** (what is being spent and by whom) and
**governance** (who owns it, what limits it, what stops it).

**The two decks have identical slides.** Only the speaker notes differ — same
22 slides, same visuals, argued for a different room. Present either one; pick
the file whose notes match the audience.

[`finops-gaining-visibility.pdf`](finops-gaining-visibility.pdf) is a rendered
copy for quick review without PowerPoint. It carries no speaker notes and is
regenerated from the deck, so never edit it directly.

## FinOps: Visibility & Governance

Part one makes the case for the **Inform** phase — why cost allocation, granular
reporting, unit economics and fresh data have to come before any optimization
programme, what blocks visibility in practice, and how to unblock each one.

Part two covers the **controls**, because a report is not a control: ownership,
budget thresholds, rate limits, alert routing, and who is accountable for what.

Structure:

| Slides | Content |
|---|---|
| 1–3 | The cost problem, and what FinOps is |
| 4–5 | Why visibility comes first; what "good visibility" looks like |
| 6 | The five blockers — tagging, shared resources, commitments, multi-cloud, SaaS |
| 7–10 | One solution slide per blocker |
| 11–12 | Showback vs chargeback; 2025 best practices |
| 13 | **Part two — Governance** divider |
| 14 | Application ownership — a named owner, and what they are accountable for |
| 15 | Budget controls — notify, review, gate; proportional burn vs flat thresholds |
| 16 | Rate limits & quotas — the only control fast enough to stop spend in progress |
| 17 | Automated alerts — three tiers, three destinations, and three ways to get it wrong |
| 18 | Shared responsibility — who decides, who builds, who pays |
| 19 | Avoiding bill shock — the same overrun found at four different moments |
| 20–22 | The starting sequence, takeaways, discussion |

The governance half is grounded in this repo's own implementation docs —
the alert tiering and latency figures on slides 16 and 17 come from
[`docs/05-alerting.md`](../docs/05-alerting.md) and
[`docs/00-architecture.md`](../docs/00-architecture.md#the-latency-problem).

Two slides have deliberate blanks to fill in before presenting: the date on
slide 1 and the contacts on slide 22. Slide 18's responsibility grid is drawn
with role names — fill in real names before the meeting where you want a
decision.

**Before presenting, add your own numbers.** Slides 2, 4 and 5 are written to
carry real figures — current monthly spend, the share of spend landing
unallocated, and growth rate against a business metric. The argument is far
stronger with the organization's actual allocation coverage on it.

### The two note sets

The **default cut** explains the practice: what each slide is for, what to say
that is not printed on it, and where to substitute real figures.

The **CFO cut** argues the same slides in finance terms — variance and whether it
can be explained, accrual and forecast quality, allocation as a coding
discipline, commitments as purchase obligations, and chargeback as an accounting
change that needs a date. Across part two it reads the governance slides as
delegation of authority, budget phasing and exception handling applied to a cost
line that has been running without them. It also front-loads the ask:
sponsorship of the allocation standard, and a decision on when showback becomes
chargeback.

The repo's own operating model doc — [`docs/07-finops-operating-model.md`](../docs/07-finops-operating-model.md)
— is the implementation counterpart to slides 7 and 11: minimum tag set,
enforcement via Azure Policy, allocation coverage as a KPI, and review cadence.

### Rebuilding

The decks are generated, so edits belong in [`build-deck.js`](build-deck.js)
(layout) or [`notes-exec.js`](notes-exec.js) / [`notes-cfo.js`](notes-cfo.js)
(speaker notes) rather than in PowerPoint.

```bash
npm install pptxgenjs react-icons react react-dom sharp

node build-deck.js finops-gaining-visibility.pptx exec
node build-deck.js finops-gaining-visibility-cfo.pptx cfo

python export-notes.py finops-gaining-visibility-cfo.pptx speaker-notes-cfo.md
```

The second argument selects the note set and nothing else; adding a third
audience means adding a `notes-<name>.js` and one line in `build-deck.js`.

To export a PDF, open the deck in PowerPoint, Google Slides or Keynote and
export from there, or `soffice --headless --convert-to pdf <deck>.pptx` where
LibreOffice Impress is installed.

Applying a corporate template: replace the palette constants at the top of
`build-deck.js` (`DARK`, `AMBER`, `TEAL`, `TINT`) and the two font constants
(`HEAD`, `BODY`). Everything else derives from those.
