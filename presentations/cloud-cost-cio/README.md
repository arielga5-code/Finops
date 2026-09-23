# Cloud Cost CIO deck

`Harel_Cloud_Cost_CIO_v16.pptx` — 25 slides, 13.333" x 7.5", English.
Recovered from Google Drive (modified 13 Aug 2026); a second v16 dated 12 Aug exists
there and is the older file.

Covers **May–July 2026** across all three providers. The next revision rolls the
window to **June–August 2026**.

## Structure

| Slides | |
|---|---|
| 1–4 | Cover, run-rate, December projection, the AI growth engine |
| 5 | Appendix A divider |
| 6–7 | The estate month by month; AI platform mix across all providers |
| 8–13 | Azure: AI by project, subscription and service, AI programme, AIFactory tag, Project tag, CostCenter tag |
| 14–18 | AWS: operational usage, invoice vs credits, marketplace, AI models, linked accounts |
| 19 | GCP |
| 20–25 | Appendix B: AI governance, gateway, ownership, lifecycle, Copilot model costs |

## Baseline (May–Jul 2026)

| Provider | May | Jun | Jul | Annualised on Jul | Basis |
|---|---|---|---|---|---|
| Microsoft Azure | $145,254 | $168,421 | $186,541 | $2,238,496 | invoice, less prepayment |
| AWS | $83,063 | $86,581 | $92,930 | $1,115,159 | usage, no marketplace |
| Google Cloud | $1,592 | $2,411 | $3,850 | $46,204 | statement total |
| **All providers** | **$229,908** | **$257,413** | **$283,322** | **$3,399,859** | recurring cash |

AI was $1,100,724 annualised — 32.4% of the bill — growing 72% over the period
against 23% for the bill as a whole.

Two figures on slide 2/6 are deliberately *not* the raw invoice: the Commvault annual
prepayment is excluded from Azure so the trend reads as run-rate, and AWS marketplace
purchases are excluded from the headline and reported separately on slide 16, because
they swing between $25K and $350K a month and would otherwise drown the usage trend.

## Inputs to refresh a month

| Slides | Source |
|---|---|
| 6, 9–13 | Azure EA usage detail, `Detail_Enrollment_51378402_<YYYYMM>_en.csv` — gives subscription, service group, AI meter, Project tag and CostCenter tag cuts |
| 14–18 | AWS consolidated statements: service usage, marketplace lines, credits by account |
| 19 | GCP statement by service |
| 2–4, 7 | Derived from the three above |

`tools/azure-spend-dashboard.html` in this repo reads the Azure CSV and produces the
service / resource-group / subscription aggregates directly.

## Editing

Edit in place with python-pptx — `chart.replace_data()` and run-level text assignment
both preserve the deck's formatting (verified: font size, weight and colour survive a
cell rewrite, and the file reopens with all 25 slides). Do **not** rebuild it from
scratch; the design is hand-built and is not reproducible from a generator here.

LibreOffice cannot render in this environment (it fails on a plain `.txt`), so there is
no PDF or image preview available from the container. Verify a revision by reading the
chart XML and table text back out, and have the numbers checked in PowerPoint.
