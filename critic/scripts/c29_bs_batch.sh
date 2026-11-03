#!/bin/sh
# Critic run 26: BS on HEAD and on run 25's commit (worktree), 4 seeds x 365 days, 4 at a time.
cd /c/Git/Warism
for s in 7019 2531 8467 3739; do npx tsx critic/scripts/c29_bs.ts $s 365 critic/c29_bs_head_$s.json > critic/c29_bs_head_$s.log 2>&1 & done; wait
cd /c/Git/Warism/critic/wt
for s in 7019 2531 8467 3739; do npx tsx critic/scripts/c29_bs.ts $s 365 /c/Git/Warism/critic/c29_bs_c26_$s.json > /c/Git/Warism/critic/c29_bs_c26_$s.log 2>&1 & done; wait
echo BSDONE > /c/Git/Warism/critic/c29_bs.done
