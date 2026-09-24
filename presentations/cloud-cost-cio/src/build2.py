from pptx import Presentation
from pptx.chart.data import CategoryChartData
exec(open('build_august.py').read().split('surgery(SRC, DST, KEEP)')[0].replace('from pptx import Presentation','').replace('from pptx.chart.data import CategoryChartData',''))

DST = "deck/Harel_Cloud_Cost_CIO_August.pptx"
p = Presentation(DST); S = p.slides

# ------------------------------------------------- 5 AI across the clouds
s = S[4]
T(s, 3, "AI is $95K a month, and AWS is now half of it")
T(s, 4, "Billed AI, August 2026. Excludes the Databricks drawdown, which bills at $0.")
def tile(base, title, value, share, l1, v1, l2, v2, delta, note):
    T(s, base,     title);  T(s, base+1, value); T(s, base+2, share)
    T(s, base+4,   l1);     T(s, base+5, v1)
    T(s, base+6,   l2);     T(s, base+7, v2)
    T(s, base+9,   delta);  T(s, base+10, note)
tile(13, "AZURE AI FOUNDRY", "$16,409", "17.3% of billed AI", "JUL", "$19,613", "AUG", "$16,409",
     "−16% Jul to Aug", "Foundry models and tools. The only AI line that fell.")
tile(26, "GITHUB COPILOT", "$24,028", "25.3% of billed AI", "JUL", "$19,260", "AUG", "$24,028",
     "+25% Jul to Aug", "Developer seats plus AI credit overage. Billed in full.")
tile(39, "AWS BEDROCK", "$44,739", "47.1% of billed AI", "JUL", "$25,288", "AUG", "$44,739",
     "+77% Jul to Aug", "Claude models via Claude Code. August is the first month at full price.")
tile(52, "COWORK", "$9,906", "10.4% of billed AI", "JUL", "$8,920", "AUG", "$9,906",
     "+11% Jul to Aug", "Pay-as-you-go agent credits, billed through Power Platform.")
tile(65, "GOOGLE VERTEX AI", "pending", "August statement not in", "JUN", "$958", "JUL", "$2,359",
     "July figure shown", "Gemini prediction tokens on the shared GCP projects.")
T(s, 5, "One provider now carries half of all AI spend, and it is the one with no project tag and no per-team budget.")

# ------------------------------------------------------------ 6 model mix
s = S[5]
T(s, 3, "The policy is moving the mix, not yet the cost")
T(s, 4, "Claude models consumed through Bedrock, billed as Marketplace lines.")
ch = chart_of(s)
cd = CategoryChartData()
cd.categories = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
for name, vals in [
    ('Claude Opus 4.8',        (0, 0, 76.7, 2024.1, 11361.9, 15633.6)),
    ('Claude Sonnet 4.6',      (0, 0, 14.5, 540.4, 688.3, 9468.0)),
    ('Claude Opus 5',          (0, 0, 0, 0, 691.5, 9015.3)),
    ('Claude Opus 4.6',        (0, 0, 2866.7, 4806.5, 9873.2, 8730.0)),
    ('Claude Opus 4.7',        (0, 0, 786.8, 2917.8, 2438.5, 805.6)),
    ('Claude Sonnet 5',        (0, 0, 0, 0, 0, 877.6)),
    ('Claude Haiku 4.5',       (0, 0, 57.1, 159.3, 157.4, 154.2)),
    ('Claude Sonnet 4.5',      (0, 0, 9.6, 58.6, 77.4, 54.8)),
    ('Amazon Bedrock Edition', (841.0, 1609.0, 0, 0, 0, 0)),
]:
    cd.add_series(name, vals)
ch.replace_data(cd)
T(s, 9,  "TOTAL, AUGUST");  T(s, 10, "$44,739"); T(s, 11, "+77% on July")
T(s, 13, "OPUS SHARE");     T(s, 14, "76.4%");   T(s, 15, "was 96.3% in July")
T(s, 5, "Sonnet went from 3.0% to 23.2% of model spend in a month, which is what the policy asks for. But Opus still grew from $24,365 to $34,184 in absolute terms: the shift is additive, not substitutive. The policy is changing what gets added, not what gets replaced.")

# ---------------------------------------------------------- 7 marketplace
s = S[6]
T(s, 3, "Marketplace is no longer “not consumption”")
T(s, 4, "August contained no one-off purchase at all. Every dollar of it is recurring.")
T(s, 6, "AWS Marketplace by product, August")
ch = chart_of(s)
cd = CategoryChartData()
cd.categories = ['One-off purchases', 'F5 Rules for AWS WAF', 'Neo4j Aura',
                 'MongoDB Atlas', 'Claude models via Bedrock']
