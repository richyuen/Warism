#!/bin/sh
# Critic run 26: headless worlds on HEAD; 7019 against run 25's file, two new seeds.
cd /c/Git/Warism
run() { s=$1; y=$2; npx tsx critic/scripts/c27_headless.ts $s $y critic/c27_headless_$s.json 20 critic/c27_seed${s}_y20.bin > critic/c27_headless_$s.log 2>&1; }
run 7019 20 & run 3163 30 & run 6907 30 & wait
echo ALLDONE > critic/c27_batch.done
