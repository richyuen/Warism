#!/bin/bash
# Critic run 84, lane E (after the first draft): R84-N1's "+n" clicked at the narrow desk widths (c81_moreClick), R191's
# header zoom buttons tapped on a sideways phone (c82_graphZoom), on HEAD (5409).
cd /c/Git/Warism
p() { local b=$1 n=$2 sc=$3; shift 3; echo "== $n $b $* $(date +%T)"; BASE=http://127.0.0.1:$b TAG=_c84_$b timeout 900 node critic/scripts/$sc.mjs "$@" > critic/c84_${n}_$(echo "$*" | tr ' ,' '__')_$b.log 2>&1; echo "   exit $?"; }
for wh in "620 900" "640 800" "683 768" "700 800"; do set -- $wh; p 5409 mc c81_moreClick 84901 400 $1 $2; done
p 5409 gz c82_graphZoom 68901 844 390
p 5409 gz c82_graphZoom 68901 667 375
p 5409 gz c82_graphZoom 84933 568 320
echo done > critic/c84_laneE.done
