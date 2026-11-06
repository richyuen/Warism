import json,glob,sys,re
pat=sys.argv[1] if len(sys.argv)>1 else '../c43_k_*.json'
for f in sorted(glob.glob(pat)):
    d=json.load(open(f,encoding='utf-8'))
    ev=d.get('events',[])
    notes=[e for e in ev if 'LeftLanding' in e or 'MoveRejected' in e or 'Destroyed' in e]
    print(f.split('/')[-1], 'ids',d['ids'],'landed',{k:v[0] for k,v in d['landed'].items()}, 'notes',notes[:6])
    print('   end',d['end'])
