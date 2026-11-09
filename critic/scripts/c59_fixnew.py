p = r'C:\Git\Warism\critic\scripts\c59_new.mjs'
s = open(p, encoding='utf-8', newline='').read()
bad = '/Click the start[^\n]*/'
print(s.count(bad))
s = s.replace(bad, '/Click the start[^\\n]*/')
open(p, 'w', encoding='utf-8', newline='').write(s)
