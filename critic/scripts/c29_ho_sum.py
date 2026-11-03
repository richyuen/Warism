# Critic run 29 (R5a): heroes on vs off, paired by seed (critic/c29_ho_{on,off}_<seed>.json).
# World figures per seed (sums over the years, or the value at a year), the paired difference on - off, its mean and
# standard error over seeds; then the heroes' own figures over every seed.
import json, glob, math, sys
seeds = sorted({int(f.split('_')[-1].split('.')[0]) for f in glob.glob('critic/c29_ho_on_*.json')} & {int(f.split('_')[-1].split('.')[0]) for f in glob.glob('critic/c29_ho_off_*.json')})
GP = ['GER', 'ENG', 'FRA', 'ITA', 'JAP', 'SOV', 'USA']
def load(arm, s):
    return json.load(open(f'critic/c29_ho_{arm}_{s}.json', encoding='utf-8'))
def figs(d):
    y = d['perYear']
    f = {}
    for k in ['declared', 'peace', 'capitals', 'eliminated', 'annexed', 'revolts', 'puppetCreated', 'puppetRevolt', 'seaBattles', 'shipsSunk', 'bursts', 'majorBattles']:
        f[k] = sum(r[k] for r in y)
    f['warsYearEnd(mean)'] = sum(r['wars'] for r in y) / len(y)
    f['living@end'] = y[-1]['living']
    for at in (10, len(y)):
        r = y[at - 1]
        f[f'gp7share@y{at}'] = sum(r['gpShare'][g] for g in GP)
        f[f'gp7living@y{at}'] = sum(r['gpLiving'][g] for g in GP)
        f[f'top@y{at}'] = float(r['top'].split()[-1].rstrip('%'))
        for g in GP: f[f'{g}@y{at}'] = r['gpShare'][g]
    return f
rows = []
out = {'seeds': seeds, 'world': {}, 'heroes': {}}
for s in seeds:
    a, b = load('on', s), load('off', s)
    if len(a['perYear']) != len(b['perYear']): continue
    rows.append((s, figs(a), figs(b)))
print(f'paired seeds: {[r[0] for r in rows]}  years: {len(load("on", rows[0][0])["perYear"]) if rows else 0}')
keys = list(rows[0][1].keys()) if rows else []
print(f'{"figure":22s} {"on mean":>9s} {"off mean":>9s} {"diff":>8s} {"se":>7s}  per-seed diffs')
for k in keys:
    on = [r[1][k] for r in rows]; off = [r[2][k] for r in rows]; d = [x - y for x, y in zip(on, off)]
    n = len(d); m = sum(d) / n; se = math.sqrt(sum((x - m) ** 2 for x in d) / (n - 1) / n) if n > 1 else float('nan')
    out['world'][k] = {'on': sum(on) / n, 'off': sum(off) / n, 'diff': m, 'se': se, 'diffs': d}
    print(f'{k:22s} {sum(on)/n:9.2f} {sum(off)/n:9.2f} {m:8.2f} {se:7.2f}  {" ".join(f"{x:.1f}" for x in d)}')
# heroes
H = {}
for s, _, _ in rows:
    d = load('on', s)
    yrs = len(d['perYear'])
    for h in d['heroRows']:
        e = H.setdefault(h['name'], {'seeds': 0, 'alive': 0, 'war': 0, 'engaged': 0, 'lost': 0, 'lostNotEngaged': 0, 'returns': 0, 'late>1d': 0, 'servedOther': 0, 'servedBy': set(), 'waitingPast': 0, 'minHealth': 1, 'healthWar': 0, 'healthWarDays': 0, 'days': 0})
        e['seeds'] += 1; e['days'] += yrs * 365
        e['alive'] += h['alive']; e['war'] += h['war']; e['engaged'] += h['engaged']
        e['lost'] += len(h['lost']); e['lostNotEngaged'] += sum(1 for l in h['lost'] if not l['engagedLast24'])
        e['returns'] += len(h['returns']); e['late>1d'] += sum(1 for r in h['returns'] if r['lateDays'] > 1)
        e['servedOther'] += h['servedOther']; e['servedBy'] |= set(h['servedBy']); e['waitingPast'] += h['waitingPast']
        e['minHealth'] = min(e['minHealth'], h['minHealth']); e['healthWar'] += h['healthWarSum']; e['healthWarDays'] += h['healthWarDays']
print()
print(f'{"hero":28s} {"alive%":>6s} {"war%":>5s} {"eng/war":>7s} {"lost/20y":>8s} {"notEng":>6s} {"late":>4s} {"served":>6s} {"waitPast":>8s} {"hpWar":>5s}')
for k, e in H.items():
    yrs20 = e['days'] / 365 / 20
    print(f'{k:28s} {100*e["alive"]/e["days"]:6.1f} {100*e["war"]/max(1,e["alive"]):5.1f} {e["engaged"]/max(1,e["war"]):7.3f} {e["lost"]/e["seeds"]:8.2f} {e["lostNotEngaged"]:6d}/{e["lost"]:<4d} {e["late>1d"]:4d} {e["servedOther"]:6d} {e["waitingPast"]:8d} {e["healthWar"]/max(1,e["healthWarDays"]):5.2f} {sorted(e["servedBy"])}')
    out['heroes'][k] = {**{x: y for x, y in e.items() if x != 'servedBy'}, 'servedBy': sorted(e['servedBy'])}
json.dump(out, open('critic/c29_ho_sum.json', 'w', encoding='utf-8'), indent=1)
