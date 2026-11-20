#!/bin/bash
# Critic run 89: the every-run sim jobs (ADR-1138): the 20-year saves of plain 1938 7019 and 32019, landingFuzz on 15 new
# seeds (90 runs), the rule checkers on new seeds (three five-year seeds a checker: diploInvariants, worldInvariants),
# and a 13-year save of a new seed for the AI's nukes on the page.
cd /c/Git/Warism
D=1826
(npm run sim -- --scenario 1938 --seed 7019 --years 20 --save critic/c89_seed7019_y20.bin > critic/c89_seed7019_save.log 2>&1; echo "s7019 $?" >> critic/c89_long.status) &
(npm run sim -- --scenario 1938 --seed 32019 --years 20 --save critic/c89_seed32019_y20.bin > critic/c89_seed32019_save.log 2>&1; echo "s32019 $?" >> critic/c89_long.status) &
(npm run sim -- --scenario 1938 --seed 89511 --years 13 --save critic/c89_seed89511_y13.bin > critic/c89_seed89511_save.log 2>&1; echo "s89511 $?" >> critic/c89_long.status) &
(npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 89101 --jobs 4 > critic/c89_landingFuzz.log 2>&1; echo "fuzz $?" >> critic/c89_long.status) &
(npx tsx tools/diag/diploInvariants.ts 89001 1938 $D > critic/c89_diploinv_89001.log 2>&1; echo "dipl 89001 $?" >> critic/c89_long.status;
 npx tsx tools/diag/diploInvariants.ts 89005 1938 $D --heroes > critic/c89_diploinv_89005h.log 2>&1; echo "dipl 89005h $?" >> critic/c89_long.status) &
(npx tsx tools/diag/diploInvariants.ts 89003 random $D > critic/c89_diploinv_89003r.log 2>&1; echo "dipl 89003r $?" >> critic/c89_long.status) &
(npx tsx tools/diag/worldInvariants.ts 89051 $D > critic/c89_wi_89051.log 2>&1; echo "wi 89051 $?" >> critic/c89_long.status;
 npx tsx tools/diag/worldInvariants.ts 89055 $D --world random > critic/c89_wi_89055w.log 2>&1; echo "wi 89055w $?" >> critic/c89_long.status) &
(npx tsx tools/diag/worldInvariants.ts 89053 $D --heroes > critic/c89_wi_89053h.log 2>&1; echo "wi 89053h $?" >> critic/c89_long.status) &
wait
echo LONGDONE >> critic/c89_long.status
