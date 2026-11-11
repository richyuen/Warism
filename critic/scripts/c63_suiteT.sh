#!/bin/sh
# Critic run 63 (full): run 62's named page cases (the historical track, R62-N1..N6) and run 61's named page cases that
# run 62 re-ran, on the c63 build at 5363, one at a time.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5363
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
M="1095.5,344.5 1106.5,383.5"
r c63_h_interv 1600 900
r c63_h_interv 390 844
r c63_h_god
r c63_h_next 1030 96 greece
r c63_h_phone 390 844
r c63_h_phone 844 390
r c63_h_seed
for wh in "844 390" "932 430" "1024 500" "667 375"; do r c63_x_closeblock 21103 $wh; done
MAINSTART=1 r c63_x_editor 32441
r c63_x_editor 32443
echo "== badfiles"; sh critic/scripts/c63_x_badfiles.sh > critic/c63_x_badfiles.log 2>&1
r c63_whotold 31211 ITA ENG $M 12 114
r c63_manywars 31201 GER POL,CZE,FRA,ENG,SOV,BEL,HOL,DEN,NOR,SWE 667 375
r c63_h_watch 1600 900 1954 91 desk
echo SUITETDONE
