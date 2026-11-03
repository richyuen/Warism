#!/bin/sh
# Critic run 27: PZ (4 seeds, HEAD), then EXIT/COBEL on HEAD.
cd /c/Git/Warism
for s in 7019 2207 5113 9241; do npx tsx critic/scripts/c28_pz.ts $s 365 critic/c28_pz_$s.json > critic/c28_pz_$s.log 2>&1 & done
sh critic/scripts/c28_exitbatch.sh
wait
echo B1DONE > critic/c28_b1.done
