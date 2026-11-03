#!/bin/sh
# Critic run 27: PZ (4 seeds, HEAD), then EXIT/COBEL on HEAD.
cd /c/Git/Warism
for s in 7019 2207 5113 9241; do npx tsx critic/scripts/c27_pz.ts $s 365 critic/c27_pz_$s.json > critic/c27_pz_$s.log 2>&1 & done
sh critic/scripts/c27_exitbatch.sh
wait
echo B1DONE > critic/c27_b1.done
