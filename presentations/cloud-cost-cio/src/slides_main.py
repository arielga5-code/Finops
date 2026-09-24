# ---------------------------------------------------------------- 1 cover
s = S[0]
T(s, 4, "August 2026 — what changed")
T(s, 5, "August 2026 consumption · CIO briefing")

# ------------------------------------------------------------ 2 scorecard
s = S[1]
T(s, 2, "AUGUST SCORECARD"); T(s, 3, "Four claims from July, tested")
T(s, 4, "Like-for-like with July throughout: excluding Marketplace, gross of credits.")
T(s, 7,  "AUGUST RUN-RATE"); T(s, 8,  "$3.48M"); T(s, 9,  "base case said $3.50M")
T(s, 11, "AZURE"); T(s, 12, "−3.6%"); T(s, 13, "$186,917 → $180,241")
T(s, 14, "")
T(s, 16, "AWS"); T(s, 17, "+15.3%"); T(s, 18, "$92,930 → $107,187")
T(s, 19, "")
T(s, 20, "What July said would happen, and what August shows")
tbl = table_of(s)
rows = [
 ["July said","August","Verdict","",""],
 ["December run-rate of $4.01M, base case","August annualises to $3.48M against a base case of $3.50M","Held","the projection stands",""],
 ["The MAP credit needs confirming","It did not recur — August credits total $654 across all three statements","Answered","one-off, as suspected",""],
 ["Sonnet by default, Opus by exception","Opus fell from 96.3% to 76.4% of model spend","Moving","mix shifted, cost did not",""],
 ["Untagged spend is getting worse","Not tested — the tag cut was unavailable this month","Open","carried to September",""],
]
for r in range(min(len(rows), len(tbl.rows))):
    for c in range(len(tbl.columns)):
        cell(tbl, r, c, rows[r][c] if c < len(rows[r]) else "")
T(s, 23, "PROJECTION"); T(s, 24, "Held");    T(s, 25, "August sits on the base case")
T(s, 27, "SAVINGS");    T(s, 28, "Visible"); T(s, 29, "Azure VMs down $8,826 in one month")
T(s, 31, "WATCH");      T(s, 32, "AWS AI");  T(s, 33, "Bedrock $25K → $45K in one month")
T(s, 5, "All three providers are final for August. Figures exclude Marketplace and are gross of credits, matching how July was reported.")

# ------------------------------------------------------------ 3 which path
s = S[2]
T(s, 3, "August lands on the base case")
T(s, 4, "The first of the two months that test it. September is the second.")
setchart(charts(s)[0], ['Jul','Aug','Sep','Oct','Nov','Dec'], [
 ('Base case',   (3.40, 3.50, 3.60, 3.80, 3.90, 4.01)),
 ('Faster case', (3.40, 3.80, 4.20, 4.70, 5.20, 5.78)),
 ('Actual',      (3.40, 3.48, None, None, None, None))])
T(s, 8,  "AUGUST ACTUAL"); T(s, 9,  "$3.48M"); T(s, 10, "base case said $3.50M")
T(s, 12, "BASE CASE · DECEMBER"); T(s, 13, "$4.01M"); T(s, 14, "unchanged — August supports it")
T(s, 16, "FASTER CASE · DECEMBER"); T(s, 17, "$5.78M"); T(s, 18, "not the path we are on")
T(s, 5, "One month is not a trend, and September decides whether this is the path or a pause. But the case for the faster scenario is weaker than it was in July.")

# ---------------------------------------------------- 4 where money moved
s = S[3]
T(s, 3, "Azure fell, AWS rose, and the growth moved to AI")
T(s, 4, "AUGUST MONTHLY CONSUMPTION\n$290.3K")
T(s, 6, "$3.48M"); T(s, 7, "Annualized from August · not a forecast")
T(s, 8, "+$81K annual pace since July · +2.4%")
T(s, 11, "$180,241"); T(s, 12, "62% of August consumption")
T(s, 15, "$107,187"); T(s, 16, "37% of August consumption")
T(s, 19, "$2,835");   T(s, 20, "1.0% of August consumption")
T(s, 21, "CHANGE FROM JULY TO AUGUST")
T(s, 23, "Azure  −$6.7K · Virtual Machines down $8,826")
T(s, 25, "AWS  +$14.3K · almost entirely Bedrock")
T(s, 27, "GCP  −$0.9K · Vertex AI fell 36%")
T(s, 5, "The estate barely grew. What changed is its composition: infrastructure came down and AI went up by more.")

