#!/bin/sh
# Critic run 69: run 61's stuck-return and next-voyage sets, started beside the named landing set (c72_liab.sh, still
# running from c72_chainBulk.sh, whose shell was stopped so these do not run twice), 4 at a time each.
cd /c/Git/Warism
( P=4 sh critic/scripts/c72_sr.sh > critic/c72_sr.log 2>&1 ) &
( P=4 sh critic/scripts/c72_nv.sh > critic/c72_nv.log 2>&1 ) &
wait
echo BULK2DONE > critic/c72_bulk2.done
