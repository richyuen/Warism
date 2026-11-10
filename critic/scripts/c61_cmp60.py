# Critic run 61: each critic/c61_*.json of suite A against run 60's critic/c60_*.json of the same name; shot paths and
# timings taken out. Prints SAME or the first differing key path.
import json, glob, os, re, sys
def norm(o):
    if isinstance(o, dict): return {k: norm(v) for k, v in o.items() if not re.search(r'ms$|Ms$|time|elapsed|wall', k)}
    if isinstance(o, list): return [norm(v) for v in o]
    if isinstance(o, str): return re.sub(r'c6[01]', 'cN', o)
    return o
def first_diff(a, b, p=''):
    if type(a) != type(b): return p
    if isinstance(a, dict):
        for k in sorted(set(a) | set(b)):
            if k not in a or k not in b: return p + '/' + k
            d = first_diff(a[k], b[k], p + '/' + k)
            if d is not None: return d
        return None
    if isinstance(a, list):
        if len(a) != len(b): return p + f'[len {len(a)} vs {len(b)}]'
        for i, (x, y) in enumerate(zip(a, b)):
            d = first_diff(x, y, p + f'[{i}]')
            if d is not None: return d
        return None
    return None if a == b else p
for f in sorted(glob.glob('critic/c61_*.json')):
    g = f.replace('c61_', 'c60_')
    if not os.path.exists(g): continue
    try:
        a = norm(json.load(open(g, encoding='utf-8'))); b = norm(json.load(open(f, encoding='utf-8')))
    except Exception as e:
        print(f, 'ERR', e); continue
    d = first_diff(a, b)
    print(('SAME ' if d is None else 'DIFF ' + d + ' ') + f)
