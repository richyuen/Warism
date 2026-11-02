#!/bin/sh
# Critic run 25: after the re-runs, a 10-year page watch on a new seed with random diplomacy, then PF alone.
cd /c/Git/Warism
until grep -q NEWDONE critic/c25_new.log && grep -q SUITE1DONE critic/c25_suite1.log; do sleep 15; done
echo "== lw 4402 $(date +%T)"; timeout 3600 node critic/scripts/c25_long_watch2.mjs 4402 10 '&diplo=random' rnd > critic/c25_lw_4402.log 2>&1; echo "   exit $?"
until [ -f critic/c25_leave.done ]; do sleep 15; done
echo "== pf $(date +%T)"; timeout 1800 node critic/scripts/c25_pf_lookfps.mjs 7019 critic/c25_seed7019_y20.bin > critic/c25_pf.log 2>&1; echo "   exit $?"
echo TAILDONE
