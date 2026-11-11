#!/bin/sh
# Critic run 61: after every other job, alone: frame rates, touch, the tick.
cd /c/Git/Warism
until grep -q BULKDONE critic/c63_chainBulk.log 2>/dev/null && grep -q SUITEB2DONE critic/c63_suiteB.log 2>/dev/null; do sleep 20; done
echo "start $(date +%T)" > critic/c63_pf.status
export BASE=http://127.0.0.1:5363
node critic/scripts/c63_pf_lookfps.mjs 7019 critic/c63_seed7019_y20.bin > critic/c63_pf_lookfps.log 2>&1; echo "pf $? $(date +%T)" >> critic/c63_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c63_seed7019_y20.bin critic/c63_lookfps_7019.json > critic/c63_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c63_pf.status
# node critic/scripts/c63_heavyfps.mjs 32127 head > critic/c63_heavyfps_head.log 2>&1; echo "heavy $? $(date +%T)" >> critic/c63_pf.status (c63_heavyfps lost the fight in run 61; not run)
node critic/scripts/c63_tm_touch.mjs > critic/c63_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c63_pf.status
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c63_tick99.log 2>&1; echo "tick $? $(date +%T)" >> critic/c63_pf.status
node critic/scripts/c63_x_indfps.mjs 32111 > critic/c63_xi.log 2>&1; echo "indfps $? $(date +%T)" >> critic/c63_pf.status
echo PFDONE >> critic/c63_pf.status
