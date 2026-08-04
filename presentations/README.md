# Presentations

Management-facing material derived from the practice this repo implements.

| Deck | Audience | Length |
|---|---|---|
| [`finops-gaining-visibility.pptx`](finops-gaining-visibility.pptx) | Executive leadership | 15 slides |

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

Every slide carries speaker notes. Two slides have deliberate blanks to fill in
before presenting: the date on slide 1 and the contacts on slide 15.

**Before presenting, add your own numbers.** Slides 2, 4 and 5 are written to
carry real figures — current monthly spend, the share of spend landing
unallocated, and growth rate against a business metric. The argument is far
stronger with the organization's actual allocation coverage on it.

The repo's own operating model doc — [`docs/07-finops-operating-model.md`](../docs/07-finops-operating-model.md)
— is the implementation counterpart to slides 7 and 11: minimum tag set,
enforcement via Azure Policy, allocation coverage as a KPI, and review cadence.

### Rebuilding

The deck is generated, so edits belong in [`build-deck.js`](build-deck.js)
rather than in PowerPoint — regenerate and the styling stays consistent.

```bash
npm install pptxgenjs react-icons react react-dom sharp
node build-deck.js finops-gaining-visibility.pptx
```

To export a PDF, open the deck in PowerPoint, Google Slides or Keynote and
export from there, or `soffice --headless --convert-to pdf finops-gaining-visibility.pptx`
where LibreOffice Impress is installed.

Applying a corporate template: replace the palette constants at the top of
`build-deck.js` (`DARK`, `AMBER`, `TEAL`, `TINT`) and the two font constants
(`HEAD`, `BODY`). Everything else derives from those.
