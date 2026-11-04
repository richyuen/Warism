#!/bin/sh
# Critic run 32: player landings (R17) on more cases.
cd /c/Git/Warism
r() { t=$1; shift; echo "== $t $* $(date +%T)"; timeout 2400 node critic/scripts/c32_lp_landing.mjs "$@" > critic/c32_lp_$t.log 2>&1; echo "   exit $?"; }
r swe_cph 3517 SWE 1126.5 212.5 1095.5 242.5 1 1 5 swe_cph
r ned_java 3517 NED 1051.5 268.5 1631.5 632.5 1 1 5 ned_java
r jap_shanghai 3517 JAP 1818.5 385.5 1715.5 413.5 2 1 40 jap_shanghai
r ita_tripoli 3517 ITA 1095.5 344.5 1099.5 403.5 3 0 40 ita_tripoli
r usa_brest 3517 USA 603.5 352.5 998.5 298.5 1 1 60 usa_brest
echo LPQDONE
