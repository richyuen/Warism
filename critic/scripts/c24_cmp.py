# Critic run 24: each re-run probe's JSON on HEAD (c24_*) against run 23's (c23_*), with volatile keys dropped
# (ms, fps, frames, timings, shots' names, dates of the run). Prints identical / differs with the first differing paths.
import json, os, re, sys
VOL = re.compile(r'(ms|Ms|fps|frames|wall|time|Time|shot|Shot|boot|t0|elapsed|took|gap|Gap|ts$|timestamp|png|file)', re.I)
def norm(o):
    if isinstance(o, dict):
        return {k: norm(v) for k, v in o.items() if not VOL.search(k)}
    if isinstance(o, list):
        return [norm(v) for v in o]
    if isinstance(o, str):
        return re.sub(r'c2[34]', 'cXX', o)
    if isinstance(o, float):
        return round(o, 2)
    return o
def diff(a, b, p='', out=None):
    if out is None: out = []
    if len(out) > 6: return out
    if type(a) != type(b): out.append(f'{p}: {str(a)[:80]} != {str(b)[:80]}'); return out
    if isinstance(a, dict):
        for k in sorted(set(a) | set(b)):
            if k not in a or k not in b: out.append(f'{p}.{k}: only in {"c23" if k in a else "c24"}')
            else: diff(a[k], b[k], f'{p}.{k}', out)
    elif isinstance(a, list):
        if len(a) != len(b): out.append(f'{p}: len {len(a)} != {len(b)}')
        for i, (x, y) in enumerate(zip(a, b)): diff(x, y, f'{p}[{i}]', out)
    elif a != b: out.append(f'{p}: {str(a)[:80]} != {str(b)[:80]}')
    return out
res = {}
for f in sorted(os.listdir('critic')):
    if not (f.startswith('c24_') and f.endswith('.json')): continue
    g = 'c23_' + f[4:]
    if not os.path.exists('critic/' + g): continue
    try:
        a = norm(json.load(open('critic/' + g, encoding='utf-8'))); b = norm(json.load(open('critic/' + f, encoding='utf-8')))
    except Exception as e:
        res[f] = f'error {e}'; continue
    d = diff(a, b)
    res[f] = 'identical' if not d else d
for k, v in res.items(): print(k, '=>', v if isinstance(v, str) else '\n    ' + '\n    '.join(v))
json.dump(res, open('critic/c24_cmp.json', 'w'), indent=1)
