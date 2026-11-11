#!/bin/sh
# Critic run 64 (focused): the rule checkers on new seeds (5 years each), and the historical track's checker on two new
# seeds plus its own (the R65c transfer rows sit on the track; ADR-950 warnings). Two at a time beside landingFuzz.
cd /c/Git/Warism
( npx tsx tools/diag/diploInvariants.ts 36001 scenario 1825 > critic/c64_diploinv_36001s.log 2>&1;
  npx tsx tools/diag/worldInvariants.ts 36007 1825 > critic/c64_wi_36007.log 2>&1;
  npx tsx tools/diag/diploInvariants.ts 36005 scenario 1825 --heroes > critic/c64_diploinv_36005sh.log 2>&1;
  npx tsx critic/scripts/c64_track.ts 1938 365 > critic/c64_track_1938.log 2>&1 ) &
( npx tsx tools/diag/diploInvariants.ts 36003 random 1825 > critic/c64_diploinv_36003r.log 2>&1;
  npx tsx critic/scripts/c64_track.ts 36301 365 > critic/c64_track_36301.log 2>&1;
  npx tsx critic/scripts/c64_track.ts 36303 365 > critic/c64_track_36303.log 2>&1 ) &
wait
echo done > critic/c64_checkers.done
