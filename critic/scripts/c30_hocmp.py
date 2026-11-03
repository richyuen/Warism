# Critic run 30: heroes on, per seed, run 29 (c29_ho_on_<s>.json, 823cbf1b) against run 30 (c30_ho_on_<s>.json, HEAD):
# per hero: lost, waitingPast days (nation alive), servedOther days and by whom; sea heroes' return places (lon, lat).
import json, sys, glob, os
seeds = sorted(int(f.split('_')[-1].split('.')[0]) for f in glob.glob('critic/c30_ho_on_*.json'))
W, H = 2048, 1024
ll = lambda x, y: (round(x / W * 360 - 180, 1), round(90 - y / H * 180, 1))
tot = {}
for s in seeds:
    a = json.load(open(f'critic/c29_ho_on_{s}.json', encoding='utf-8')) if os.path.exists(f'critic/c29_ho_on_{s}.json') else None
    b = json.load(open(f'critic/c30_ho_on_{s}.json', encoding='utf-8'))
    print('== seed', s)
    for i, h in enumerate(b['heroRows']):
        o = a['heroRows'][i] if a else None
        t = tot.setdefault(h['name'], {'lost29': 0, 'lost30': 0, 'wait29': 0, 'wait30': 0, 'other29': 0, 'other30': 0})
        t['lost30'] += len(h['lost']); t['wait30'] += h['waitingPast']; t['other30'] += h['servedOther']
        if o: t['lost29'] += len(o['lost']); t['wait29'] += o['waitingPast']; t['other29'] += o['servedOther']
        late = [r['lateDays'] for r in h['returns'] if r['lateDays'] > 0]
        print(f"  {h['name']:28} lost {len(o['lost']) if o else '-':>3}->{len(h['lost']):>3} wait {o['waitingPast'] if o else '-':>5}->{h['waitingPast']:>5} other {o['servedOther'] if o else '-'}->{h['servedOther']} {h['servedBy']} late>0 {late[:6]}")
print('== totals (run 29 -> run 30)')
for k, t in tot.items(): print(f"  {k:28} lost {t['lost29']}->{t['lost30']} waitPast {t['wait29']}->{t['wait30']} servedOther {t['other29']}->{t['other30']}")
