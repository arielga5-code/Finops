# Presentations

Management-facing material derived from the practice this repo implements.

| Deck | Audience | Notes |
|---|---|---|
| [`finops-gaining-visibility.pptx`](finops-gaining-visibility.pptx) | Mixed executive leadership | [`speaker-notes.md`](speaker-notes.md) |
| [`finops-gaining-visibility-cfo.pptx`](finops-gaining-visibility-cfo.pptx) | CFO / finance leadership | [`speaker-notes-cfo.md`](speaker-notes-cfo.md) |

**The two decks have identical slides.** Only the speaker notes differ — same
15 slides, same visuals, argued for a different room. Present either one; pick
the file whose notes match the audience.

[`finops-gaining-visibility.pdf`](finops-gaining-visibility.pdf) is a rendered
copy for quick review without PowerPoint. It carries no speaker notes and is
regenerated from the deck, so never edit it directly.

## FinOps: Gaining Visibility

The case for the **Inform** phase — why cost allocation, granular reporting, unit
economics and fresh data have to come before any optimization programme, what
blocks visibility in practice, and how to unblock each one.

Structure:

| Slides | Content |
|---|---|
| 1–3 | The cost problem, and what FinOps is |
| 4–5 | Why visibility comes first; what "good visibility" looks like |
| 6 | The five blockers — tagging, shared resources, commitments, multi-cloud, SaaS |
| 7–10 | One solution slide per blocker |
| 11–13 | Showback vs chargeback, 2025 best practices, the recommended starting sequence |
| 14–15 | Takeaways and discussion |

Two slides have deliberate blanks to fill in before presenting: the date on
slide 1 and the contacts on slide 15.

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
change that needs a date. It also front-loads the ask: sponsorship of the
allocation standard, and a decision on when showback becomes chargeback.

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
