#!/bin/sh
# Critic run 66: after the bulk sets, the extra queue and the page suites, alone: frame rates (year-20 7019 at every
# zoom, lookFps), touch, the tick of seed 99 (5 years) and of the replay (1938h, 5 years), pinned, the individual figures.
cd /c/Git/Warism
until grep -q BULKDONE critic/c67_chainBulk.log 2>/dev/null && [ -f critic/c67_named.done ] && [ -f critic/c67_afterStarts.done ] && grep -q SUITEB3DONE critic/c67_suiteB.log 2>/dev/null; do sleep 20; done
echo "start $(date +%T)" > critic/c67_pf.status
export BASE=http://127.0.0.1:5367
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c67_tick99.log 2>&1; echo "tick $? $(date +%T)" >> critic/c67_pf.status
npm run sim -- --scenario 1938h --seed 1938 --years 5 --affinity 0xFFFF > critic/c67_tick1938h.log 2>&1; echo "tickh $? $(date +%T)" >> critic/c67_pf.status
node critic/scripts/c67_pf_lookfps.mjs 7019 critic/c67_seed7019_y20.bin > critic/c67_pf_lookfps.log 2>&1; echo "pf $? $(date +%T)" >> critic/c67_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c67_seed7019_y20.bin critic/c67_lookfps_7019.json > critic/c67_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c67_pf.status
node critic/scripts/c67_tm_touch.mjs > critic/c67_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c67_pf.status
node critic/scripts/c67_x_indfps.mjs 32111 > critic/c67_xi.log 2>&1; echo "indfps $? $(date +%T)" >> critic/c67_pf.status
echo PFDONE >> critic/c67_pf.status
