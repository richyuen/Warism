# Critic run 43: each c43 JSON against its twin from run 42 (c42_) or, failing that, run 39 (c39_),
# timings, fps and shot names stripped, run prefixes normalised.
import json, sys, glob, os, re
TIME = {'ms', 'msPerYear', 'wall', 'elapsed', 'secs', 'seconds', 'time', 'tickMs', 'timing', 'took', 'startedAt'}
def strip(o):
    if isinstance(o, dict):
        return {k: strip(v) for k, v in o.items() if k not in TIME and not k.lower().endswith('ms')
                and 'shot' not in k.lower() and 'fps' not in k.lower()}
    if isinstance(o, list): return [strip(v) for v in o]
    if isinstance(o, str): return re.sub(r'c(39|42|43)', 'cXX', o)
    return o
pat = sys.argv[1] if len(sys.argv) > 1 else 'critic/c43_*.json'
for f in sorted(glob.glob(pat)):
    base = os.path.basename(f)[4:]
    twin = None
    for p in ('c42_', 'c39_'):
        g = os.path.join('critic', p + base)
        if os.path.exists(g): twin = g; break
    if not twin: print(os.path.basename(f), 'NOTWIN'); continue
    try:
        a = strip(json.load(open(f, encoding='utf-8'))); b = strip(json.load(open(twin, encoding='utf-8')))
    except Exception as e:
        print(os.path.basename(f), 'ERR', e); continue
    if a == b: print(os.path.basename(f), 'IDENTICAL', twin[7:10]); continue
    diff = sorted(k for k in set(a) | set(b) if a.get(k) != b.get(k)) if isinstance(a, dict) and isinstance(b, dict) else ['(list)']
    print(os.path.basename(f), 'DIFF', twin[7:10], diff[:12])
