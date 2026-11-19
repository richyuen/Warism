#!/bin/bash
# Critic run 82 (focused), lane C: monkeys and resizes on HEAD (5405), new seeds 82xxx.
cd /c/Git/Warism
r() { n=$1; shift; echo "== $n $*"; BASE=http://127.0.0.1:5405 timeout ${TO:-900} node critic/scripts/c81_$n.mjs "$@" > critic/c82_$n.$(echo "$*" | tr ' ' '_').log 2>&1; echo "   exit $?"; }
r resize 82821 60
TO=600 r monkey 82811 240 390 844 touch
TO=600 r monkey 82815 240 844 390 touch
TO=600 r monkey 82813 180 1024 768
TO=600 r monkey 82817 180 360 740 touch
echo done > critic/c82_laneC.done
