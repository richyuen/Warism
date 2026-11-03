# Critic run 22: draw each element's nation id over a screenshot (from c28_cb2_*.json).
import json, sys
from PIL import Image, ImageDraw
j = json.load(open(sys.argv[1], encoding='utf-8'))
for s in j['shots']:
    im = Image.open(s['shot']).convert('RGB'); d = ImageDraw.Draw(im)
    for e in s['els']:
        col = (255, 255, 0) if e['n'] == j['nations']['a'] else (0, 255, 255)
        d.text((e['sx'] - 4, e['sy'] + 18), str(e['n']), fill=col)
        d.ellipse((e['sx'] - 2, e['sy'] - 2, e['sx'] + 2, e['sy'] + 2), outline=col)
    o = s['shot'].replace('.png', '_annot.png'); im.save(o); print(o)
