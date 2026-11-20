#!/bin/bash
# Critic run 87: the every-run sim jobs (ADR-1138): the 20-year saves of plain 1938 7019 and 32019, landingFuzz on 15 new
# seeds (90 runs), and the rule checkers on new seeds (three five-year seeds a checker: diploInvariants, worldInvariants).
cd /c/Git/Warism
D=1826
(npm run sim -- --scenario 1938 --seed 7019 --years 20 --save critic/c87_seed7019_y20.bin > critic/c87_seed7019_save.log 2>&1; echo "s7019 $?" >> critic/c87_long.status) &
(npm run sim -- --scenario 1938 --seed 32019 --years 20 --save critic/c87_seed32019_y20.bin > critic/c87_seed32019_save.log 2>&1; echo "s32019 $?" >> critic/c87_long.status) &
(npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 87101 --jobs 4 > critic/c87_landingFuzz.log 2>&1; echo "fuzz $?" >> critic/c87_long.status) &
(npx tsx tools/diag/diploInvariants.ts 87001 1938 $D > critic/c87_diploinv_87001.log 2>&1; echo "dipl 87001 $?" >> critic/c87_long.status;
 npx tsx tools/diag/diploInvariants.ts 87005 1938 $D --heroes > critic/c87_diploinv_87005h.log 2>&1; echo "dipl 87005h $?" >> critic/c87_long.status) &
(npx tsx tools/diag/diploInvariants.ts 87003 random $D > critic/c87_diploinv_87003r.log 2>&1; echo "dipl 87003r $?" >> critic/c87_long.status) &
(npx tsx tools/diag/worldInvariants.ts 87051 $D > critic/c87_wi_87051.log 2>&1; echo "wi 87051 $?" >> critic/c87_long.status;
 npx tsx tools/diag/worldInvariants.ts 87055 $D --world random > critic/c87_wi_87055w.log 2>&1; echo "wi 87055w $?" >> critic/c87_long.status) &
(npx tsx tools/diag/worldInvariants.ts 87053 $D --heroes > critic/c87_wi_87053h.log 2>&1; echo "wi 87053h $?" >> critic/c87_long.status) &
wait
echo LONGDONE >> critic/c87_long.status
