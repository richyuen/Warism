# Critic run 74: the undo probes' before/undone pictures compared (as run 73's c73_undo2_pix.txt). Run from critic/.
from PIL import Image, ImageChops
import glob, sys
for p in ['c74u2_41211', 'c74u2y_51231']:
    for k in ['nuke', 'revolt', 'nation', 'city', 'raze']:
        a = Image.open(f'shots/{p}_{k}_0before.png').convert('RGB').crop((0, 60, 1600, 485)); b = Image.open(f'shots/{p}_{k}_2undone.png').convert('RGB').crop((0, 60, 1600, 485))  # the map between the clock and the chrome, 680,000 px as run 73's
        box = (0, 0, a.width, a.height)
        d = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v else 0)
        n = sum(1 for v in d.getdata() if v)
        print(f'shots/{p}_{k}_0before.png vs shots/{p}_{k}_2undone.png: {n} of {a.width*a.height} px differ, bbox {d.getbbox()}')
