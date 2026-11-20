#!/bin/bash
# Critic run 90 (copy of run 89's): the every-run sim jobs (ADR-1138): the 20-year saves of plain 1938 7019 and 32019, landingFuzz on 15 new
# seeds (90 runs), the rule checkers on new seeds (three five-year seeds a checker: diploInvariants, worldInvariants),
# and a 13-year save of a new seed for the AI's nukes on the page.
cd /c/Git/Warism
D=1826
(npm run sim -- --scenario 1938 --seed 7019 --years 20 --save critic/c90_seed7019_y20.bin > critic/c90_seed7019_save.log 2>&1; echo "s7019 $?" >> critic/c90_long.status) &
(npm run sim -- --scenario 1938 --seed 32019 --years 20 --save critic/c90_seed32019_y20.bin > critic/c90_seed32019_save.log 2>&1; echo "s32019 $?" >> critic/c90_long.status) &
(npm run sim -- --scenario 1938 --seed 90511 --years 13 --save critic/c90_seed90511_y13.bin > critic/c90_seed90511_save.log 2>&1; echo "s90511 $?" >> critic/c90_long.status) &
(npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 90101 --jobs 4 > critic/c90_landingFuzz.log 2>&1; echo "fuzz $?" >> critic/c90_long.status) &
(npx tsx tools/diag/diploInvariants.ts 90001 1938 $D > critic/c90_diploinv_90001.log 2>&1; echo "dipl 90001 $?" >> critic/c90_long.status;
 npx tsx tools/diag/diploInvariants.ts 90005 1938 $D --heroes > critic/c90_diploinv_90005h.log 2>&1; echo "dipl 90005h $?" >> critic/c90_long.status) &
(npx tsx tools/diag/diploInvariants.ts 90003 random $D > critic/c90_diploinv_90003r.log 2>&1; echo "dipl 90003r $?" >> critic/c90_long.status) &
(npx tsx tools/diag/worldInvariants.ts 90051 $D > critic/c90_wi_90051.log 2>&1; echo "wi 90051 $?" >> critic/c90_long.status;
 npx tsx tools/diag/worldInvariants.ts 90055 $D --world random > critic/c90_wi_90055w.log 2>&1; echo "wi 90055w $?" >> critic/c90_long.status) &
(npx tsx tools/diag/worldInvariants.ts 90053 $D --heroes > critic/c90_wi_90053h.log 2>&1; echo "wi 90053h $?" >> critic/c90_long.status) &
wait
echo LONGDONE >> critic/c90_long.status
