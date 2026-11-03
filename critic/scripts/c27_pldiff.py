# Critic run 24: HEAD's planes (c27pl, 5299) against run 23's HEAD shots (c25pl, 5299) and run 23's build today (c27pl 5298), same moment.
from PIL import Image, ImageChops
import json
res = {}
for m in ('3000','1200','0600','0250','0120','0060','0025'):
    a = Image.open(f'critic/shots/c25pl_7019_GER_POL_5299_{m}m_balls.png').convert('RGB')
    b = Image.open(f'critic/shots/c27pl_7019_GER_POL_5299_{m}m_balls.png').convert('RGB')
    o = Image.open(f'critic/shots/c27pl_7019_GER_POL_5298_{m}m_balls.png').convert('RGB')
    d = ImageChops.difference(a, b).convert('L'); bb = d.point(lambda v: 255 if v > 24 else 0).getbbox()
    n = sum(1 for v in d.getdata() if v > 24)
    d2 = ImageChops.difference(o, b).convert('L'); n2 = sum(1 for v in d2.getdata() if v > 24); bb2 = d2.point(lambda v: 255 if v > 24 else 0).getbbox()
    res[m] = {'c25head_vs_c27head_px': n, 'bbox': bb, 'c25build_today_vs_c27head_px': n2, 'bbox2': bb2}
    if bb2:
        x0, y0, x1, y1 = bb2; cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
        box = (max(0, cx - 150), max(0, cy - 100), min(1600, cx + 150), min(900, cy + 100))
        pair = Image.new('RGB', ((box[2]-box[0]) * 2 + 10, box[3]-box[1]), 'white')
        pair.paste(o.crop(box), (0, 0)); pair.paste(b.crop(box), (box[2]-box[0] + 10, 0))
        pair = pair.resize((pair.width * 2, pair.height * 2), Image.NEAREST)
        pair.save(f'critic/shots/c27pl_{m}m_pair_c25left_c27right.png')
print(json.dumps(res, indent=1))
json.dump(res, open('critic/c27_pldiff.json', 'w'), indent=1)
