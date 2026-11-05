# Critic run 34 (copy of run 33): run 31 (4c546398) vs run 33 (HEAD) on the same seeds and the same script (c31_ho.ts), per arm.
# World figures over 20 years; the paired difference c35 - c31, mean and standard error over seeds.
import json, glob, math, sys
sys.path.insert(0, 'critic/scripts')
GP = ['GER', 'ENG', 'FRA', 'ITA', 'JAP', 'SOV', 'USA']
def figs(d):
    y = d['perYear']; f = {}
    for k in ['declared', 'peace', 'capitals', 'eliminated', 'annexed', 'revolts', 'puppetCreated', 'puppetRevolt', 'seaBattles', 'shipsSunk', 'bursts', 'majorBattles']:
        f[k] = sum(r[k] for r in y)
    f['wars@yearEnd(mean)'] = sum(r['wars'] for r in y) / len(y)
    f['living@y10'] = y[9]['living']; f['living@end'] = y[-1]['living']
    for at in (10, len(y)):
        r = y[at - 1]
        f[f'gp7share@y{at}'] = sum(r['gpShare'][g] for g in GP)
        f[f'gp7living@y{at}'] = sum(r['gpLiving'][g] for g in GP)
        f[f'top@y{at}'] = float(r['top'].split()[-1].rstrip('%'))
    f['tops'] = y[-1]['top']
    return f
for arm in ('off', 'on'):
    seeds = sorted({int(f.split('_')[-1].split('.')[0]) for f in glob.glob(f'critic/c35_ho_{arm}_*.json')} & {int(f.split('_')[-1].split('.')[0]) for f in glob.glob(f'critic/c31_ho_{arm}_*.json')})
    rows = []
    for s in seeds:
        a = json.load(open(f'critic/c35_ho_{arm}_{s}.json', encoding='utf-8')); b = json.load(open(f'critic/c31_ho_{arm}_{s}.json', encoding='utf-8'))
        if len(a['perYear']) != len(b['perYear']): continue
        rows.append((s, figs(a), figs(b), a.get('ms'), b.get('ms')))
    print(f'== heroes {arm}: seeds {[r[0] for r in rows]}')
    if not rows: continue
    for k in rows[0][1]:
        if k == 'tops':
            print('  top@end c35', [r[1][k] for r in rows]); print('  top@end c31', [r[2][k] for r in rows]); continue
        d = [r[1][k] - r[2][k] for r in rows]; n = len(d); m = sum(d) / n
        se = math.sqrt(sum((x - m) ** 2 for x in d) / (n - 1) / n) if n > 1 else 0
        a = sum(r[1][k] for r in rows) / n; b = sum(r[2][k] for r in rows) / n
        print(f'  {k:22s} c31 {b:9.1f}  c35 {a:9.1f}  diff {m:+8.1f} ± {se:6.1f}')
