#!/bin/sh
# Critic run 25: LEAVE on HEAD and on run 24's commit (worktree), 5 seeds x 730 days, 5 at a time.
cd /c/Git/Warism
for s in 7019 2531 8467 3739 8821; do npx tsx critic/scripts/c27_leave.ts $s 730 critic/c27_leave_head_$s.json > critic/c27_leave_head_$s.log 2>&1 & done; wait
cd /c/Git/Warism/critic/wt
for s in 7019 2531 8467 3739 8821; do npx tsx critic/scripts/c27_leave.ts $s 730 /c/Git/Warism/critic/c27_leave_c26_$s.json > /c/Git/Warism/critic/c27_leave_c26_$s.log 2>&1 & done; wait
echo LEAVEDONE > /c/Git/Warism/critic/c27_leave.done
