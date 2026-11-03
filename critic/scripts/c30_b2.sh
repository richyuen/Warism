#!/bin/sh
# Critic run 27: BS on both commits (4 seeds x 365 days), then BOTH (3 seeds x 730 days) and 7019 x 20 years on HEAD.
cd /c/Git/Warism
sh critic/scripts/c30_bs_batch.sh
for s in 5113 6151 9241; do npx tsx critic/scripts/c30_both.ts $s 730 critic/c30_both_head_$s.json > critic/c30_both_head_$s.log 2>&1 & done
npx tsx critic/scripts/c30_headless.ts 7019 20 critic/c30_headless_7019.json 20 critic/c30_seed7019_y20.bin > critic/c30_headless_7019.log 2>&1 &
wait
echo B2DONE > critic/c30_b2.done
