#!/bin/sh
# Critic run 61 (full): run 60's named page cases on the c61 build at 5361, one at a time.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5361
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
M="1095.5,344.5 1106.5,383.5"
r c61_whotold 27125 ITA ENG $M 6 140
r c61_whotold 27125 ITA ENG $M 6 400
r c61_whotold 31211 ITA ENG $M 12 114
r c61_nvpage 31211 ITA ENG $M 12 360
r c61_nvpage 31213 JAP CHI 1808.9,389.5 1715.0,413.7 10 480
for wh in "844 390" "390 844" "667 375" "740 360" "1024 500" "932 430"; do r c61_peacebtn 30403 GER POL 35 5 $wh; done
for wh in "844 390" "1600 900" "667 375"; do r c61_manywars 31201 GER POL,CZE,FRA,ENG,SOV,BEL,HOL,DEN,NOR,SWE $wh; done
r c61_new corridor 30307 390 844
CORRM=3000 r c61_new corridor 30307 390 844
echo SUITEADONE
