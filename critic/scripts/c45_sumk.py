import json,glob,os,re,sys
def summ(f):
    try: d=json.load(open(f,encoding='utf-8'))
    except Exception as e: return 'ERR '+str(e)[:80]
    ev=[e for e in d.get('events',[]) if ('MoveRejected' in e or 'LeftLanding' in e)]
    rej=sorted(set(re.sub(r' x.*','',e.split(' ',1)[1]) for e in ev))
    L=d.get('landed',{})
    land=' '.join(f"{k}:h{v[0]}@{v[1]:.0f},{v[2]:.0f}" for k,v in sorted(L.items()))
    ids=d.get('ids',[]); dead=[x for x in d.get('end',[]) if 'dead' in x]
    notl=[str(i) for i in (ids+([d['fresh']] if 'fresh' in d else [])) if str(i) not in L]
    return f"landed[{land}] notLanded{notl} rej{rej[:6]}{' DEAD'+str(dead) if dead else ''}"
pat=sys.argv[1]
for f in sorted(glob.glob(pat)):
    b=os.path.basename(f); old='critic/'+b.replace('c45_','c43_',1)
    print('==',b); print('   HEAD ',summ(f))
    if os.path.exists(old): print('   c43  ',summ(old))
