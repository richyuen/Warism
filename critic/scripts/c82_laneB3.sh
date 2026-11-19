#!/bin/bash
# Critic run 82 (focused), lane B3 (lane B's tail run beside it for time): new seeds on HEAD (5405). R178's row at twelve sizes (bannerFit), opened and with a panel;
# R182 at the three sideways sizes (relOver, relSame); R180 (deskFit) at four desk sizes; Go to country's cost (gotoCost);
# the monkeys and resizes at phone and desk sizes.
cd /c/Git/Warism
p() { n=$1; s=$2; shift 2; echo "== $n $*"; BASE=http://127.0.0.1:5405 TAG=_c82_5405 timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c82_${n}_$(echo "$*" | tr ' ,' '__')${SCEN:+_$SCEN}${OPEN:+_open}${PANEL:+_p$PANEL}_5405.log 2>&1; echo "   exit $?"; }
for wh in "1024 768" "1152 864" "1280 720" "1366 768"; do set -- $wh; p df c82_deskFit 82901 400 $1 $2 GER; p df c82_deskFit 82903 700 $1 $2 SOV; done
echo done > critic/c82_laneB3.done
