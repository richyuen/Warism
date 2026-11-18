#!/bin/sh
# Critic run 78: the score-moving cases on HEAD (5397) and run 77's build (critic/c77_dist, 7066d800, 5396) side by side:
# bannerFlip on run 77's three cases (both builds at once), then bannerRank 57901 and tlDead on run 77's build (their
# output names are fixed, so HEAD's were copied aside first as c78_br_head_*, c78tld_head_*).
cd /c/Git/Warism
for c in "57901 150" "58901 200" "57903 120"; do
  set -- $c
  BASE=http://127.0.0.1:5397 node critic/scripts/c78_bannerFlip.mjs $1 $2 head 60 > critic/c78_bf_head_$1.log 2>&1 &
  BASE=http://127.0.0.1:5396 node critic/scripts/c78_bannerFlip.mjs $1 $2 c77build 60 > critic/c78_bf_c77build_$1.log 2>&1 &
  wait
done
BASE=http://127.0.0.1:5396 node critic/scripts/c78_bannerRank.mjs 57901 150 > critic/c78_br_c77build_57901.log 2>&1 &
BASE=http://127.0.0.1:5396 node critic/scripts/c78_tlDead.mjs critic/c76_seed7019_y20.bin > critic/c78_tld_c77build.log 2>&1 &
wait
cp critic/c78tld_1600x900.json critic/c78tld_c77build_1600x900.json
for f in hover click resume; do cp critic/shots/c78tld_1600x900_$f.png critic/shots/c78tld_c77build_1600x900_$f.png; done
cp critic/c78_br_57901_1600x900.json critic/c78_br_c77build_57901_1600x900.json
echo done > critic/c78_laneOld.done
