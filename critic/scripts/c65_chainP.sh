#!/bin/sh
# Critic run 65: after the bulk sets and the page suites, alone: frame rates (year-20 7019 at every zoom, lookFps),
# touch, the individual figures, the tick of seed 99 (5 years) and of the replay (1938h, 3 years), pinned.
cd /c/Git/Warism
until grep -q BULKDONE critic/c65_chainBulk.log 2>/dev/null && [ -f critic/c65_chainE.done ] && [ -f critic/c65_at.done ] && [ $(ls critic/c65_nc/*.log | xargs grep -l "y22" | wc -l) -ge 3 ] && grep -q -E "^done|1945-0[5-9]" critic/c65_tf_37701.log; do sleep 20; done
echo "start $(date +%T)" > critic/c65_pf.status
export BASE=http://127.0.0.1:5365
node critic/scripts/c65_pf_lookfps.mjs 7019 critic/c65_seed7019_y20.bin > critic/c65_pf_lookfps.log 2>&1; echo "pf $? $(date +%T)" >> critic/c65_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c65_seed7019_y20.bin critic/c65_lookfps_7019.json > critic/c65_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c65_pf.status
node critic/scripts/c65_tm_touch.mjs > critic/c65_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c65_pf.status
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c65_tick99.log 2>&1; echo "tick $? $(date +%T)" >> critic/c65_pf.status
npm run sim -- --scenario 1938h --seed 1938 --years 5 --affinity 0xFFFF > critic/c65_tick1938h.log 2>&1; echo "tickh $? $(date +%T)" >> critic/c65_pf.status
node critic/scripts/c65_x_indfps.mjs 32111 > critic/c65_xi.log 2>&1; echo "indfps $? $(date +%T)" >> critic/c65_pf.status
echo PFDONE >> critic/c65_pf.status
