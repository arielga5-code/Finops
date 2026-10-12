import os as _os
# Working directory holding the unpacked source deck and intermediate JSON.
# Override with:  WORK=/path/to/workdir python3 -I <script>.py
WORK = _os.environ.get("WORK", _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))

import os, json, re, glob
from lxml import etree
BASE = WORK + "/unpacked"
C = "{http://schemas.openxmlformats.org/drawingml/2006/chart}"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"

slide_charts = {}
for rels in glob.glob(BASE+"/ppt/slides/_rels/*.rels"):
    slide = os.path.basename(rels).replace(".xml.rels","")
    for r in etree.parse(rels).getroot():
        if "charts/chart" in r.get("Target"):
            slide_charts.setdefault(slide, []).append(os.path.basename(r.get("Target")))

def pts(parent):
    """Return dict idx->value honouring the idx attribute, plus declared count."""
    if parent is None: return {}, 0
    ref = parent.find(C+"numRef") or parent.find(C+"strRef") or parent
    cache = None
    for tag in ("numCache","strCache","numLit","strLit"):
        c = ref.find(C+tag)
        if c is not None: cache = c; break
    if cache is None: cache = ref
    cnt = cache.find(C+"ptCount")
    n = int(cnt.get("val")) if cnt is not None else 0
    out = {}
    for pt in cache.findall(C+"pt"):
        i = int(pt.get("idx"))
        v = pt.find(C+"v")
        out[i] = v.text if v is not None else None
    return out, n

out = {}
for slide in sorted(slide_charts, key=lambda s:int(re.sub(r'\D','',s))):
    out[slide] = []
    for cf in slide_charts[slide]:
        p = BASE+"/ppt/charts/"+cf
        if not os.path.exists(p): continue
        root = etree.parse(p).getroot()
        title = "".join(x.text or "" for x in root.findall(".//"+C+"title//"+A+"t"))
        chart = {"file":cf,"title":title,"series":[]}
        for ser in root.iter(C+"ser"):
            tx = ser.find(C+"tx")
            name = None
            if tx is not None:
                v = tx.findall(".//"+C+"v")
                if v: name = v[0].text
            cmap, cn = pts(ser.find(C+"cat"))
            vmap, vn = pts(ser.find(C+"val"))
            n = max(cn, vn, (max(cmap)+1 if cmap else 0), (max(vmap)+1 if vmap else 0))
            cats = [cmap.get(i) for i in range(n)]
            vals = []
            for i in range(n):
                t = vmap.get(i)
                try: vals.append(float(t))
                except: vals.append(None)
            chart["series"].append({"name":name,"cats":cats,"vals":vals})
        out[slide].append(chart)
print(json.dumps(out, ensure_ascii=False))
