#!/bin/bash
# Critic run 88: the every-run sim jobs (ADR-1138): the 20-year saves of plain 1938 7019 and 32019, landingFuzz on 15 new
# seeds (90 runs), and the rule checkers on new seeds (three five-year seeds a checker: diploInvariants, worldInvariants).
cd /c/Git/Warism
D=1826
(npm run sim -- --scenario 1938 --seed 7019 --years 20 --save critic/c88_seed7019_y20.bin > critic/c88_seed7019_save.log 2>&1; echo "s7019 $?" >> critic/c88_long.status) &
(npm run sim -- --scenario 1938 --seed 32019 --years 20 --save critic/c88_seed32019_y20.bin > critic/c88_seed32019_save.log 2>&1; echo "s32019 $?" >> critic/c88_long.status) &
(npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 88101 --jobs 4 > critic/c88_landingFuzz.log 2>&1; echo "fuzz $?" >> critic/c88_long.status) &
(npx tsx tools/diag/diploInvariants.ts 88001 1938 $D > critic/c88_diploinv_88001.log 2>&1; echo "dipl 88001 $?" >> critic/c88_long.status;
 npx tsx tools/diag/diploInvariants.ts 88005 1938 $D --heroes > critic/c88_diploinv_88005h.log 2>&1; echo "dipl 88005h $?" >> critic/c88_long.status) &
(npx tsx tools/diag/diploInvariants.ts 88003 random $D > critic/c88_diploinv_88003r.log 2>&1; echo "dipl 88003r $?" >> critic/c88_long.status) &
(npx tsx tools/diag/worldInvariants.ts 88051 $D > critic/c88_wi_88051.log 2>&1; echo "wi 88051 $?" >> critic/c88_long.status;
 npx tsx tools/diag/worldInvariants.ts 88055 $D --world random > critic/c88_wi_88055w.log 2>&1; echo "wi 88055w $?" >> critic/c88_long.status) &
(npx tsx tools/diag/worldInvariants.ts 88053 $D --heroes > critic/c88_wi_88053h.log 2>&1; echo "wi 88053h $?" >> critic/c88_long.status) &
wait
echo LONGDONE >> critic/c88_long.status
