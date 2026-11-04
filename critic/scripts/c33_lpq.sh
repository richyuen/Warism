#!/bin/sh
# Critic run 33: player landings after R20, in the page.
cd /c/Git/Warism
r() { t=$1; shift; echo "== $t $* $(date +%T)"; timeout 2400 node critic/scripts/c33_lp_landing.mjs "$@" > critic/c33_lp_$t.log 2>&1; echo "   exit $?"; }
r eng_calais 3517 ENG 1023.5 275.5 1034.5 279.5 3 1 3 eng_calais
r eng_bergen 3517 ENG 1023.5 275.5 1048.5 199.5 1 1 3 eng_bergen
r usa_calais 3517 USA 603.5 352.5 1034.5 279.5 1 1 3 usa_calais
r eng_calais_war 3517 ENG 1023.5 275.5 1034.5 279.5 3 1 12 eng_calais_war FRA
r jap_shanghai 3517 JAP 1818.5 385.5 1715.5 413.5 2 1 25 jap_shanghai
echo LPQDONE
