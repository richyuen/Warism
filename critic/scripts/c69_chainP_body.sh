#!/bin/sh
# Critic run 69: copied from run 68 and run as is, alone and last (the page chains, bulk sets and queue all ended first).
# Critic run 68: run 67's perf chain body (c69_chainP.sh without its gate), run once alone after a duplicate start was stopped.
# Critic run 66: after the bulk sets, the extra queue and the page suites, alone: frame rates (year-20 7019 at every
# zoom, lookFps), touch, the tick of seed 99 (5 years) and of the replay (1938h, 5 years), pinned, the individual figures.
cd /c/Git/Warism
echo "start $(date +%T)" > critic/c69_pf.status
export BASE=http://127.0.0.1:5369
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c69_tick99.log 2>&1; echo "tick $? $(date +%T)" >> critic/c69_pf.status
npm run sim -- --scenario 1938h --seed 1938 --years 5 --affinity 0xFFFF > critic/c69_tick1938h.log 2>&1; echo "tickh $? $(date +%T)" >> critic/c69_pf.status
node critic/scripts/c69_pf_lookfps.mjs 7019 critic/c69_seed7019_y20.bin > critic/c69_pf_lookfps.log 2>&1; echo "pf $? $(date +%T)" >> critic/c69_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c69_seed7019_y20.bin critic/c69_lookfps_7019.json > critic/c69_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c69_pf.status
node critic/scripts/c69_tm_touch.mjs > critic/c69_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c69_pf.status
node critic/scripts/c69_x_indfps.mjs 32111 > critic/c69_xi.log 2>&1; echo "indfps $? $(date +%T)" >> critic/c69_pf.status
echo PFDONE >> critic/c69_pf.status
