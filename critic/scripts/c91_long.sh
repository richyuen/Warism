#!/bin/bash
# Critic run 91 (copy of run 90's): the every-run sim jobs (ADR-1138): the 20-year saves of plain 1938 7019 and 32019, landingFuzz on 15 new
# seeds (90 runs), the rule checkers on new seeds (three five-year seeds a checker: diploInvariants, worldInvariants),
# and a 13-year save of a new seed for the AI's nukes on the page.
cd /c/Git/Warism
D=1826
(npm run sim -- --scenario 1938 --seed 7019 --years 20 --save critic/c91_seed7019_y20.bin > critic/c91_seed7019_save.log 2>&1; echo "s7019 $?" >> critic/c91_long.status) &
(npm run sim -- --scenario 1938 --seed 32019 --years 20 --save critic/c91_seed32019_y20.bin > critic/c91_seed32019_save.log 2>&1; echo "s32019 $?" >> critic/c91_long.status) &
(npm run sim -- --scenario 1938 --seed 91511 --years 13 --save critic/c91_seed91511_y13.bin > critic/c91_seed91511_save.log 2>&1; echo "s91511 $?" >> critic/c91_long.status) &
(npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 91101 --jobs 4 > critic/c91_landingFuzz.log 2>&1; echo "fuzz $?" >> critic/c91_long.status) &
(npx tsx tools/diag/diploInvariants.ts 91001 1938 $D > critic/c91_diploinv_91001.log 2>&1; echo "dipl 91001 $?" >> critic/c91_long.status;
 npx tsx tools/diag/diploInvariants.ts 91005 1938 $D --heroes > critic/c91_diploinv_91005h.log 2>&1; echo "dipl 90005h $?" >> critic/c91_long.status) &
(npx tsx tools/diag/diploInvariants.ts 91003 random $D > critic/c91_diploinv_91003r.log 2>&1; echo "dipl 90003r $?" >> critic/c91_long.status) &
(npx tsx tools/diag/worldInvariants.ts 91051 $D > critic/c91_wi_91051.log 2>&1; echo "wi 91051 $?" >> critic/c91_long.status;
 npx tsx tools/diag/worldInvariants.ts 91055 $D --world random > critic/c91_wi_91055w.log 2>&1; echo "wi 90055w $?" >> critic/c91_long.status) &
(npx tsx tools/diag/worldInvariants.ts 91053 $D --heroes > critic/c91_wi_91053h.log 2>&1; echo "wi 90053h $?" >> critic/c91_long.status) &
(for n in 3 2; do for s in 91601 91603; do npx tsx critic/scripts/c90_diploN.ts $s $n $D > critic/c91_diploN${n}_$s.log 2>&1; echo "diploN $n $s $?" >> critic/c91_long.status; done; done) &
wait
echo LONGDONE >> critic/c91_long.status
