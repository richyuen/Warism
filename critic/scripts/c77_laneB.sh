#!/bin/sh
# Critic run 77: R148 (ADR-1127) on run 76's banner cases: bannerFlip on HEAD (5399) and run 76's build (5398) at the
# same time; then bannerRank 57901 three times on HEAD and once on run 76's build, 58901 once on each, two at a time.
cd /c/Git/Warism
for c in "57901 150" "58901 200" "57903 120"; do
  set -- $c
  BASE=http://127.0.0.1:5399 node critic/scripts/c77_bannerFlip.mjs $1 $2 head 60 > critic/c77_bf_head_$1.log 2>&1 &
  BASE=http://127.0.0.1:5398 node critic/scripts/c77_bannerFlip.mjs $1 $2 c76build 60 > critic/c77_bf_c76build_$1.log 2>&1 &
  wait
done
BASE=http://127.0.0.1:5399 node critic/scripts/c77_bannerRank.mjs 57901 150 > critic/c77_br_57901_1.log 2>&1 &
BASE=http://127.0.0.1:5398 node critic/scripts/c77_bannerRank.mjs 57901 150 > critic/c77_br_c76_57901.log 2>&1 &
wait
BASE=http://127.0.0.1:5399 node critic/scripts/c77_bannerRank.mjs 57901 150 > critic/c77_br_57901_2.log 2>&1 &
BASE=http://127.0.0.1:5398 node critic/scripts/c77_bannerRank.mjs 58901 150 > critic/c77_br_c76_58901.log 2>&1 &
wait
BASE=http://127.0.0.1:5399 node critic/scripts/c77_bannerRank.mjs 57901 150 > critic/c77_br_57901_3.log 2>&1 &
BASE=http://127.0.0.1:5399 node critic/scripts/c77_bannerRank.mjs 58901 150 > critic/c77_br_58901.log 2>&1 &
wait
BASE=http://127.0.0.1:5399 node critic/scripts/c77_bannerRank.mjs 62901 150 > critic/c77_br_62901.log 2>&1
echo done > critic/c77_laneB.done
