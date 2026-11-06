#!/bin/sh
# Critic run 36 (copy of run 35): R22g, a click on the sea with a land division, real mouse (c43_lp_landing.mjs).
cd /c/Git/Warism
r() { t=$1; shift; echo "== $t $* $(date +%T)"; timeout 1800 node critic/scripts/c43_lp_landing.mjs "$@" > critic/c43_lp_$t.log 2>&1; echo "   exit $?"; }
r os_bergen 3517 ENG 1023.5 275.5 1048.5 199.5 1 1 1 os_bergen
r os_northsea 3517 ENG 1023.5 275.5 1046.8 248.1 1 1 1 os_northsea
r os_atlantic 3517 ENG 1023.5 275.5 990.5 262.5 1 1 1 os_atlantic
r os_biscay 3517 ENG 1023.5 275.5 1010.5 305.5 1 1 1 os_biscay
r os_helgoland_war 3517 ENG 1023.5 275.5 1074.5 252.5 1 1 4 os_helgoland_war GER
r os_jap_pacific 3517 JAP 1818.5 385.5 1900.5 420.5 1 1 1 os_jap_pacific
echo OSQDONE
