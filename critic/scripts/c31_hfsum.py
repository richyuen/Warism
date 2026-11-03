# Critic run 31: per hero fold JSON, each counter's members, the nations in it, and which members a run of clicks opened.
import json, sys, glob
for f in sys.argv[1:]:
    d = json.load(open(f, encoding='utf-8'))
    print('==', f, 'counters', len(d['counters']), 'errors', len(d.get('errors', [])))
    allm = 0; reached = 0
    for c in d['counters']:
        ids = [m['id'] for m in c['members']]; nat = sorted({m['nation'] for m in c['members']})
        got = {k['picked'] for k in c['clicks']}
        allm += len(ids); reached += sum(1 for i in ids if i in got)
        miss = [m['name'] for m in c['members'] if m['id'] not in got]
        bad = [(k['panel'] or 'NONE')[:30] for k in c['clicks'] if k['picked'] not in ids]
        print(f"  {c['text']:22} nations {nat} box {[round(v) for v in c['box']]} maxoff {max(m['pxFromBox'] for m in c['members'])} missed {miss} other {bad[:2]}")
    print('  reached', reached, 'of', allm)
