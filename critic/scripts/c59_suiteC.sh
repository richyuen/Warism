#!/bin/sh
# Critic run 59: stale panel news (R57c) at later hours; the peace reason line at 844x390; new seed peace.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5359
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,|' '______').log 2>&1; echo "   exit $?"; }
r c59_whotold 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 400
r c59_whotold 30113 GER ENG 1100.5,267.5 1031.5,266.5 6 400
r c59_whotold 30105 ENG GER 1023.5,275.5 1072.5,259.5 10 400
r c59_peacebtn 30403 GER POL 45 5 844 390
r c59_peacebtn 30405 JAP CHI 60 10 390 844
echo SUITECDONE
