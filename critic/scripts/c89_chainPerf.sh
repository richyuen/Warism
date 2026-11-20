#!/bin/sh
# Critic run 89 (copy of run 88's): the performance chain (src/ changed: R209), alone on a quiet machine: it waits for the long sim
# jobs and every lane of this run to end, and for critic/c89_go.flag (touch it to start; remove critic/c89_perf.lock and
# the flag before a re-run). HEAD's build (critic/c89_dist, 5441). The page's frames at the supported desk, 2560 x 1305
# (ADR-1141; it was three sizes), plain and with heroes; the tick of seed 99; the long watch.
cd /c/Git/Warism
mkdir critic/c89_perf.lock 2>/dev/null || { echo "already running"; exit 0; }
until grep -q LONGDONE critic/c89_long.status 2>/dev/null && [ -f critic/c89_laneA.done ] && [ -f critic/c89_laneB.done ] && [ -f critic/c89_laneC.done ] && [ -f critic/c89_laneE.done ] && [ -f critic/c89_laneM.done ] && [ -f critic/c89_laneN.done ] && [ -f critic/c89_laneS.done ] && [ -f critic/c89_laneT.done ] && [ -f critic/c89_laneV.done ] && [ -f critic/c89_laneW.done ] && [ -f critic/c89_jobsH.done ] && [ -f critic/c89_laneX.done ] && [ -f critic/c89_go.flag ]; do sleep 15; done
echo "start $(date +%T)" > critic/c89_pf.status
export BASE=http://127.0.0.1:5441
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c89_tick99.log 2>&1; echo "tick $? $(date +%T)" >> critic/c89_pf.status
AFF=0xFFFF npx tsx critic/scripts/c77_heroRun.ts 99 5 - > critic/c89_tick99h.log 2>&1; echo "tickh99 $? $(date +%T)" >> critic/c89_pf.status
TAG=_c88w VW=2560 VH=1305 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c89_seed7019_y20.bin > critic/c89_pf_lookfps_w.log 2>&1; echo "pf 2560x1305 $? $(date +%T)" >> critic/c89_pf.status
TAG=_c88wh VW=2560 VH=1305 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c79_hseed7019_y20.bin > critic/c89_pf_lookfps_wh.log 2>&1; echo "pf 2560x1305 heroes $? $(date +%T)" >> critic/c89_pf.status
TAG=_c88qhd VW=2560 VH=1440 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c89_seed7019_y20.bin > critic/c89_pf_lookfps_qhd.log 2>&1; echo "pf qhd (run 87's size, to compare) $? $(date +%T)" >> critic/c89_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c89_seed7019_y20.bin critic/c89_lookfps_7019.json > critic/c89_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c89_pf.status
node critic/scripts/c85_tm_touch.mjs > critic/c89_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c89_pf.status
node critic/scripts/c85_x_indfps.mjs 64111 > critic/c89_xi.log 2>&1; echo "indfps $? $(date +%T)" >> critic/c89_pf.status
VW=2560 VH=1305 timeout 3600 node critic/scripts/c85_long_watch2.mjs 89945 12 '&heroes=on' alone > critic/c89_lw_88945_alone.log 2>&1; echo "watch $? $(date +%T)" >> critic/c89_pf.status
npm run sim -- --scenario 1938 --seed 7019 --load critic/c79_seed7019_y20.bin --years 1 > critic/c89_loadold_7019.log 2>&1; echo "loadold $? $(date +%T)" >> critic/c89_pf.status
node critic/scripts/c85_tlMore.mjs old critic/c89_seed7019_y20.bin 1 > critic/c89_tm_lapse20.log 2>&1; echo "lapse20 $? $(date +%T)" >> critic/c89_pf.status
echo PFDONE >> critic/c89_pf.status
