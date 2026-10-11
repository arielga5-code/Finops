import os as _os
# Working directory holding the unpacked source deck and intermediate JSON.
# Override with:  WORK=/path/to/workdir python3 -I <script>.py
WORK = _os.environ.get("WORK", _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))

import json, datetime, sys
d=json.load(open(WORK + "/charts.json"))
def xl(n):
    try: return (datetime.date(1899,12,30)+datetime.timedelta(days=float(n))).strftime("%b-%y")
    except: return str(n)

def table(slide, idx):
    c=d[slide][idx]
    allcats=[]
    for s in c['series']:
        for cc in s['cats']:
            if cc not in allcats: allcats.append(cc)
    allcats.sort(key=lambda x: float(x) if str(x).replace('.','').isdigit() else 0)
    months=[xl(x) for x in allcats]
    rows={}
    for s in c['series']:
        m=dict(zip(s['cats'], s['vals']))
        rows[s['name']]=[ (m.get(cc) or 0.0) for cc in allcats]
    return months, rows

def report(slide, idx, label, topn=10):
    months, rows = table(slide,idx)
    tot=[sum(r[i] for r in rows.values()) for i in range(len(months))]
    print("\n=== %s : %s ==="%(label,slide))
    print("months:", months)
    print("MONTHLY:", [round(x) for x in tot], "GRAND:", round(sum(tot)))
    srt=sorted(rows.items(), key=lambda kv:-sum(kv[1]))
    for n,v in srt[:topn]:
        print("  %-44s ytd=%10.0f sep=%9.0f aug=%9.0f"%(str(n)[:44],sum(v),v[-1],v[-2] if len(v)>1 else 0))
    if len(srt)>topn: print("  ...%d more ytd=%.0f"%(len(srt)-topn,sum(sum(v) for n,v in srt[topn:])))
    return months,rows,tot

for args in [('slide4',0,'AWS by account',10),('slide5',0,'AWS by service',12),
             ('slide6',1,'AWS Harel-IL by service',11),('slide7',0,'AWS Marketplace',15),
             ('slide10',1,'Azure by cost center',12),('slide11',0,'Azure by service',16),
             ('slide12',0,'Azure Marketplace',3),('slide25',0,'GCP',6),
             ('slide27',0,'AI Factory projects',5),('slide33',0,'Foundry',10),
             ('slide34',0,'Bedrock',10),('slide36',1,'Copilot',3),('slide36',0,'GitHub',2),
             ('slide23',1,'Databricks infra by svc',6),('slide13',1,'DataCloud by sub',6)]:
    report(*args)