cd.add_series('August', (0.0, 91.7, 133.9, 14512.7, 44739.0))
ch.replace_data(cd)
T(s, 9,  "AWS MARKETPLACE, AUGUST"); T(s, 10, "$59,477"); T(s, 11, "no one-off purchases")
T(s, 13, "OF THAT, AI");             T(s, 14, "75.2%");   T(s, 15, "was 5.5% in July")
T(s, 17, "RECURRING TOOLING");       T(s, 18, "$14,738"); T(s, 19, "MongoDB Atlas, F5, Neo4j")
T(s, 5, "The line was built to hold lumpy security purchases, and the deck has always said it is not consumption. In August three quarters of it is Claude running through Bedrock, which is consumption in every sense except the line it bills on. Reported as one number it hides the fastest-growing item in the estate.")

# --------------------------------------------------------- 8 cost centres
s = S[7]
T(s, 3, "Where August landed, by cost centre")
T(s, 4, "From the CostCenter tag. Charges exclude Marketplace purchases.")
ch = chart_of(s)
cd = CategoryChartData()
cd.categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
for name, vals in [
    ('datacloud',    (47462, 49198, 54536, 50235, 43925, 44390, 49118, 50888)),
    ('sap',          (42266, 39098, 41546, 40825, 46601, 42665, 40925, 41324)),
    ('cloudit',      (30915, 24681, 40730, 29196, 28615, 28585, 33421, 32087)),
    ('aifactory',    (854, 3478, 12632, 11676, 13656, 26476, 24531, 23115)),
    ('other',        (4371, 5240, 5614, 5760, 8681, 18094, 22410, 13993)),
    ('actuary',      (15102, 4959, 3549, 5341, 4672, 2733, 4058, 4472)),
    ('Risk Agility', (13063, 5274, 2617, 5768, 2842, 1031, 1032, 1032)),
    ('itsec',        (2082, 1734, 1908, 1898, 2047, 2059, 2221, 2304)),
    ('All other',    (875, 2080, 2067, 1879, 1224, 1373, 9201, 11025)),
]:
    cd.add_series(name, vals)
ch.replace_data(cd)
T(s, 8,  "TOTAL, AUGUST");     T(s, 9,  "$180,241"); T(s, 10, "−3.6% on July")
T(s, 12, "LARGEST CENTRE");    T(s, 13, "datacloud"); T(s, 14, "$50,888 · 28% of the total")
T(s, 15, "WHAT MOVED")
T(s, 17, "other fell $8.4K; cloudops rose $1.7K")
T(s, 19, "aifactory came down for the first time, −$1.4K")
T(s, 21, "datacloud and sap essentially flat")

# ------------------------------------------------------------- 9 decisions
s = S[8]
T(s, 5, "Open items")
tbl = table_of(s)
rows = [
 ["#", "Item", "Detail", "Status", "Owner"],
 ["1", "Model policy — make it bite",
  "Sonnet is up to 23% of model spend but Opus still grew $10K in the month. Set a per-team Opus budget rather than a default.",
  "Decision", "AI Factory & CloudOps"],
 ["2", "Marketplace reporting",
  "Split the line three ways: one-off purchases, recurring tooling, AI consumption. Reported as one number it hides the fastest-growing item.",
  "Decision", "FinOps"],
 ["3", "Two-layer tagging",
  "Unchanged and still blocking. AWS Bedrock carries no project tag at all, and it is now half of AI spend.",
  "In progress", "Ariel"],
 ["4", "The $193K recommendation list",
  "Still costed and waiting. Azure VMs fell $8,826 this month without it — the list is additional to that.",
  "Decision", "Infrastructure & CloudOps"],
 ["5", "Reconcile the two cost bases",
  "Raw export exceeds the reported figure by $11,169 on Virtual Machines, likely reservation amortisation. Settle before either is quoted.",
  "To scope", "FinOps"],
]
for r in range(min(len(rows), len(tbl.rows))):
    for c in range(min(len(rows[r]), len(tbl.columns))):
        cell(tbl, r, c, rows[r][c])
T(s, 8,  "DECISION NEEDED"); T(s, 9,  "3 items"); T(s, 10, "model policy, Marketplace split, the $193K list")
T(s, 12, "NEW THIS MONTH");  T(s, 13, "Model policy"); T(s, 14, "moving the mix, not yet the cost")

p.save(DST)
print("completed all 9 slides")
