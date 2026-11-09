import json,sys
for f in sys.argv[1:]:
  d=json.load(open(f,encoding='utf-8'))
  print('==',f, 'errors',d.get('errors'))
  last=None
  for s in d['samples']:
    k=json.dumps(s.get('rows'),ensure_ascii=False)
    if k!=last: print(s.get('h'),s.get('tick'),k, json.dumps(s.get('d'),ensure_ascii=False)[:200]); last=k
