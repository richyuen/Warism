#!/bin/sh
# Critic run 73: AI nuclear launches over 22 years on six new seeds, on run 72's commit (worktree critic/wt, 2ae30ec6)
# and on HEAD. Arg 1: "old" or "head". 6 at a time.
cd /c/Git/Warism
if [ "$1" = old ]; then
  for s in 56501 56503 56505 56507 56509 56511; do echo $s; done | xargs -P 6 -I{} sh -c 'cd /c/Git/Warism/critic/wt && npx tsx critic/scripts/c75_nukecount.ts {} 22 > /c/Git/Warism/critic/c75_ncold_{}.log 2>&1'
else
  for s in 56503 56505 56507 56509 56511; do echo $s; done | xargs -P 5 -I{} sh -c 'cd /c/Git/Warism && npx tsx critic/scripts/c75_nukecount.ts {} 22 > critic/c75_nc_{}.log 2>&1'
fi
echo "NUKEAB $1 done $(date +%T)"
