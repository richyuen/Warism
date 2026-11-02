# Critic run 22: per-year world dynamics of the same seeds on run 21's commit (bd7940de, c21_headless_*) and HEAD
# (c24_headless_*): the sim changed (ADR-776, ADR-780), so hashes cannot match; compare what a watcher sees.
import json
res = {}
for s in ('1213', '3301', '7019'):
    a = json.load(open(f'critic/c21_headless_{s}.json', encoding='utf-8'))['rows']
    b = json.load(open(f'critic/c24_headless_{s}.json', encoding='utf-8'))['rows']
    rows = []
    for x, y in zip(a, b):
        rows.append({'y': x['year'], 'living': [x['living'], y['living']], 'founded': [x['founded'], y['founded']], 'tiny': [x['tiny'], y['tiny']],
                     'wars': [x['wars'], y['wars']], 'flipped': [x['flipped'], y['flipped']], 'tickMs': [x['tickMs'], y['tickMs']],
                     'revolts': [x['ev'].get('RevoltSpawned', 0), y['ev'].get('RevoltSpawned', 0)],
                     'burst': [x['ev'].get('NukeDetonated', 0), y['ev'].get('NukeDetonated', 0)], 'declared': [x['ev'].get('WarDeclared', 0), y['ev'].get('WarDeclared', 0)], 'annexed': [x['ev'].get('NationAnnexed', 0)+x['ev'].get('NationEliminated', 0), y['ev'].get('NationAnnexed', 0)+y['ev'].get('NationEliminated', 0)], 'sea': [x['sea']['n'], y['sea']['n']],
                     'top3': [x['top'][:3], y['top'][:3]], 'hashEq': x['hash'] == y['hash']})
    tot = lambda k, i: sum(r[k][i] for r in rows)
    res[s] = {'rows': rows, 'sum': {k: [tot(k, 0), tot(k, 1)] for k in ('wars', 'flipped', 'revolts', 'burst', 'sea', 'declared', 'annexed')}, 'hashEq': sum(r['hashEq'] for r in rows)}
json.dump(res, open('critic/c24_dyn.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
for s, r in res.items():
    print(s, 'hashEq', r['hashEq'], 'of', len(r['rows']), r['sum'])
    for row in r['rows']:
        if row['y'] in (1, 5, 10, 15, 20, 25, 30):
            print('  y%2d living %s founded %s tiny %s wars %s revolts %s tick %s top %s' % (row['y'], row['living'], row['founded'], row['tiny'], row['wars'], row['revolts'], row['tickMs'], row['top3'][1]))
