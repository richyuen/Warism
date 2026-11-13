#!/bin/sh
# Critic run 66: after the bulk sets, the extra queue and the page suites, alone: frame rates (year-20 7019 at every
# zoom, lookFps), touch, the tick of seed 99 (5 years) and of the replay (1938h, 5 years), pinned, the individual figures.
cd /c/Git/Warism
until grep -q BULKDONE critic/c66_chainBulk.log 2>/dev/null && [ -f critic/c66_extra.done ] && grep -q PAGES2DONE critic/c66_suite2.log 2>/dev/null; do sleep 20; done
echo "start $(date +%T)" > critic/c66_pf.status
export BASE=http://127.0.0.1:5366
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c66_tick99.log 2>&1; echo "tick $? $(date +%T)" >> critic/c66_pf.status
npm run sim -- --scenario 1938h --seed 1938 --years 5 --affinity 0xFFFF > critic/c66_tick1938h.log 2>&1; echo "tickh $? $(date +%T)" >> critic/c66_pf.status
node critic/scripts/c66_pf_lookfps.mjs 7019 critic/c66_seed7019_y20.bin > critic/c66_pf_lookfps.log 2>&1; echo "pf $? $(date +%T)" >> critic/c66_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c66_seed7019_y20.bin critic/c66_lookfps_7019.json > critic/c66_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c66_pf.status
node critic/scripts/c66_tm_touch.mjs > critic/c66_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c66_pf.status
node critic/scripts/c66_x_indfps.mjs 32111 > critic/c66_xi.log 2>&1; echo "indfps $? $(date +%T)" >> critic/c66_pf.status
echo PFDONE >> critic/c66_pf.status
