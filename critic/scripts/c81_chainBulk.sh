#!/bin/sh
# Critic run 81: run 80's bulk landing sets that were due on this sim and never finished (the sim is unchanged since
# 18c2b40a, so the 396 named setups and stuck-return's first 100 are carried from run 80): the whole stuck-return set
# (153), the 168 next-voyage runs, Malta's 18 on the page (HEAD's build on 5403). After the named chain, 4 at a time.
cd /c/Git/Warism
mkdir critic/c81_bulk.lock 2>/dev/null || { echo "already running"; exit 0; }
until [ -f critic/c81_named.done ]; do sleep 20; done
echo "sr $(date +%T)" > critic/c81_chainBulk.log; P=${P:-4} sh critic/scripts/c81_sr.sh > critic/c81_sr.log 2>&1
echo "nv $(date +%T)" >> critic/c81_chainBulk.log; P=${P:-4} sh critic/scripts/c81_nv.sh > critic/c81_nv.log 2>&1
echo "malta $(date +%T)" >> critic/c81_chainBulk.log; BASE=http://127.0.0.1:5403 P=3 sh critic/scripts/c81_malta.sh > critic/c81_malta.log 2>&1
sh critic/scripts/c81_nukeSame.sh
echo "BULKDONE $(date +%T)" >> critic/c81_chainBulk.log
echo done > critic/c81_bulk.done
