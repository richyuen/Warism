import json,sys,os
for f in sys.argv[1:]:
    if not os.path.exists(f): print('missing',f); continue
    d=json.load(open(f,encoding='utf-8')); ys=d['years']
    print(f, 'years',len(ys),'fps',min(y['fps'] for y in ys),'-',max(y['fps'] for y in ys),'maxGap',max(y['maxGap'] for y in ys),'over500',sum(y['over500'] for y in ys),'errors',d['errors'][:2])
