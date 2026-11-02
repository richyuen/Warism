# Critic run 22: what the player sees of each countryball at the front (c24_cb2_*.json): for each element whose ball
# stands clear of others, the rendered pixels of its disc: helmet (olive) above the centre or not, the share of dark
# pixels (a black band) in the disc, and the mean colour of its red pixels. Grouped by nation and helmet.
import json, sys, math
from PIL import Image
j = json.load(open(sys.argv[1], encoding='utf-8'))
R = int(sys.argv[2]) if len(sys.argv) > 2 else 20
res = {}
for s in j['shots']:
    im = Image.open(s['shot']).convert('RGB'); W, H = im.size
    els = s['els']
    for e in els:
        x0, y0 = e['sx'], e['sy']
        near = min([math.hypot(o['sx'] - x0, o['sy'] - y0) for o in els if o is not e] or [1e9])
        if near < 2.2 * R or x0 < R or y0 < 2 * R or x0 > W - R or y0 > H - R: continue
        olive = dark = red = n = 0; rs = [0, 0, 0]
        for dy in range(-2 * R, R):
            for dx in range(-R, R):
                if dx * dx + dy * dy > (0.85 * R) ** 2 and dy > -R: continue
                p = im.getpixel((x0 + dx, y0 + dy))
                if dy < -R * 0.45 and abs(p[0] - 90) < 35 and abs(p[1] - 100) < 35 and abs(p[2] - 68) < 35: olive += 1
                if dy >= -R * 0.45 and dx * dx + dy * dy <= (0.85 * R) ** 2:
                    n += 1
                    if max(p) < 60: dark += 1
                    if p[0] > 140 and p[1] < 90: red += 1; rs = [rs[i] + p[i] for i in range(3)]
        k = f"{e['n']}_{'helmet' if olive > 20 else 'nohelmet'}"
        r = res.setdefault(k, {'balls': 0, 'darkShare': [], 'redRGB': []})
        r['balls'] += 1; r['darkShare'].append(round(dark / max(1, n), 3))
        if red: r['redRGB'].append([round(c / red) for c in rs])
out = {}
for k, r in sorted(res.items()):
    m = lambda a: round(sum(a) / len(a), 3) if a else None
    out[k] = {'balls': r['balls'], 'darkShareMean': m(r['darkShare']), 'darkShareMax': max(r['darkShare']) if r['darkShare'] else None,
              'redMean': [m([c[i] for c in r['redRGB']]) for i in range(3)] if r['redRGB'] else None}
print(json.dumps(out, indent=1))
json.dump(out, open(sys.argv[1].replace('.json', '_pixels.json'), 'w'), indent=1)
