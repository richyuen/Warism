#!/bin/sh
# Critic run 80 (full; copy of run 77's): the performance chain, alone: it waits for every lane, the named chain, the fuzz
# and the starts chain to end. Tick of seed 99 (5 years, the pin's game) and of the default game (heroes on); frames on
# HEAD's 7019 year-20 world at three sizes and with heroes; lookFps; touch; the individual tier; a 12-year watch on the
# page alone; run 79s 7019 year-20 save loaded on HEAD and run a year; the time-lapse of a 20-year record. Guarded.
cd /c/Git/Warism
mkdir critic/c80_perf.lock 2>/dev/null || { echo "already running"; exit 0; }
until [ -f critic/c80_laneA.done ] && [ -f critic/c80_laneB.done ] && [ -f critic/c80_laneC.done ] && [ -f critic/c80_laneD.done ] && [ -f critic/c80_fuzz.done ] && [ -f critic/c80_chainS.done ] && [ -f critic/c80_bulk.done ] && [ -f critic/c80_fixups.done ]; do sleep 15; done
echo "start $(date +%T)" > critic/c80_pf.status
export BASE=http://127.0.0.1:5401
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c80_tick99.log 2>&1; echo "tick $? $(date +%T)" >> critic/c80_pf.status
AFF=0xFFFF npx tsx critic/scripts/c77_heroRun.ts 99 5 - > critic/c80_tick99h.log 2>&1; echo "tickh99 $? $(date +%T)" >> critic/c80_pf.status
node critic/scripts/c80_pf_lookfps.mjs 7019 critic/c80_seed7019_y20.bin > critic/c80_pf_lookfps.log 2>&1; echo "pf $? $(date +%T)" >> critic/c80_pf.status
TAG=_qhd VW=2560 VH=1440 node critic/scripts/c80_pf_lookfps.mjs 7019 critic/c80_seed7019_y20.bin > critic/c80_pf_lookfps_qhd.log 2>&1; echo "pf qhd $? $(date +%T)" >> critic/c80_pf.status
TAG=_4k VW=3840 VH=2160 node critic/scripts/c80_pf_lookfps.mjs 7019 critic/c80_seed7019_y20.bin > critic/c80_pf_lookfps_4k.log 2>&1; echo "pf 4k $? $(date +%T)" >> critic/c80_pf.status
TAG=_h node critic/scripts/c80_pf_lookfps.mjs 7019 critic/c80_hseed7019_y20.bin > critic/c80_pf_lookfps_h.log 2>&1; echo "pf heroes $? $(date +%T)" >> critic/c80_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c80_seed7019_y20.bin critic/c80_lookfps_7019.json > critic/c80_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c80_pf.status
node critic/scripts/c80_tm_touch.mjs > critic/c80_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c80_pf.status
node critic/scripts/c80_x_indfps.mjs 64111 > critic/c80_xi.log 2>&1; echo "indfps $? $(date +%T)" >> critic/c80_pf.status
timeout 3600 node critic/scripts/c80_long_watch2.mjs 64945 12 '&heroes=on' alone > critic/c80_lw_64945_alone.log 2>&1; echo "watch $? $(date +%T)" >> critic/c80_pf.status
npm run sim -- --scenario 1938 --seed 7019 --load critic/c79_seed7019_y20.bin --years 1 > critic/c80_loadold_7019.log 2>&1; echo "loadold $? $(date +%T)" >> critic/c80_pf.status
node critic/scripts/c80_tlMore.mjs old critic/c80_seed7019_y20.bin 1 > critic/c80_tm_lapse20.log 2>&1; echo "lapse20 $? $(date +%T)" >> critic/c80_pf.status
echo PFDONE >> critic/c80_pf.status
