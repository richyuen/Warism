#!/bin/sh
# Critic run 90: the heroes arm of the frames at 2560 x 1305 (run 79's 7019 year-20 save with heroes, the battle spot),
# run 89's build (f27f48f5, critic/c90_olddist on 5452) and HEAD's (5451) one after the other, alone, twice, swapped;
# then the tick of seed 99 (plain and with heroes) on both commits at the same time on separate cores (the worktree
# critic/wt at f27f48f5). HEAD showed one sample of 52 fps at 1,200 m/px in two runs where run 89 showed 58.9.
cd /c/Git/Warism
for o in old head head old; do
  if [ $o = old ]; then B=http://127.0.0.1:5452; else B=http://127.0.0.1:5451; fi
  BASE=$B TAG=_c90ab$o VW=2560 VH=1305 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c79_hseed7019_y20.bin > critic/c90_pfab_${o}_$(date +%H%M%S).log 2>&1; echo "pf $o $?"
done
(cd critic/wt && AFF=0x00FF npx tsx critic/scripts/c77_heroRun.ts 99 5 - > ../c90_tickab_old_h.log 2>&1) &
(AFF=0xFF00 npx tsx critic/scripts/c77_heroRun.ts 99 5 - > critic/c90_tickab_head_h.log 2>&1) &
wait
(cd critic/wt && npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0x00FF > ../c90_tickab_old.log 2>&1) &
(npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFF00 > critic/c90_tickab_head.log 2>&1) &
wait
echo ABDONE
