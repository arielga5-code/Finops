import os as _os
# Working directory holding the unpacked source deck and intermediate JSON.
# Override with:  WORK=/path/to/workdir python3 -I <script>.py
WORK = _os.environ.get("WORK", _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))

import json, datetime
SC=WORK + "/"
d=json.load(open(SC+'charts.json'))
MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep']
def xl(n):
    try: return (datetime.date(1899,12,30)+datetime.timedelta(days=float(n))).strftime("%b")
    except: return str(n)
def table(slide, idx):
    c=d[slide][idx]
    cats=[]
    for s in c['series']:
        for cc in s['cats']:
            if cc is not None and cc not in cats: cats.append(cc)
    cats.sort(key=lambda x: float(x))
    months=[xl(x) for x in cats]
    rows={}
    for s in c['series']:
        m={cc:v for cc,v in zip(s['cats'],s['vals']) if cc is not None}
        rows[s['name']]=[(m.get(cc) or 0.0) for cc in cats]
    return months, rows
def to9(months, vec):
    out=[0.0]*9
    for m,v in zip(months,vec):
        if m in MON: out[MON.index(m)]=v
    return out

aws_m, aws_acct = table('slide4',0)
aws_sm, aws_svc = table('slide5',0)
mp_m,  aws_mp   = table('slide7',0)
az_m,  az_cc    = table('slide10',1)
az_sm, az_svc   = table('slide11',0)
amp_m, az_mp    = table('slide12',0)
gcp_m, gcp      = table('slide25',0)
aif_m, aif      = table('slide27',0)
bed_m, bed      = table('slide34',0)

AI = {
 'Amazon Bedrock (Claude)': to9(mp_m, aws_mp['Amazon Bedrock Edition']),
 'GitHub + Copilot':        to9(az_sm, az_svc['GitHub']),
 'Azure AI Foundry':        [a+b for a,b in zip(to9(az_sm,az_svc['Foundry Models']), to9(az_sm,az_svc['Foundry Tools']))],
 'Copilot Studio':          to9(az_sm, az_svc['Microsoft Copilot Studio']),
 'Cognitive Search':        to9(az_sm, az_svc['Azure Cognitive Search']),
 'GCP Vertex + Gemini':     [a+b for a,b in zip(to9(gcp_m,gcp['Vertex AI']), to9(gcp_m,gcp['Gemini API']))],
}
ai_tot=[sum(AI[k][i] for k in AI) for i in range(9)]
print("AI monthly:", [round(x) for x in ai_tot], "YTD", round(sum(ai_tot)))
for k,v in sorted(AI.items(), key=lambda kv:-sum(kv[1])): print("  %-26s ytd=%9.0f sep=%8.0f jan=%7.0f"%(k,sum(v),v[8],v[0]))

aws_tot=[sum(r[i] for r in aws_acct.values()) for i in range(9)]
az_tot =[sum(r[i] for r in az_cc.values())  for i in range(9)]
gcp_tot=to9(gcp_m,[sum(r[i] for r in gcp.values()) for i in range(len(gcp_m))])
tot=[a+b+c for a,b,c in zip(aws_tot,az_tot,gcp_tot)]
print("\nAWS :",[round(x) for x in aws_tot],"YTD",round(sum(aws_tot)))
print("AZ  :",[round(x) for x in az_tot], "YTD",round(sum(az_tot)))
print("GCP :",[round(x) for x in gcp_tot],"YTD",round(sum(gcp_tot)))
print("TOT :",[round(x) for x in tot],    "YTD",round(sum(tot)))
print("Q1avg %.0f  Q3avg %.0f  growth %.1f%%"%(sum(tot[:3])/3, sum(tot[6:])/3, (sum(tot[6:])/sum(tot[:3])-1)*100))
print("AI share of Sep: %.1f%%"%(ai_tot[8]/tot[8]*100))
mp_tot=[sum(r[i] for r in aws_mp.values()) for i in range(9)]
amp_tot=[sum(r[i] for r in az_mp.values()) for i in range(9)]
print("\nAWS MP YTD %.0f  AZ MP YTD %.0f"%(sum(mp_tot),sum(amp_tot)))
print("GRAND ALL-IN: %.0f"%(sum(tot)+sum(mp_tot)+sum(amp_tot)))

hil_m, hil = table('slide6',1)
fdy_m, fdy = table('slide33',0)

out={'months':MON,
     'harel_il':{k2:to9(hil_m,v) for k2,v in hil.items()},
     'foundry':{k2:to9(fdy_m,v) for k2,v in fdy.items()},'ai':AI,'ai_tot':ai_tot,'aws_tot':aws_tot,'az_tot':az_tot,'gcp_tot':gcp_tot,'tot':tot,
     'aws_acct':aws_acct,'aws_svc':aws_svc,'aws_mp':aws_mp,'az_cc':az_cc,'az_svc':az_svc,'az_mp':az_mp,
     'gcp':{k:to9(gcp_m,v) for k,v in gcp.items()},
     'aif':{k:v for k,v in aif.items() if k!='Total'},'bedrock':{k:to9(bed_m,v) for k,v in bed.items()},
     'mp_tot':mp_tot,'amp_tot':amp_tot}
json.dump(out, open(SC+'deck_data.json','w'))
