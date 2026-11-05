# Critic run 38: one block per lwt JSON: tooltip, act before/after, notices seen, final, errors.
import json, sys, glob, os
for f in sorted(glob.glob(sys.argv[1])):
    try: d = json.load(open(f, encoding='utf-8'))
    except Exception as e: print(os.path.basename(f), 'ERR', e); continue
    a = d.get('act') or {}
    print('##', os.path.basename(f), 'fatal' if d.get('fatal') else '', (d.get('fatal') or '')[:200])
    print('  tip', repr(a.get('tip')), '| before', (a.get('before') or {}).get('panel', {}).get('status'))
    af = a.get('after') or {}
    print('  after', af.get('panel', {}).get('status'), '|', af.get('panel', {}).get('notice'), '|', af.get('st'))
    a6 = a.get('after6') or {}
    print('  after6', a6.get('panel', {}).get('status'), '|', a6.get('panel', {}).get('notice'))
    seen = []
    for t in d.get('trace', []):
        if t.get('notice') and (not seen or seen[-1][1] != t['notice']): seen.append((t['h'], t['notice']))
    print('  notices', seen)
    land = {}
    for t in d.get('trace', []):
        for p in t['st'].split():
            i, v = p.split(':', 1)
            if v.startswith('landed') and i not in land: land[i] = t['h']
    print('  landed', land, 'final', [(x['id'], x['v'], x['p']) for x in d.get('final', [])])
    if d.get('noticeShot'): print('  noticeShot', d['noticeShot'].get('h'), d['noticeShot'].get('notice'), d['noticeShot'].get('news'), d['noticeShot'].get('crop'))
    if d.get('endPanel'): print('  endPanel', d['endPanel']['panel'].get('notice'), d['endPanel'].get('news'), d['endPanel'].get('crop'))
    print('  rows(order)', [r for r in d.get('rows', []) if 'division' in r][:6], 'errors', d.get('errors', [])[:3])
