# Critic run 25: LEAVE summary: of the pairs that stopped being at war in an hour with a declaration, those where a member
# was on the new war's attacking side and stood beside one of the new war's defenders in the old war (PLAN 7.188's rule).
import json, sys, glob
for f in sorted(glob.glob(sys.argv[1])):
    d = json.load(open(f))
    hits = []
    for x in d['leftOnDeclaration']:
        a, b = x['pair'].split('-')
        decs = [y for y in d.get('decl', []) if abs(y['day'] - x['day']) < 0.01 and y['a']]
        old = x['oldSides'] or [[], []]
        for y in decs:
            for m, o in ((a, b), (b, a)):
                side = old[0] if m in old[0] else old[1] if m in old[1] else []
                if m in y['a'] and any(z in y['d'] for z in side if z != m):
                    hits.append({**x, 'leaver': m, 'newWar': f"{y['by']} on {y['on']}", 'newA': y['a'], 'newD': y['d']})
    held = sum(sum(v for v in h['heldBefore'].values()) for h in hits)
    print(f"{f}: declarations {d['declarations']}, pairs left by the rule {len(hits)}, cells held before {held}")
    seen = set()
    for h in hits:
        k = (h['day'], h['leaver'], h['newWar'])
        if k in seen: continue
        seen.add(k)
        hb = {kk: v for kk, v in h['heldBefore'].items() if v}
        print(f"   day {h['day']}: {h['leaver']} leaves war {h['oldWar']} {h['oldSides']} on declaring with {h['newWar']} (new defenders {h['newD']}); held {hb}")
