#!/bin/sh
# Critic run 88: the performance chain (src/ changed: R203 to R208), alone on a quiet machine: it waits for the long sim
# jobs and every lane of this run to end, and for critic/c88_go.flag (touch it to start; remove critic/c88_perf.lock and
# the flag before a re-run). HEAD's build (critic/c88_dist, 5431). The page's frames at the supported desk, 2560 x 1305
# (ADR-1141; it was three sizes), plain and with heroes; the tick of seed 99; the long watch.
cd /c/Git/Warism
mkdir critic/c88_perf.lock 2>/dev/null || { echo "already running"; exit 0; }
until grep -q LONGDONE critic/c88_long.status 2>/dev/null && [ -f critic/c88_laneA.done ] && [ -f critic/c88_laneB.done ] && [ -f critic/c88_laneC.done ] && [ -f critic/c88_laneE.done ] && [ -f critic/c88_laneM.done ] && [ -f critic/c88_laneN.done ] && [ -f critic/c88_laneZ.done ] && [ -f critic/c88_laneX.done ] && [ -f critic/c88_go.flag ]; do sleep 15; done
echo "start $(date +%T)" > critic/c88_pf.status
export BASE=http://127.0.0.1:5431
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c88_tick99.log 2>&1; echo "tick $? $(date +%T)" >> critic/c88_pf.status
AFF=0xFFFF npx tsx critic/scripts/c77_heroRun.ts 99 5 - > critic/c88_tick99h.log 2>&1; echo "tickh99 $? $(date +%T)" >> critic/c88_pf.status
TAG=_c88w VW=2560 VH=1305 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c88_seed7019_y20.bin > critic/c88_pf_lookfps_w.log 2>&1; echo "pf 2560x1305 $? $(date +%T)" >> critic/c88_pf.status
TAG=_c88wh VW=2560 VH=1305 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c79_hseed7019_y20.bin > critic/c88_pf_lookfps_wh.log 2>&1; echo "pf 2560x1305 heroes $? $(date +%T)" >> critic/c88_pf.status
TAG=_c88qhd VW=2560 VH=1440 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c88_seed7019_y20.bin > critic/c88_pf_lookfps_qhd.log 2>&1; echo "pf qhd (run 87's size, to compare) $? $(date +%T)" >> critic/c88_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c88_seed7019_y20.bin critic/c88_lookfps_7019.json > critic/c88_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c88_pf.status
node critic/scripts/c85_tm_touch.mjs > critic/c88_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c88_pf.status
node critic/scripts/c85_x_indfps.mjs 64111 > critic/c88_xi.log 2>&1; echo "indfps $? $(date +%T)" >> critic/c88_pf.status
VW=2560 VH=1305 timeout 3600 node critic/scripts/c85_long_watch2.mjs 88945 12 '&heroes=on' alone > critic/c88_lw_88945_alone.log 2>&1; echo "watch $? $(date +%T)" >> critic/c88_pf.status
npm run sim -- --scenario 1938 --seed 7019 --load critic/c79_seed7019_y20.bin --years 1 > critic/c88_loadold_7019.log 2>&1; echo "loadold $? $(date +%T)" >> critic/c88_pf.status
node critic/scripts/c85_tlMore.mjs old critic/c88_seed7019_y20.bin 1 > critic/c88_tm_lapse20.log 2>&1; echo "lapse20 $? $(date +%T)" >> critic/c88_pf.status
echo PFDONE >> critic/c88_pf.status
