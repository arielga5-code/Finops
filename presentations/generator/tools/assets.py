import os as _os
# Working directory holding the unpacked source deck and intermediate JSON.
# Override with:  WORK=/path/to/workdir python3 -I <script>.py
WORK = _os.environ.get("WORK", _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))

from PIL import Image
import numpy as np, os
SRC=WORK + "/unpacked/ppt/media/"
OUT=WORK + "/assets/"
os.makedirs(OUT, exist_ok=True)

def trim(im, tol=250):
    im=im.convert('RGBA'); a=np.array(im)
    alpha=a[...,3]
    opaque = alpha>8
    light  = (a[...,0]>tol)&(a[...,1]>tol)&(a[...,2]>tol)
    mask = opaque & ~light
    ys,xs=np.where(mask)
    if len(ys)==0: return im
    p=4
    return im.crop((max(xs.min()-p,0),max(ys.min()-p,0),min(xs.max()+p+1,im.width),min(ys.max()+p+1,im.height)))

def to_white_text(im, thresh=150):
    """Turn dark (near-grey/black) pixels white, keep coloured pixels (the swirl)."""
    im=im.convert('RGBA'); a=np.array(im).astype(int)
    r,g,b,al=a[...,0],a[...,1],a[...,2],a[...,3]
    mx=a[...,:3].max(2); mn=a[...,:3].min(2)
    sat=mx-mn
    dark_grey=(mx<thresh)&(sat<45)&(al>8)
    a[...,0]=np.where(dark_grey,255,r); a[...,1]=np.where(dark_grey,255,g); a[...,2]=np.where(dark_grey,255,b)
    return Image.fromarray(a.astype('uint8'),'RGBA')

# Harel EN logo
h=Image.open(SRC+'image10.png'); h=trim(h)
h.save(OUT+'harel_dark.png')
to_white_text(h).save(OUT+'harel_light.png')

# Harel HE logo (RGB -> add alpha by whiting out)
he=Image.open(SRC+'image7.png').convert('RGBA')
a=np.array(he); white=(a[...,0]>245)&(a[...,1]>245)&(a[...,2]>245)
a[...,3]=np.where(white,0,255); he=Image.fromarray(a,'RGBA'); he=trim(he)
he.save(OUT+'harel_he_dark.png'); to_white_text(he).save(OUT+'harel_he_light.png')

for name,src in [('aws','image11.png'),('azure','image13.png'),('gcp','image15.png')]:
    im=Image.open(SRC+src).convert('RGBA')
    arr=np.array(im)
    if src!='image13.png':
        white=(arr[...,0]>245)&(arr[...,1]>245)&(arr[...,2]>245)
        arr[...,3]=np.where(white,0,arr[...,3]); im=Image.fromarray(arr,'RGBA')
    im=trim(im)
    im.thumbnail((900,900))
    im.save(OUT+name+'.png')

# hero image for title slide
Image.open(SRC+'image19.png').convert('RGB').save(OUT+'hero.jpg', quality=92)

for f in sorted(os.listdir(OUT)):
    print(f, Image.open(OUT+f).size)
