#!/bin/sh
# Critic run 72: after the page suite, Malta's 18 (run 59's, due: the sim changed) and seaBattlesLook 31501.
cd /c/Git/Warism
until grep -q SUITEB4DONE critic/c72_suiteB.log 2>/dev/null; do sleep 20; done
export BASE=http://127.0.0.1:5372
echo "== malta $(date +%T)"; P=3 sh critic/scripts/c72_malta.sh > critic/c72_malta.log 2>&1
echo "sb31501 $(date +%T)"; npx tsx tools/diag/seaBattles.ts 31501 scenario --years 2 --out critic/c72_sb_31501.json > critic/c72_sb_31501.log 2>&1
npx tsx tools/diag/seaBattlesLook.ts critic/c72_sb_31501.json --out critic/c72_sbl_31501.json > critic/c72_sbl_31501.log 2>&1; echo "  exit $?"
echo PAGESCDONE
