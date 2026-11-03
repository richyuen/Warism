# Critic run 27: OR rows that did not end in a clean war. Usage: python critic/scripts/c28_orsum.py <or.json>...
import json, sys
for p in sys.argv[1:]:
    d = json.load(open(p, encoding='utf-8'))
    for k, v in d.items():
        if not k.startswith('day') or not isinstance(v, dict):
            continue
        for r in v['rows']:
            if r['broken'] or not r['atWar'] or r['stillBeside']:
                print(p, k, json.dumps(r, ensure_ascii=False)[:1200])
