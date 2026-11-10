#!/bin/sh
# Critic run 61 (full): run 60's remaining named page cases (Malta's 18, seaBattlesLook 31501), the 12-year plain watch
# again (its first run was stopped by mistake), nvpage 31211 a second time (is its difference the page's timing?).
cd /c/Git/Warism
export BASE=http://127.0.0.1:5361
echo "malta $(date +%T)"; P=3 sh critic/scripts/c61_malta.sh > critic/c61_malta.log 2>&1
echo "sbl $(date +%T)"; npx tsx tools/diag/seaBattlesLook.ts critic/c61_sb_31501.json --out critic/c61_sbl_31501.json > critic/c61_sbl_31501.log 2>&1; echo "  exit $?"
echo "nvpage $(date +%T)"; node critic/scripts/c61_nvpage.mjs 31211 ITA ENG 1095.5,344.5 1106.5,383.5 12 360 > critic/c61_nvpage_again.log 2>&1; cp critic/c61_nvpage_ITA_31211_12_1600x900.json critic/c61_nvpage_ITA_31211_again.json
echo "lw $(date +%T)"; timeout 3600 node critic/scripts/c61_long_watch2.mjs 32143 12 '' plain > critic/c61_long_watch2_plain.log 2>&1; echo "  exit $?"
echo SUITEDDONE
