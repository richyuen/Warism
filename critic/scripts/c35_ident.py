# Critic run 35: is each c35 JSON identical to run 34's (c34) once timing keys are stripped?
import json, sys, glob, os
TIME = {'ms', 'msPerYear', 'wall', 'elapsed', 'secs', 'seconds', 'time', 'tickMs', 'timing', 'took', 'startedAt', 'at'}
def strip(o):
    if isinstance(o, dict): return {k: strip(v) for k, v in o.items() if k not in TIME and not k.lower().endswith('ms')}
    if isinstance(o, list): return [strip(v) for v in o]
    if isinstance(o, str): return o.replace('c35', 'c34')
    return o
pat = sys.argv[1]
for f in sorted(glob.glob(pat)):
    g = f.replace('c35_', 'c34_')
    if not os.path.exists(g): print(os.path.basename(f), 'no c34'); continue
    a = strip(json.load(open(f, encoding='utf-8'))); b = strip(json.load(open(g, encoding='utf-8')))
    if a == b: print(os.path.basename(f), 'IDENTICAL'); continue
    diff = [k for k in set(a) | set(b) if a.get(k) != b.get(k)] if isinstance(a, dict) else ['(list)']
    print(os.path.basename(f), 'DIFF', diff[:12])
