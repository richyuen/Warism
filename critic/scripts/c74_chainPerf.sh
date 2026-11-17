#!/bin/sh
# Critic run 74 (focused): the performance chain, alone: it waits for the bulk sets (c74_chainBulk.sh) and the two
# afterTrack runs to end. Tick of seed 99 (5 years, pinned; the pin's game) and of the default game (heroes on),
# frames on HEAD's 7019 year-20 world, lookFps, touch, the individual tier, a five-year watch on the page; then run
# 73's 7019 year-20 save loaded on HEAD and run a year. (c74_chainP.sh, the copy of run 73's, was not used.) Guarded.
cd /c/Git/Warism
mkdir critic/c74_perf.lock 2>/dev/null || { echo "already running"; exit 0; }
until grep -q BULKDONE critic/c74_chainBulk.log 2>/dev/null && grep -q '^done' critic/c74_atx_55601.log 2>/dev/null && grep -q '^done' critic/c74_atx_37601.log 2>/dev/null; do sleep 15; done
echo "start $(date +%T)" > critic/c74_pf.status
export BASE=http://127.0.0.1:5375
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c74_tick99.log 2>&1; echo "tick $? $(date +%T)" >> critic/c74_pf.status
AFF=0xFFFF npx tsx critic/scripts/c74_heroRun.ts 99 5 - > critic/c74_tick99h.log 2>&1; echo "tickh99 $? $(date +%T)" >> critic/c74_pf.status
node critic/scripts/c74_pf_lookfps.mjs 7019 critic/c74_seed7019_y20.bin > critic/c74_pf_lookfps.log 2>&1; echo "pf $? $(date +%T)" >> critic/c74_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c74_seed7019_y20.bin critic/c74_lookfps_7019.json > critic/c74_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c74_pf.status
node critic/scripts/c74_tm_touch.mjs > critic/c74_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c74_pf.status
node critic/scripts/c74_x_indfps.mjs 32111 > critic/c74_xi.log 2>&1; echo "indfps $? $(date +%T)" >> critic/c74_pf.status
node critic/scripts/c74_long_watch2.mjs 57941 5 '&heroes=on' alone > critic/c74_lw_57941_alone.log 2>&1; echo "watch $? $(date +%T)" >> critic/c74_pf.status
npm run sim -- --scenario 1938 --seed 7019 --load critic/c73_seed7019_y20.bin --years 1 > critic/c74_loadold_7019.log 2>&1; echo "loadold $? $(date +%T)" >> critic/c74_pf.status
echo PFDONE >> critic/c74_pf.status
