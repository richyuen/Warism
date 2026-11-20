#!/bin/sh
# Critic run 91 (copy of run 90's): the performance chain (the rotation, ADR-1147; R220's AT is its heroes arm, run twice), alone on a quiet machine: it waits for critic/c91_go.flag, touched by hand once
# every other job of this run has ended or is paused (critic/c91_stop.flag), and for nothing else; critic/c91_go.flag (touch it to start; remove critic/c91_perf.lock and
# the flag before a re-run). HEAD's build (critic/c91_dist, 5491). The page's frames at the supported desk, 2560 x 1305
# (ADR-1141; it was three sizes), plain and with heroes; the tick of seed 99; the long watch.
cd /c/Git/Warism
mkdir critic/c91_perf.lock 2>/dev/null || { echo "already running"; exit 0; }
until [ -f critic/c91_go.flag ]; do sleep 15; done
echo "start $(date +%T)" > critic/c91_pf.status
export BASE=http://127.0.0.1:5491
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c91_tick99.log 2>&1; echo "tick $? $(date +%T)" >> critic/c91_pf.status
AFF=0xFFFF npx tsx critic/scripts/c77_heroRun.ts 99 5 - > critic/c91_tick99h.log 2>&1; echo "tickh99 $? $(date +%T)" >> critic/c91_pf.status
TAG=_c88w VW=2560 VH=1305 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c91_seed7019_y20.bin > critic/c91_pf_lookfps_w.log 2>&1; echo "pf 2560x1305 $? $(date +%T)" >> critic/c91_pf.status
TAG=_c88wh VW=2560 VH=1305 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c79_hseed7019_y20.bin > critic/c91_pf_lookfps_wh.log 2>&1; echo "pf 2560x1305 heroes $? $(date +%T)" >> critic/c91_pf.status
TAG=_c88wh2 VW=2560 VH=1305 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c79_hseed7019_y20.bin > critic/c91_pf_lookfps_wh2.log 2>&1; echo "pf 2560x1305 heroes again (R220 AT) $? $(date +%T)" >> critic/c91_pf.status
TAG=_c88w89 VW=2560 VH=1305 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c89_seed7019_y20.bin > critic/c91_pf_lookfps_w89save.log 2>&1; echo "pf plain run 89 save $? $(date +%T)" >> critic/c91_pf.status
TAG=_c88qhd VW=2560 VH=1440 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c91_seed7019_y20.bin > critic/c91_pf_lookfps_qhd.log 2>&1; echo "pf qhd (run 87's size, to compare) $? $(date +%T)" >> critic/c91_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c91_seed7019_y20.bin critic/c91_lookfps_7019.json > critic/c91_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c91_pf.status
node critic/scripts/c85_tm_touch.mjs > critic/c91_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c91_pf.status
node critic/scripts/c85_x_indfps.mjs 64111 > critic/c91_xi.log 2>&1; echo "indfps $? $(date +%T)" >> critic/c91_pf.status
VW=2560 VH=1305 timeout 3600 node critic/scripts/c85_long_watch2.mjs 91945 12 '&heroes=on' alone > critic/c91_lw_91945_alone.log 2>&1; echo "watch $? $(date +%T)" >> critic/c91_pf.status
npm run sim -- --scenario 1938 --seed 7019 --load critic/c79_seed7019_y20.bin --years 1 > critic/c91_loadold_7019.log 2>&1; echo "loadold $? $(date +%T)" >> critic/c91_pf.status
node critic/scripts/c85_tlMore.mjs old critic/c91_seed7019_y20.bin 1 > critic/c91_tm_lapse20.log 2>&1; echo "lapse20 $? $(date +%T)" >> critic/c91_pf.status
echo PFDONE >> critic/c91_pf.status
