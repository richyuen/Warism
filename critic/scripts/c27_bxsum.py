# Critic run 27: BX summaries. Usage: python critic/scripts/c27_bxsum.py <bx.json>...
import json, sys
for p in sys.argv[1:]:
    d = json.load(open(p, encoding='utf-8'))
    print('==', p, 'peaceWithPDay', d['peaceWithPDay'], 'EbackAtWarDay', d['EbackAtWarDay'])
    for r in d['log']:
        print(' ', r['k'], {k: r.get(k) for k in ['day', 'AvE', 'truceAE', 'AvP', 'AownCells', 'EholdsA', 'AholdsE', 'PholdsA', 'alliance']})
        print('     wars', r.get('wars'))
        ev = [e for e in r.get('evs', []) if not any(x in e for x in ('Strike', 'Flak', 'Air', 'Move', 'Arrived', 'Command'))]
        if ev:
            print('     evs', ev[:12])
