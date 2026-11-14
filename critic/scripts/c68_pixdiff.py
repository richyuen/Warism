# Critic run 68: the share of pixels that differ by over 40 (max channel) between two shots, in the map area only
# (the bars and panels masked: top 60 px, bottom 140 px, the ranking box). Usage: python c68_pixdiff.py a.png b.png [...]
import sys
from PIL import Image, ImageChops

def diff(a, b):
    A = Image.open(a).convert('RGB'); B = Image.open(b).convert('RGB')
    d = ImageChops.difference(A, B).convert('L').point(lambda v: 255 if v > 40 else 0)
    w, h = d.size
    box = (300, 60, 1300, h - 160)
    c = d.crop(box)
    n = sum(1 for v in c.getdata() if v)
    bb = c.getbbox()
    return n, c.size[0] * c.size[1], bb

args = sys.argv[1:]
for i in range(0, len(args), 2):
    n, t, bb = diff(args[i], args[i + 1])
    print(f'{args[i]} vs {args[i+1]}: {n} of {t} px differ ({100*n/t:.2f} %), bbox {bb}')
