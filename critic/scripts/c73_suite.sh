#!/bin/sh
# Critic run 64 (focused): run 63's named page cases of the dimensions this batch touched (UI, God Mode, editor,
# stats) and the same probes on new seeds 36xxx, one at a time, on the c70 build at 5373.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5373
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1800 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
M="1095.5,344.5 1106.5,383.5"
r c73_x_editor 32443
MAINSTART=1 r c73_x_editor 32441
echo "== badfiles"; sh critic/scripts/c73_x_badfiles.sh > critic/c73_x_badfiles.log 2>&1
r c73_whotold 31211 ITA ENG $M 12 114
r c73_manywars 31201 GER POL,CZE,FRA,ENG,SOV,BEL,HOL,DEN,NOR,SWE 667 375
for wh in "844 390" "390 844"; do r c73_x_closeblock 21103 $wh; done
r c73_h_interv 1600 900
r c73_h_interv 390 844
r c73_q_god_tools 36119
r c73_a_god_nuke 36117
r c73_kwhist 36151
r c73_x_keys 36423
r c73_x_continue 36415 40 GER 60
r c73_h_continue 400 120
r c73_x_buildpause 1600 900 1
r c73_h_godtab 1600 900 god-world-ai
echo SUITEDONE
