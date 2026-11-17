# Critic run 75: the job lists from run 74's: its new-seed family 57xxx becomes 58xxx (logs named by the true seed),
# its named seeds kept; run 74's own new-seed cases that carried a finding are appended as named.
import io, re
def conv(line):
    if re.search(r' 57\d{3}', line) and 'massTold' not in line:
        line = re.sub(r'\b57(\d{3})\b', r'58\1', line)
        line = re.sub(r'(critic/c75_[A-Za-z0-9]+_(?:[a-z0-9]+_)?)5[67](\d{3}|\b)', lambda m: m.group(1) + '58' + m.group(2), line)
    return line
for name in ['c75_jobsAll.txt', 'c75_startsJobs.txt']:
    p = 'critic/scripts/' + name
    lines = io.open(p, encoding='utf-8', newline='').read().replace('\r', '').split('\n')
    out = [conv(l) for l in lines if l.strip()]
    if name == 'c75_jobsAll.txt':
        out += [
            'npx tsx tools/diag/warOpening.ts critic/c75_warOpening_57.json --years 3 57211 57213 57215 > critic/c75_warOpening_57.log 2>&1',
            'npx tsx tools/diag/fewNationWars.ts 3 57401 6 10 > critic/c75_few3_57.log 2>&1',
            'npx tsx critic/scripts/c75_massTold.ts 3 56211 57611 57613 > critic/c75_massTold_a.log 2>&1',
            'npx tsx critic/scripts/c75_massTold.ts 3 57615 57617 57619 > critic/c75_massTold_b.log 2>&1',
            'npx tsx critic/scripts/c75_massTold.ts 3 58611 58613 58615 > critic/c75_massTold_n1.log 2>&1',
            'npx tsx critic/scripts/c75_massTold.ts 3 58617 58619 58621 > critic/c75_massTold_n2.log 2>&1',
            'npx tsx critic/scripts/c75_massTold.ts 10 --random 3 55406 53401 > critic/c75_massTold_r3.log 2>&1',
            'npx tsx critic/scripts/c75_massTold.ts 3 --saveload 57621 58623 > critic/c75_massTold_sl.log 2>&1',
            'npx tsx tools/diag/diploInvariants.ts 57001 scenario 1825 > critic/c75_diploinv_57001s.log 2>&1',
            'npx tsx tools/diag/worldInvariants.ts 57051 1825 > critic/c75_wi_57051.log 2>&1',
        ]
    else:
        out = [l.replace('critic/c73_starts', 'critic/c74_starts') for l in out]
    io.open(p, 'w', encoding='utf-8', newline='').write('\n'.join(out) + '\n')
