#!/bin/sh
# Critic run 69: run 61's stuck-return and next-voyage sets, started beside the named landing set (c73_liab.sh, still
# running from c73_chainBulk.sh, whose shell was stopped so these do not run twice), 4 at a time each.
cd /c/Git/Warism
( P=4 sh critic/scripts/c73_sr.sh > critic/c73_sr.log 2>&1 ) &
( P=4 sh critic/scripts/c73_nv.sh > critic/c73_nv.log 2>&1 ) &
wait
echo BULK2DONE > critic/c73_bulk2.done
