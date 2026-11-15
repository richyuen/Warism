#!/bin/sh
# Critic run 69 (copy of c68_pagesC): run 68's other named page cases, after chain B: Malta's 18 (due: the sim changed), the refused starts,
# the free card at phone, the slider, the blank Next line, the Stalingrad stage, the God tab at phone, seaBattlesLook.
cd /c/Git/Warism
until grep -q PAGESBDONE critic/c69_pagesA.log 2>/dev/null; do sleep 20; done
export BASE=http://127.0.0.1:5369
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 2400 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,?:' '_______').log 2>&1; echo "   exit $?"; }
echo "== malta $(date +%T)"; P=3 sh critic/scripts/c69_malta.sh > critic/c69_malta.log 2>&1
r c69_x_replaycard 1975 free 390 844
r c69_x_slider
r c69_h_blank 120
r c69_h_godtab 390 844 god-world-ai
until [ -s critic/c69_sb_39061.json ]; do sleep 20; done
echo "== sbl 39061"; npx tsx tools/diag/seaBattlesLook.ts critic/c69_sb_39061.json --out critic/c69_sbl_39061.json > critic/c69_sbl_39061.log 2>&1; echo "  exit $?"
echo PAGESCDONE
