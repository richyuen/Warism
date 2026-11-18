#!/bin/sh
# Critic run 76: bannerRank 57901 150 on R132's own commit (8d3b417e, critic/c76_r132dist at 5397) beside HEAD (5399), twice.
cd /c/Git/Warism
for k in 1 2; do
  ( BASE=http://127.0.0.1:5397 node critic/scripts/c76_bannerRank.mjs 57901 150 > critic/c76_br_r132_57901_$k.log 2>&1 ) &
  ( BASE=http://127.0.0.1:5399 node critic/scripts/c76_bannerRank.mjs 57901 150 > critic/c76_br_head_57901_$k.log 2>&1 ) &
  wait
done
echo done > critic/c76_laneR.done
