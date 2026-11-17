#!/bin/sh
# Critic run 74 (focused): run 61's bulk landing sets (due: the sim changed since run 73's commit, ADR-917), 8 at a
# time: 396 named setups, 153 stuck-return runs, 168 next-voyage runs; then Malta's 18 on the page (HEAD's build at
# 5377) and the comparison with run 73's outputs (c73_li, c73_sr, c73_nv). The performance chain (c75_chainPerf.sh)
# runs after it, alone. Guarded: a second copy does nothing.
cd /c/Git/Warism
mkdir critic/c75_bulk.lock 2>/dev/null || { echo "already running"; exit 0; }
echo "liab $(date +%T)" > critic/c75_chainBulk.log; P=6 sh critic/scripts/c75_liab.sh named > critic/c75_liab_named.log 2>&1
echo "sr $(date +%T)" >> critic/c75_chainBulk.log; P=6 sh critic/scripts/c75_sr.sh > critic/c75_sr.log 2>&1
echo "nv $(date +%T)" >> critic/c75_chainBulk.log; P=6 sh critic/scripts/c75_nv.sh > critic/c75_nv.log 2>&1
echo "malta $(date +%T)" >> critic/c75_chainBulk.log; BASE=http://127.0.0.1:5377 P=3 sh critic/scripts/c75_malta.sh > critic/c75_malta.log 2>&1
bash critic/scripts/c75_bulkcmp.sh > critic/c75_bulkcmp.log 2>&1
echo "BULKDONE $(date +%T)" >> critic/c75_chainBulk.log
