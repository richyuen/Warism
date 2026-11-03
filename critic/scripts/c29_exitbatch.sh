#!/bin/sh
# Critic run 26: run 25's EXIT (day 45, 3 seeds) and COBEL on HEAD.
cd /c/Git/Warism
for s in 7019 2531 8467; do npx tsx critic/scripts/c29_exit.ts $s 45 critic/c29_exit_head_$s.json > critic/c29_exit_head_$s.log 2>&1 & done
npx tsx critic/scripts/c29_cobel.ts 7019 critic/c29_cobel_head_GER_ITA_POL.json GER ITA POL > critic/c29_cobel_head.log 2>&1 &
wait
echo EXITDONE > critic/c29_exit.done
