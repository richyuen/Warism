#!/bin/sh
# Critic run 68: run 67's other named page cases, after chain B: Malta's 18 (due: the sim changed), the refused starts,
# the free card at phone, the slider, the blank Next line, the Stalingrad stage, the God tab at phone, seaBattlesLook.
cd /c/Git/Warism
until grep -q PAGESBDONE critic/c68_pagesA.log 2>/dev/null; do sleep 20; done
export BASE=http://127.0.0.1:5368
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 2400 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,?:' '_______').log 2>&1; echo "   exit $?"; }
echo "== malta $(date +%T)"; P=3 sh critic/scripts/c68_malta.sh > critic/c68_malta.log 2>&1
r c68_x_badyear2
r c68_x_replaycard 1975 free 390 844
r c68_x_slider
r c68_h_blank 120
r c68_x_stage stalin 1942 1942-10-22 1277.2 296 12
r c68_h_godtab 390 844 god-world-ai
until [ -s critic/c68_sb_39061.json ]; do sleep 20; done
echo "== sbl 39061"; npx tsx tools/diag/seaBattlesLook.ts critic/c68_sb_39061.json --out critic/c68_sbl_39061.json > critic/c68_sbl_39061.log 2>&1; echo "  exit $?"
echo PAGESCDONE
