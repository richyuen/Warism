#!/bin/sh
# Critic run 64 (focused): run 63's named page cases of the dimensions this batch touched (UI, God Mode, editor,
# stats) and the same probes on new seeds 36xxx, one at a time, on the c66 build at 5366.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5366
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1800 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
M="1095.5,344.5 1106.5,383.5"
r c66_x_editor 32443
MAINSTART=1 r c66_x_editor 32441
echo "== badfiles"; sh critic/scripts/c66_x_badfiles.sh > critic/c66_x_badfiles.log 2>&1
r c66_whotold 31211 ITA ENG $M 12 114
r c66_manywars 31201 GER POL,CZE,FRA,ENG,SOV,BEL,HOL,DEN,NOR,SWE 667 375
for wh in "844 390" "390 844"; do r c66_x_closeblock 21103 $wh; done
r c66_h_interv 1600 900
r c66_h_interv 390 844
r c66_q_god_tools 36119
r c66_a_god_nuke 36117
r c66_kwhist 36151
r c66_x_keys 36423
r c66_x_continue 36415 40 GER 60
r c66_h_continue 400 120
r c66_x_buildpause 1600 900 1
r c66_h_godtab 1600 900 god-world-ai
echo SUITEDONE
