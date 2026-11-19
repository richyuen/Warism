#!/bin/sh
# Critic run 80: c80_bannerNames on HEAD (5401) and run 79's build (5402), sizes and days; and the random world.
cd /c/Git/Warism
for b in 5401 5402; do
  for c in "68901 0 390 844" "68901 400 390 844" "68901 400 844 390" "68901 400 1024 768" "68901 400 1600 900" "68903 700 390 844" "68903 700 1280 720"; do
    set -- $c; BASE=http://127.0.0.1:$b TAG=_$b timeout 600 node critic/scripts/c80_bannerNames.mjs $1 $2 $3 $4 > critic/c80_bn_$1_$2_$3x$4_$b.log 2>&1
  done
  BASE=http://127.0.0.1:$b TAG=_$b SCEN=random timeout 900 node critic/scripts/c80_bannerNames.mjs 64965 730 1600 900 > critic/c80_bn_rnd_64965_730_1600x900_$b.log 2>&1
  BASE=http://127.0.0.1:$b TAG=_$b SCEN=random timeout 900 node critic/scripts/c80_bannerNames.mjs 64965 730 390 844 > critic/c80_bn_rnd_64965_730_390x844_$b.log 2>&1
done
echo done > critic/c80_bnSet.done
