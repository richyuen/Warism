#!/bin/sh
# Critic run 76: R75-N1 re-run, the banners by the second, HEAD (5399) and run 75's build (5398) at the same time; then bannerRank.
cd /c/Git/Warism
for c in "57901 150" "58901 200" "57903 120"; do
  set -- $c
  BASE=http://127.0.0.1:5399 node critic/scripts/c76_bannerFlip.mjs $1 $2 head 60 > critic/c76_bf_head_$1.log 2>&1 &
  BASE=http://127.0.0.1:5398 node critic/scripts/c76_bannerFlip.mjs $1 $2 c75build 60 > critic/c76_bf_c75build_$1.log 2>&1 &
  wait
done
BASE=http://127.0.0.1:5399 node critic/scripts/c76_bannerRank.mjs 57901 150 > critic/c76_br_57901.log 2>&1 &
BASE=http://127.0.0.1:5399 node critic/scripts/c76_bannerRank.mjs 59901 150 > critic/c76_br_59901.log 2>&1 &
wait
echo done > critic/c76_laneB.done
