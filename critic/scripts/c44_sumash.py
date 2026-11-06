# Critic run 38: one line per ash/ash2 JSON: landings, act reply, LeftLanding / MoveRejected events.
import json, sys, glob, os
for f in sorted(glob.glob(sys.argv[1])):
    try: d = json.load(open(f, encoding='utf-8'))
    except Exception as e: print(os.path.basename(f), 'ERR', e); continue
    ev = d.get('events', [])
    act = [e for e in ev if 'ACT' in e]
    tells = [e.split(' ')[0] + ' ' + e.split(' ')[1] + ' ' + e.split(' ')[2] + ' ' + e.split(' ')[4] for e in ev if 'LeftLanding' in e or 'MoveRejected' in e]
    det = d.get('actDetail') or {}
    print(os.path.basename(f), 'n', len(d['ids']), 'acted', d.get('acted'), 'reply', json.dumps(d.get('actReply')), 'landed', d.get('landedAt'),
          'after', json.dumps({k: det.get('after', {}).get(k) for k in ('emb', 'bound', 'seaBound')}) if det else '', 'before', json.dumps({k: det.get('before', {}).get(k) for k in ('emb', 'bound', 'seaBound')}) if det else '', 'tells', tells)
