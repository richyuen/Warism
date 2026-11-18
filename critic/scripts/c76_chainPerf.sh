#!/bin/sh
# Critic run 76 (focused; copy of run 75): the performance chain, alone: it waits for the bulk sets (c76_chainBulk.sh) and the two
# afterTrack runs to end. Tick of seed 99 (5 years, pinned; the pin's game) and of the default game (heroes on),
# frames on HEAD's 7019 year-20 world, lookFps, touch, the individual tier, a five-year watch on the page; then run
# 73's 7019 year-20 save loaded on HEAD and run a year. (c76_chainP.sh, the copy of run 73's, was not used.) Guarded.
cd /c/Git/Warism
mkdir critic/c76_perf.lock 2>/dev/null || { echo "already running"; exit 0; }
until [ -f critic/c76_fuzz.done ] && [ -f critic/c76_laneC.done ] && grep -q BULKDONE critic/c76_chainBulk.log 2>/dev/null && grep -q '^done' critic/c76_atx_55601.log 2>/dev/null && grep -q '^done' critic/c76_atx_37601.log 2>/dev/null; do sleep 15; done
echo "start $(date +%T)" > critic/c76_pf.status
export BASE=http://127.0.0.1:5399
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c76_tick99.log 2>&1; echo "tick $? $(date +%T)" >> critic/c76_pf.status
AFF=0xFFFF npx tsx critic/scripts/c76_heroRun.ts 99 5 - > critic/c76_tick99h.log 2>&1; echo "tickh99 $? $(date +%T)" >> critic/c76_pf.status
node critic/scripts/c76_pf_lookfps.mjs 7019 critic/c76_seed7019_y20.bin > critic/c76_pf_lookfps.log 2>&1; echo "pf $? $(date +%T)" >> critic/c76_pf.status
TAG=_qhd VW=2560 VH=1440 node critic/scripts/c76_pf_lookfps.mjs 7019 critic/c76_seed7019_y20.bin > critic/c76_pf_lookfps_qhd.log 2>&1; echo "pf qhd $? $(date +%T)" >> critic/c76_pf.status
TAG=_4k VW=3840 VH=2160 node critic/scripts/c76_pf_lookfps.mjs 7019 critic/c76_seed7019_y20.bin > critic/c76_pf_lookfps_4k.log 2>&1; echo "pf 4k $? $(date +%T)" >> critic/c76_pf.status
TAG=_h node critic/scripts/c76_pf_lookfps.mjs 7019 critic/c76_hseed7019_y20.bin > critic/c76_pf_lookfps_h.log 2>&1; echo "pf heroes $? $(date +%T)" >> critic/c76_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c76_seed7019_y20.bin critic/c76_lookfps_7019.json > critic/c76_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c76_pf.status
node critic/scripts/c76_tm_touch.mjs > critic/c76_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c76_pf.status
node critic/scripts/c76_x_indfps.mjs 32111 > critic/c76_xi.log 2>&1; echo "indfps $? $(date +%T)" >> critic/c76_pf.status
node critic/scripts/c76_long_watch2.mjs 58941 12 '&heroes=on' alone > critic/c76_lw_58941_alone.log 2>&1; echo "watch $? $(date +%T)" >> critic/c76_pf.status
npm run sim -- --scenario 1938 --seed 7019 --load critic/c75_seed7019_y20.bin --years 1 > critic/c76_loadold_7019.log 2>&1; echo "loadold $? $(date +%T)" >> critic/c76_pf.status
node critic/scripts/c76_tlMore.mjs old critic/c76_seed7019_y20.bin 1 > critic/c76_tm_lapse20.log 2>&1; echo "lapse20 $? $(date +%T)" >> critic/c76_pf.status
echo PFDONE >> critic/c76_pf.status
