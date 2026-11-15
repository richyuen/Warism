#!/bin/sh
# Critic run 72: the performance chain alone and last: tick of seed 99 (5 years, pinned; the pin's game) and of the default
# game (heroes on, c72_heroRun, pinned), the replay's tick, frames on 7019's year-20 world (plain and heroes), lookFps,
# touch, the individual figures.
cd /c/Git/Warism
until grep -q BULKDONE critic/c72_chainBulk.log 2>/dev/null && [ -f critic/c72_named.done ] && [ -f critic/c72_startsjobs.done ] && [ -f critic/c72_afterStarts.done ] && grep -q PAGESCDONE critic/c72_pagesC.log 2>/dev/null; do sleep 20; done
echo "start $(date +%T)" > critic/c72_pf.status
export BASE=http://127.0.0.1:5372
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c72_tick99.log 2>&1; echo "tick $? $(date +%T)" >> critic/c72_pf.status
AFF=0xFFFF npx tsx critic/scripts/c72_heroRun.ts 99 5 - > critic/c72_tick99h.log 2>&1; echo "tickh99 $? $(date +%T)" >> critic/c72_pf.status
AFF=0xFFFF npx tsx critic/scripts/c72_heroRun.ts 99 5 - off > critic/c72_tick99off.log 2>&1; echo "tick99off $? $(date +%T)" >> critic/c72_pf.status
npm run sim -- --scenario 1938h --seed 1938 --years 5 --affinity 0xFFFF > critic/c72_tick1938h.log 2>&1; echo "tickh $? $(date +%T)" >> critic/c72_pf.status
node critic/scripts/c72_pf_lookfps.mjs 7019 critic/c72_seed7019_y20.bin > critic/c72_pf_lookfps.log 2>&1; echo "pf $? $(date +%T)" >> critic/c72_pf.status
TAG=h node critic/scripts/c72_pf_lookfps.mjs 7019 critic/c72_hseed7019_y20.bin > critic/c72_pf_lookfps_h.log 2>&1; echo "pfh $? $(date +%T)" >> critic/c72_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c72_seed7019_y20.bin critic/c72_lookfps_7019.json > critic/c72_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c72_pf.status
node critic/scripts/c72_tm_touch.mjs > critic/c72_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c72_pf.status
node critic/scripts/c72_x_indfps.mjs 32111 > critic/c72_xi.log 2>&1; echo "indfps $? $(date +%T)" >> critic/c72_pf.status
echo PFDONE >> critic/c72_pf.status
