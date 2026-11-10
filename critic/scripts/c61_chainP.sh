#!/bin/sh
# Critic run 61: after every other job, alone: frame rates, touch, the tick.
cd /c/Git/Warism
until grep -q '^done:' critic/c61_sr.log 2>/dev/null && grep -q SUITEDDONE critic/c61_suiteD.log 2>/dev/null && grep -q '^done:' critic/c61_nv.log 2>/dev/null && grep -q QDONE critic/c61_q_R.log 2>/dev/null && grep -q QDONE critic/c61_q_nuke.log 2>/dev/null; do sleep 20; done
echo "start $(date +%T)" > critic/c61_pf.status
export BASE=http://127.0.0.1:5361
node critic/scripts/c61_pf_lookfps.mjs 7019 critic/c61_seed7019_y20.bin > critic/c61_pf_lookfps.log 2>&1; echo "pf $? $(date +%T)" >> critic/c61_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c61_seed7019_y20.bin critic/c61_lookfps_7019.json > critic/c61_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c61_pf.status
node critic/scripts/c61_heavyfps.mjs 32127 head > critic/c61_heavyfps_head.log 2>&1; echo "heavy $? $(date +%T)" >> critic/c61_pf.status
node critic/scripts/c61_tm_touch.mjs > critic/c61_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c61_pf.status
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c61_tick99.log 2>&1; echo "tick $? $(date +%T)" >> critic/c61_pf.status
node critic/scripts/c61_x_indfps.mjs 32111 > critic/c61_xi.log 2>&1; echo "indfps $? $(date +%T)" >> critic/c61_pf.status
echo PFDONE >> critic/c61_pf.status
