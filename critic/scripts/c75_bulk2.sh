#!/bin/sh
# Critic run 69: run 61's stuck-return and next-voyage sets, started beside the named landing set (c75_liab.sh, still
# running from c75_chainBulk.sh, whose shell was stopped so these do not run twice), 4 at a time each.
cd /c/Git/Warism
( P=4 sh critic/scripts/c75_sr.sh > critic/c75_sr.log 2>&1 ) &
( P=4 sh critic/scripts/c75_nv.sh > critic/c75_nv.log 2>&1 ) &
wait
echo BULK2DONE > critic/c75_bulk2.done
