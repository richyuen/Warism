#!/bin/sh
# Critic run 87: the performance chain (src/ changed: R200 to R202), alone on a quiet machine: it waits for the long sim
# jobs and every lane of this run to end. Run 85's chain (c85_chainPerf2.sh) on HEAD's build (critic/c87_dist, 5421).
# Gate: it also waits for critic/c87_go.flag (touch it to start); remove critic/c87_perf.lock and the flag before a re-run.
cd /c/Git/Warism
mkdir critic/c87_perf.lock 2>/dev/null || { echo "already running"; exit 0; }
until grep -q LONGDONE critic/c87_long.status 2>/dev/null && [ -f critic/c87_laneA.done ] && [ -f critic/c87_laneB.done ] && [ -f critic/c87_laneC.done ] && [ -f critic/c87_laneD.done ] && [ -f critic/c87_laneE.done ] && [ -f critic/c87_laneM.done ] && [ -f critic/c87_laneW.done ] && [ -f critic/c87_go.flag ]; do sleep 15; done
echo "start $(date +%T)" > critic/c87_pf.status
export BASE=http://127.0.0.1:5421
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c87_tick99.log 2>&1; echo "tick $? $(date +%T)" >> critic/c87_pf.status
AFF=0xFFFF npx tsx critic/scripts/c77_heroRun.ts 99 5 - > critic/c87_tick99h.log 2>&1; echo "tickh99 $? $(date +%T)" >> critic/c87_pf.status
TAG=_c87 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c87_seed7019_y20.bin > critic/c87_pf_lookfps.log 2>&1; echo "pf $? $(date +%T)" >> critic/c87_pf.status
TAG=_c87qhd VW=2560 VH=1440 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c87_seed7019_y20.bin > critic/c87_pf_lookfps_qhd.log 2>&1; echo "pf qhd $? $(date +%T)" >> critic/c87_pf.status
TAG=_c874k VW=3840 VH=2160 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c87_seed7019_y20.bin > critic/c87_pf_lookfps_4k.log 2>&1; echo "pf 4k $? $(date +%T)" >> critic/c87_pf.status
TAG=_c87h node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c79_hseed7019_y20.bin > critic/c87_pf_lookfps_h.log 2>&1; echo "pf heroes $? $(date +%T)" >> critic/c87_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c87_seed7019_y20.bin critic/c87_lookfps_7019.json > critic/c87_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c87_pf.status
node critic/scripts/c85_tm_touch.mjs > critic/c87_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c87_pf.status
node critic/scripts/c85_x_indfps.mjs 64111 > critic/c87_xi.log 2>&1; echo "indfps $? $(date +%T)" >> critic/c87_pf.status
timeout 3600 node critic/scripts/c85_long_watch2.mjs 64945 12 '&heroes=on' alone > critic/c87_lw_64945_alone.log 2>&1; echo "watch $? $(date +%T)" >> critic/c87_pf.status
npm run sim -- --scenario 1938 --seed 7019 --load critic/c79_seed7019_y20.bin --years 1 > critic/c87_loadold_7019.log 2>&1; echo "loadold $? $(date +%T)" >> critic/c87_pf.status
node critic/scripts/c85_tlMore.mjs old critic/c87_seed7019_y20.bin 1 > critic/c87_tm_lapse20.log 2>&1; echo "lapse20 $? $(date +%T)" >> critic/c87_pf.status
echo PFDONE >> critic/c87_pf.status
