#!/bin/sh
# Critic run 56: the rule checkers on new seeds (27201-27215), 3 at a time.
cd /c/Git/Warism
cat <<'J' | xargs -P 3 -I{} sh -c '{}'
npx tsx tools/diag/diploInvariants.ts 27201 scenario 1825 > critic/c56_diploinv_27201s_5y.log 2>&1
npx tsx tools/diag/diploInvariants.ts 27203 random 1825 --heroes > critic/c56_diploinv_27203r_h_5y.log 2>&1
npx tsx tools/diag/worldInvariants.ts 27205 365 > critic/c56_wi_27205.log 2>&1
npx tsx tools/diag/workerDeterminism.ts 27207 4380 24 critic/c56_wd_27207.json > critic/c56_wd_27207.log 2>&1
npx tsx tools/diag/seaBattles.ts 27209 scenario --years 2 --out critic/c56_sb_27209.json > critic/c56_sb_27209.log 2>&1
npx tsx tools/diag/landingRows.ts all critic/c56_lrows_all.json > critic/c56_lrows_all.log 2>&1
npx tsx tools/diag/landingInvariants.ts 27211 3517 > critic/c56_li_27211_jap.log 2>&1
npx tsx tools/diag/landingInvariants.ts 27213 15101 > critic/c56_li_27213_eng.log 2>&1
npx tsx critic/scripts/c55_repulse.ts 27215 ENG GER 1023.5,275.5 1072.5,259.5 3 critic/c56_repulse_27215.json 500 12 > critic/c56_repulse_27215.log 2>&1
J
echo done:
