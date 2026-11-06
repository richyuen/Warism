#!/bin/sh
cd /c/Git/Warism
r() { tag=$1; shift; echo "== $tag $* $(date +%T)"; timeout 3600 "$@" > critic/c45_$tag.log 2>&1; echo "   exit $?"; }
r rc2_d1 env RECALL=24 node critic/scripts/c45_rc2_recall.mjs 3517 40 d1 &
r rc2_d3 env RECALL=72 node critic/scripts/c45_rc2_recall.mjs 3517 40 d3 &
wait
r rc2_d5 env RECALL=120 node critic/scripts/c45_rc2_recall.mjs 3517 40 d5 &
r rc2_h6 env RECALL=6 node critic/scripts/c45_rc2_recall.mjs 3517 40 h6 &
wait
echo SUITERCDONE
