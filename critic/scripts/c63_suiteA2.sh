#!/bin/sh
# Critic run 55: run 54's other named landing cases, after suiteA.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5363
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
until grep -q SUITEADONE critic/c63_suiteA.log 2>/dev/null; do sleep 20; done
STEP=3 SHOTAT=117,120,123,126 r c63_lhold 20861 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 160
STEP=2 r c63_lland 20861 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 200
r c63_lost 3517 desk
r c63_lbar 22107 ITA ENG 1095.5,344.5 1106.5,383.5 3 ita_malta3 1600 900 20 5
r c63_cancel_page 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_cancel 26 240
SHOTAT=40,60,90 r c63_lhold 24105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200
for s in 24157 24173 24175 21105; do r c63_lland $s ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 240; done
echo SUITEA2DONE