# ------------------------------------------------- 5 AI across the clouds
s = S[4]
T(s, 3, "AI is $97K a month, and AWS is now half of it")
T(s, 4, "Billed AI, August 2026. Excludes the Databricks drawdown, which bills at $0.")
def tile(b, title, val, share, l1, v1, l2, v2, delta, note):
    T(s, b, title); T(s, b+1, val); T(s, b+2, share)
    T(s, b+4, l1);  T(s, b+5, v1); T(s, b+6, l2); T(s, b+7, v2)
    T(s, b+9, delta); T(s, b+10, note)
tile(13, "AZURE AI FOUNDRY", "$16,409", "16.9% of billed AI", "JUL", "$19,613", "AUG", "$16,409",
     "−16% Jul to Aug", "Foundry models and tools. The only Azure AI line that fell.")
tile(26, "GITHUB COPILOT", "$24,028", "24.7% of billed AI", "JUL", "$19,260", "AUG", "$24,028",
     "+25% Jul to Aug", "Developer seats plus AI credit overage. Billed in full.")
tile(39, "AWS BEDROCK", "$44,739", "46.1% of billed AI", "JUL", "$25,288", "AUG", "$44,739",
     "+77% Jul to Aug", "Claude models via Claude Code. First month at full price.")
tile(52, "COWORK", "$9,906", "10.2% of billed AI", "JUL", "$8,920", "AUG", "$9,906",
     "+11% Jul to Aug", "Pay-as-you-go agent credits, billed through Power Platform.")
tile(65, "GOOGLE VERTEX AI", "$1,522", "1.6% of billed AI", "JUL", "$2,359", "AUG", "$1,522",
     "−36% Jul to Aug", "Gemini prediction tokens. The only AI line that fell outright.")
T(s, 5, "One provider now carries nearly half of all AI spend, and it is the one with no project tag and no per-team budget.")

# ------------------------------------------------------------ 6 model mix
s = S[5]
T(s, 3, "The policy is moving the mix, not yet the cost")
T(s, 4, "Claude models consumed through Bedrock, billed as Marketplace lines.")
setchart(charts(s)[0], ['Mar','Apr','May','Jun','Jul','Aug'], [
 ('Claude Opus 4.8',(0,0,76.7,2024.1,11361.9,15633.6)),
 ('Claude Sonnet 4.6',(0,0,14.5,540.4,688.3,9468.0)),
 ('Claude Opus 5',(0,0,0,0,691.5,9015.3)),
 ('Claude Opus 4.6',(0,0,2866.7,4806.5,9873.2,8730.0)),
 ('Claude Opus 4.7',(0,0,786.8,2917.8,2438.5,805.6)),
 ('Claude Sonnet 5',(0,0,0,0,0,877.6)),
 ('Claude Haiku 4.5',(0,0,57.1,159.3,157.4,154.2)),
 ('Claude Sonnet 4.5',(0,0,9.6,58.6,77.4,54.8)),
 ('Amazon Bedrock Edition',(841.0,1609.0,0,0,0,0))])
T(s, 9,  "TOTAL, AUGUST"); T(s, 10, "$44,739"); T(s, 11, "+77% on July")
T(s, 13, "OPUS SHARE");    T(s, 14, "76.4%");   T(s, 15, "was 96.3% in July")
T(s, 5, "Sonnet went from 3.0% to 23.2% of model spend in a month, which is what the policy asks for. But Opus still grew from $24,365 to $34,184 in absolute terms: the shift is additive, not substitutive. The policy is changing what gets added, not what gets replaced.")

