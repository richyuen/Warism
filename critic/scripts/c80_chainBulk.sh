#!/bin/sh
# Critic run 80 (full; copy of run 77's): run 61's bulk landing sets, due because the sim changed since run 79's commit
# (src/sim/ai/strategic.ts, ADR-917/959): 396 named setups, 153 stuck-return runs, 168 next-voyage runs, 4 at a time;
# then Malta's 18 on the page (HEAD's build on 5401) and the comparison with run 77's outputs (c77_li, c77_sr, c77_nv).
cd /c/Git/Warism
mkdir critic/c80_bulk.lock 2>/dev/null || { echo "already running"; exit 0; }
echo "liab $(date +%T)" > critic/c80_chainBulk.log; P=${P:-4} sh critic/scripts/c80_liab.sh named > critic/c80_liab_named.log 2>&1
echo "sr $(date +%T)" >> critic/c80_chainBulk.log; P=${P:-4} sh critic/scripts/c80_sr.sh > critic/c80_sr.log 2>&1
echo "nv $(date +%T)" >> critic/c80_chainBulk.log; P=${P:-4} sh critic/scripts/c80_nv.sh > critic/c80_nv.log 2>&1
echo "malta $(date +%T)" >> critic/c80_chainBulk.log; BASE=http://127.0.0.1:5401 P=3 sh critic/scripts/c80_malta.sh > critic/c80_malta.log 2>&1
bash critic/scripts/c80_bulkcmp.sh > critic/c80_bulkcmp.log 2>&1
echo "BULKDONE $(date +%T)" >> critic/c80_chainBulk.log
echo done > critic/c80_bulk.done
