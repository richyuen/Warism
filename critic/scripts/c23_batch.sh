#!/bin/sh
# Critic run 23: headless worlds on HEAD; 7019 identity against run 22's file, two new seeds.
cd /c/Git/Warism
run() { s=$1; y=$2; npx tsx critic/scripts/c23_headless.ts $s $y critic/c23_headless_$s.json 20 critic/c23_seed${s}_y20.bin > critic/c23_headless_$s.log 2>&1; }
run 7019 20 & run 2468 30 & run 5113 30 & wait
echo ALLDONE > critic/c23_batch.done