# ---------------------------------------------------------- 7 marketplace
s = S[6]
T(s, 3, "Marketplace is no longer “not consumption”")
T(s, 4, "August contained no one-off purchase at all. Every dollar of it is recurring.")
T(s, 6, "AWS Marketplace by product, August")
setchart(charts(s)[0], ['One-off purchases','F5 Rules for AWS WAF','Neo4j Aura','MongoDB Atlas','Claude models via Bedrock'],
         [('August', (0.0, 91.7, 133.9, 14512.7, 44739.0))])
T(s, 9,  "AWS MARKETPLACE, AUGUST"); T(s, 10, "$59,477"); T(s, 11, "no one-off purchases")
T(s, 13, "OF THAT, AI");             T(s, 14, "75.2%");   T(s, 15, "was 5.5% in July")
T(s, 17, "RECURRING TOOLING");       T(s, 18, "$14,738"); T(s, 19, "MongoDB Atlas, F5, Neo4j")
T(s, 5, "The line was built to hold lumpy security purchases, and the deck has always said it is not consumption. In August three quarters of it is Claude running through Bedrock, which is consumption in every sense except the line it bills on. Reported as one number it hides the fastest-growing item in the estate.")

# --------------------------------------------------------- 8 cost centres
s = S[7]
T(s, 3, "Where August landed, by cost centre")
setchart(charts(s)[0], M8, [
 ('datacloud',(47462,49198,54536,50235,43925,44390,49118,50888)),
 ('sap',(42266,39098,41546,40825,46601,42665,40925,41324)),
 ('cloudit',(30915,24681,40730,29196,28615,28585,33421,32087)),
 ('aifactory',(854,3478,12632,11676,13656,26476,24531,23115)),
 ('other',(4371,5240,5614,5760,8681,18094,22410,13993)),
 ('actuary',(15102,4959,3549,5341,4672,2733,4058,4472)),
 ('Risk Agility',(13063,5274,2617,5768,2842,1031,1032,1032)),
 ('itsec',(2082,1734,1908,1898,2047,2059,2221,2304)),
 ('All other',(875,2080,2067,1879,1224,1373,9201,11025))])
T(s, 8,  "TOTAL, AUGUST");  T(s, 9,  "$180,241"); T(s, 10, "−3.6% on July")
T(s, 12, "LARGEST CENTRE"); T(s, 13, "datacloud"); T(s, 14, "$50,888 · 28% of the total")
T(s, 15, "WHAT MOVED")
T(s, 17, "other fell $8.4K; cloudops rose $1.7K")
T(s, 19, "aifactory came down for the first time, −$1.4K")
T(s, 21, "datacloud and sap essentially flat")

# ------------------------------------------------------------ 9 decisions
s = S[8]
T(s, 5, "Open items")
tbl = table_of(s)
rows = [
 ["#","Item","Detail","Status","Owner"],
 ["1","Model policy — make it bite","Sonnet reached 23% of model spend but Opus still grew $10K in the month. Set a per-team Opus budget rather than a default.","Decision","AI Factory & CloudOps"],
 ["2","Marketplace reporting","Split the line three ways: one-off purchases, recurring tooling, AI consumption. As one number it hides the fastest-growing item.","Decision","FinOps"],
 ["3","Two-layer tagging","Unchanged and still blocking. AWS Bedrock carries no project tag at all, and it is now half of AI spend.","In progress","Ariel"],
 ["4","The $193K recommendation list","Still costed and waiting. Azure VMs fell $8,826 this month without it — the list is additional to that.","Decision","Infrastructure & CloudOps"],
 ["5","Reconcile the two cost bases","The raw export exceeds the reported figure by $11,169 on Virtual Machines, likely reservation amortisation. Settle before either is quoted.","To scope","FinOps"],
]
for r in range(min(len(rows), len(tbl.rows))):
    for c in range(min(len(rows[r]), len(tbl.columns))): cell(tbl, r, c, rows[r][c])
T(s, 8,  "DECISION NEEDED"); T(s, 9,  "3 items"); T(s, 10, "model policy, Marketplace split, the $193K list")
T(s, 12, "NEW THIS MONTH");  T(s, 13, "Model policy"); T(s, 14, "moving the mix, not yet the cost")
