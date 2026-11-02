#!/bin/sh
# Critic run 25: headless worlds on HEAD; 7019 against run 24's file, two new seeds.
cd /c/Git/Warism
run() { s=$1; y=$2; npx tsx critic/scripts/c25_headless.ts $s $y critic/c25_headless_$s.json 20 critic/c25_seed${s}_y20.bin > critic/c25_headless_$s.log 2>&1; }
run 7019 20 & run 2531 30 & run 8467 30 & wait
echo ALLDONE > critic/c25_batch.done
