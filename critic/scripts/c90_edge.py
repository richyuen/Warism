# Critic run 90 (new): the colour spread across x of the rows past the map's north edge in c90_edge.mjs's shot
# (R89-N2, R214: "one flat sea colour"). Usage: python critic/scripts/c90_edge.py <shot> <y0> <y1> [x0 x1]
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB')
y0, y1 = int(sys.argv[2]), int(sys.argv[3])
x0 = int(sys.argv[4]) if len(sys.argv) > 4 else 0
x1 = int(sys.argv[5]) if len(sys.argv) > 5 else im.width
worst = 0
for y in range(y0, y1):
    px = [im.getpixel((x, y)) for x in range(x0, x1)]
    cols = set(px)
    spread = max(max(p[i] for p in px) - min(p[i] for p in px) for i in range(3))
    worst = max(worst, spread)
    if y % 5 == 0 or spread > 2: print(y, 'distinct', len(cols), 'spread', spread, 'mode', max(cols, key=px.count))
print('worst spread', worst)
