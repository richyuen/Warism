#!/bin/sh
# Critic run 63: after the performance chain: Malta's 18 (run 61's bulk set) and R60-N5's seaBattlesLook 31501.
cd /c/Git/Warism
until grep -q PFDONE critic/c63_pf.status 2>/dev/null; do sleep 20; done
export BASE=http://127.0.0.1:5363
echo "malta $(date +%T)"; P=3 sh critic/scripts/c63_malta.sh > critic/c63_malta.log 2>&1
echo "sb31501 $(date +%T)"; npx tsx tools/diag/seaBattles.ts 31501 scenario --years 2 --out critic/c63_sb_31501.json > critic/c63_sb_31501.log 2>&1
npx tsx tools/diag/seaBattlesLook.ts critic/c63_sb_31501.json --out critic/c63_sbl_31501.json > critic/c63_sbl_31501.log 2>&1; echo "  exit $?"
echo AFTERDONE
