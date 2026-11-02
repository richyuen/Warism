#!/bin/sh
# Critic run 24: headless worlds on HEAD; 7019 identity against run 23's file, two new seeds, and seed-drawn diplomacy.
cd /c/Git/Warism
run() { s=$1; y=$2; npx tsx critic/scripts/c24_headless.ts $s $y critic/c24_headless_$s.json 20 critic/c24_seed${s}_y20.bin > critic/c24_headless_$s.log 2>&1; }
run 7019 20 & run 3739 30 & run 6197 30 & wait
echo ALLDONE > critic/c24_batch.done
