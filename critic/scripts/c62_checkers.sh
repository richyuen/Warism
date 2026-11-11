#!/bin/sh
# Critic run 62: the rule checkers on new seeds (5 years each), 3 at a time, then the historical track's checker on
# two new seeds (warnings by ADR-950; its own seed is c62_track.ts 1938).
cd /c/Git/Warism
( npx tsx tools/diag/diploInvariants.ts 33501 scenario 1825 > critic/c62_diploinv_33501s.log 2>&1;
  npx tsx tools/diag/worldInvariants.ts 33507 1825 > critic/c62_wi_33507.log 2>&1 ) &
( npx tsx tools/diag/diploInvariants.ts 33503 random 1825 > critic/c62_diploinv_33503r.log 2>&1;
  npx tsx critic/scripts/c62_track.ts 33301 365 > critic/c62_track_33301.log 2>&1 ) &
( npx tsx tools/diag/diploInvariants.ts 33505 scenario 1825 --heroes > critic/c62_diploinv_33505sh.log 2>&1;
  npx tsx critic/scripts/c62_track.ts 33303 365 > critic/c62_track_33303.log 2>&1 ) &
wait
echo done > critic/c62_checkers.done
