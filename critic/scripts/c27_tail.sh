#!/bin/sh
# Critic run 25: after the re-runs, a 10-year page watch on a new seed with random diplomacy, then PF alone.
cd /c/Git/Warism
until grep -q NEWDONE critic/c27_new.log && grep -q SUITE1DONE critic/c27_suite1.log; do sleep 15; done
echo "== lw 6151 $(date +%T)"; timeout 3600 node critic/scripts/c27_long_watch2.mjs 6151 10 '' def > critic/c27_lw_6151.log 2>&1; echo "   exit $?"
until [ -f critic/c27_bs.done ]; do sleep 15; done
echo "== pf $(date +%T)"; timeout 1800 node critic/scripts/c27_pf_lookfps.mjs 7019 critic/c27_seed7019_y20.bin > critic/c27_pf.log 2>&1; echo "   exit $?"
echo TAILDONE
