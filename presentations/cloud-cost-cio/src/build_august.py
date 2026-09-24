from pptx import Presentation
from pptx.chart.data import CategoryChartData
import copy, sys

SRC = "deck/Harel_Cloud_Cost_CIO_Final.pptx"
DST = "deck/Harel_Cloud_Cost_CIO_August.pptx"
KEEP = [1, 10, 3, 2, 5, 9, 12, 32, 28]     # source slide numbers, in new order

def surgery(src, dst, keep):
    p = Presentation(src)
    lst = p.slides._sldIdLst
    ids = list(lst)
    keep0 = [k - 1 for k in keep]
    for i, sid in enumerate(ids):
        if i not in keep0:
            p.part.drop_rel(sid.rId)
            lst.remove(sid)
    remaining = {i: sid for i, sid in enumerate(ids) if i in keep0}
    for sid in list(lst):
        lst.remove(sid)
    for i in keep0:
        lst.append(remaining[i])
    p.save(dst)

def T(slide, idx, text):
    """Replace a shape's text, keeping the first run's formatting."""
    sh = slide.shapes[idx]
    tf = sh.text_frame
    para = tf.paragraphs[0]
    if not para.runs:
        para.add_run()
    para.runs[0].text = text
    for r in para.runs[1:]:
        r._r.getparent().remove(r._r)
    for extra in tf.paragraphs[1:]:
        extra._p.getparent().remove(extra._p)

def cell(tbl, r, c, text):
    para = tbl.cell(r, c).text_frame.paragraphs[0]
    if not para.runs:
        para.add_run()
    para.runs[0].text = text
    for x in para.runs[1:]:
        x._r.getparent().remove(x._r)

def chart_of(slide):
    for sh in slide.shapes:
        if getattr(sh, 'has_chart', False):
            return sh.chart
    return None

def table_of(slide):
    for sh in slide.shapes:
        if getattr(sh, 'has_table', False):
            return sh.table
    return None

surgery(SRC, DST, KEEP)
p = Presentation(DST)
S = p.slides

# ---------------------------------------------------------------- 1 cover
s = S[0]
T(s, 4, "August 2026 — what changed")
T(s, 5, "August 2026 consumption · CIO briefing")

# ------------------------------------------------------------ 2 scorecard
s = S[1]
T(s, 2, "AUGUST SCORECARD")
T(s, 3, "Four claims from July, tested")
T(s, 4, "Like-for-like with July throughout: excluding Marketplace, gross of credits.")
T(s, 7,  "AUGUST RUN-RATE");  T(s, 8,  "$3.49M"); T(s, 9,  "base case said $3.50M")
T(s, 11, "AZURE");            T(s, 12, "−3.6%"); T(s, 13, "$186,917 → $180,241")
T(s, 14, "")
T(s, 16, "AWS");              T(s, 17, "+15.3%"); T(s, 18, "$92,930 → $107,187")
T(s, 19, "")
T(s, 20, "What July said would happen, and what August shows")
tbl = table_of(s)
rows = [
 ["July said", "August", "Verdict", ""],
 ["December run-rate of $4.01M, base case", "August annualises to $3.49M against a base case of $3.50M", "Held", "the projection stands"],
 ["The MAP credit needs confirming", "It did not recur. August credits total $654 across all three statements", "Answered", "one-off, as suspected"],
 ["Sonnet by default, Opus by exception", "Opus fell from 96.3% to 76.4% of model spend", "Moving", "mix shifted, cost did not"],
 ["Untagged spend is getting worse", "Not tested — the tag cut is unavailable this month", "Open", "carried to September"],
]
for r in range(min(len(rows), len(tbl.rows))):
    for c in range(min(len(rows[r]), len(tbl.columns))):
        cell(tbl, r, c, rows[r][c])
T(s, 23, "PROJECTION"); T(s, 24, "Held");    T(s, 25, "August sits on the base case")
T(s, 27, "SAVINGS");    T(s, 28, "Visible"); T(s, 29, "Azure VMs down $8,826 in one month")
T(s, 31, "WATCH");      T(s, 32, "AWS AI");  T(s, 33, "Bedrock $25K → $45K in one month")
T(s, 5, "Azure and AWS are final. GCP is shown at its July figure until the August statement arrives; it is 1.3% of the bill and cannot change these conclusions.")

# ------------------------------------------------------------ 3 which path
s = S[2]
T(s, 2, "THE RISK CASE")
T(s, 3, "August lands on the base case")
T(s, 4, "The first of the two months that test it. September is the second.")
ch = chart_of(s)
cd = CategoryChartData()
cd.categories = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
cd.add_series('Base case',   (3.40, 3.50, 3.60, 3.80, 3.90, 4.01))
cd.add_series('Faster case', (3.40, 3.80, 4.20, 4.70, 5.20, 5.78))
cd.add_series('Actual',      (3.40, 3.49, None, None, None, None))
ch.replace_data(cd)
T(s, 8,  "AUGUST ACTUAL");          T(s, 9,  "$3.49M");  T(s, 10, "base case said $3.50M")
T(s, 12, "BASE CASE · DECEMBER");   T(s, 13, "$4.01M");  T(s, 14, "unchanged — August supports it")
T(s, 16, "FASTER CASE · DECEMBER"); T(s, 17, "$5.78M");  T(s, 18, "not the path we are on")
T(s, 5, "One month is not a trend. September decides whether this is the path or a pause — but the case for the faster scenario is weaker than it was in July.")

# ---------------------------------------------------- 4 where money moved
s = S[3]
T(s, 2, "WHERE WE ARE")
T(s, 3, "Azure fell, AWS rose, and the growth moved to AI")
T(s, 4, "AUGUST MONTHLY CONSUMPTION\n$291.1K")
T(s, 6, "$3.49M")
T(s, 7, "Annualized from August · not a forecast")
T(s, 8, "+$91K annual pace since July · +2.7%")
T(s, 11, "$180,241"); T(s, 12, "62% of August consumption")
T(s, 15, "$107,187"); T(s, 16, "37% of August consumption")
T(s, 19, "$3,707");   T(s, 20, "1.3% · July figure, August pending")
T(s, 21, "CHANGE FROM JULY TO AUGUST")
T(s, 23, "Azure  −$6.7K · Virtual Machines down $8,826")
T(s, 25, "AWS  +$14.3K · almost entirely Bedrock")
T(s, 27, "GCP  · August statement not yet received")
T(s, 5, "The estate barely grew. What changed is its composition: infrastructure came down and AI went up by more.")

p.save(DST)
print("built", DST)
