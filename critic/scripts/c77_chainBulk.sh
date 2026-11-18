#!/bin/sh
# Critic run 76 (focused; copy of run 75): run 61's bulk landing sets (due: the sim changed since run 73's commit, ADR-917), 8 at a
# time: 396 named setups, 153 stuck-return runs, 168 next-voyage runs; then Malta's 18 on the page (HEAD's build at
# 5377) and the comparison with run 73's outputs (c73_li, c73_sr, c73_nv). The performance chain (c77_chainPerf.sh)
# runs after it, alone. Guarded: a second copy does nothing.
cd /c/Git/Warism
mkdir critic/c77_bulk.lock 2>/dev/null || { echo "already running"; exit 0; }
echo "liab $(date +%T)" > critic/c77_chainBulk.log; P=4 sh critic/scripts/c77_liab.sh named > critic/c77_liab_named.log 2>&1
echo "sr $(date +%T)" >> critic/c77_chainBulk.log; P=4 sh critic/scripts/c77_sr.sh > critic/c77_sr.log 2>&1
echo "nv $(date +%T)" >> critic/c77_chainBulk.log; P=4 sh critic/scripts/c77_nv.sh > critic/c77_nv.log 2>&1
echo "malta $(date +%T)" >> critic/c77_chainBulk.log; BASE=http://127.0.0.1:5399 P=3 sh critic/scripts/c77_malta.sh > critic/c77_malta.log 2>&1
bash critic/scripts/c77_bulkcmp.sh > critic/c77_bulkcmp.log 2>&1
echo "BULKDONE $(date +%T)" >> critic/c77_chainBulk.log
