#!/bin/sh
# Critic run 76: run 75's heroPop cases, HEAD (5399) beside run 75's build (5398), at the same time.
cd /c/Git/Warism
for c in "56901 400" "57905 200" "58905 300"; do
  set -- $c
  ( BASE=http://127.0.0.1:5399 node critic/scripts/c76_heroPop.mjs $1 $2 head > critic/c76_hpz_head_$1.log 2>&1 ) &
  ( BASE=http://127.0.0.1:5398 node critic/scripts/c76_heroPop.mjs $1 $2 c75build > critic/c76_hpz_c75build_$1.log 2>&1 ) &
  wait
done
echo done > critic/c76_laneZ.done
