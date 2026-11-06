# Critic run 38: is each c38 JSON identical to run 37 (c38) once timing keys are stripped?
import json, sys, glob, os
TIME = {'ms', 'msPerYear', 'wall', 'elapsed', 'secs', 'seconds', 'time', 'tickMs', 'timing', 'took', 'startedAt', 'at'}
def strip(o):
    if isinstance(o, dict): return {k: strip(v) for k, v in o.items() if k not in TIME and not k.lower().endswith('ms') and 'shot' not in k.lower() and 'fps' not in k.lower()}
    if isinstance(o, list): return [strip(v) for v in o]
    if isinstance(o, str): return o.replace('c39', 'c38')
    return o
pat = sys.argv[1]
for f in sorted(glob.glob(pat)):
    g = f.replace('c43_', 'c43_')
    if not os.path.exists(g): print(os.path.basename(f), 'no c38'); continue
    try:
        a = strip(json.load(open(f, encoding='utf-8'))); b = strip(json.load(open(g, encoding='utf-8')))
    except Exception as e:
        print(os.path.basename(f), 'ERR', e); continue
    if a == b: print(os.path.basename(f), 'IDENTICAL'); continue
    diff = [k for k in set(a) | set(b) if a.get(k) != b.get(k)] if isinstance(a, dict) else ['(list)']
    print(os.path.basename(f), 'DIFF', sorted(diff)[:12])
