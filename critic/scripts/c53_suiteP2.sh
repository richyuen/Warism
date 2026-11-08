#!/bin/sh
# Critic run 53: the new probes, one at a time, after c53_suiteP.sh.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5353
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c53_kwhist 21151
r c53_kwhist 23151
SHOTAT=30,33,36 r c53_turnback 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_cancel 26 60
SHOTAT=36,60,120 r c53_lhold 21105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200
STEP=3 SHOTAT=117,120,123,126 r c53_lhold 20861 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 160
r c53_sb_seaballs 20885 107 1188.17 328.5
echo SUITEP2DONE
