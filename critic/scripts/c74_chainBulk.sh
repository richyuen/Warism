#!/bin/sh
# Critic run 74 (focused): run 61's bulk landing sets (due: the sim changed since run 73's commit, ADR-917), 8 at a
# time: 396 named setups, 153 stuck-return runs, 168 next-voyage runs; then Malta's 18 on the page (HEAD's build at
# 5375) and the comparison with run 73's outputs (c73_li, c73_sr, c73_nv). The performance chain (c74_chainPerf.sh)
# runs after it, alone. Guarded: a second copy does nothing.
cd /c/Git/Warism
mkdir critic/c74_bulk.lock 2>/dev/null || { echo "already running"; exit 0; }
echo "liab $(date +%T)" > critic/c74_chainBulk.log; P=8 sh critic/scripts/c74_liab.sh named > critic/c74_liab_named.log 2>&1
echo "sr $(date +%T)" >> critic/c74_chainBulk.log; P=8 sh critic/scripts/c74_sr.sh > critic/c74_sr.log 2>&1
echo "nv $(date +%T)" >> critic/c74_chainBulk.log; P=8 sh critic/scripts/c74_nv.sh > critic/c74_nv.log 2>&1
echo "malta $(date +%T)" >> critic/c74_chainBulk.log; BASE=http://127.0.0.1:5375 P=3 sh critic/scripts/c74_malta.sh > critic/c74_malta.log 2>&1
bash critic/scripts/c74_bulkcmp.sh > critic/c74_bulkcmp.log 2>&1
echo "BULKDONE $(date +%T)" >> critic/c74_chainBulk.log
