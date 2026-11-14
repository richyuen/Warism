#!/bin/sh
# Critic run 68: the starts-based cases (run 67's afterStarts), then R81a's farConquests on 6161 and four new seeds
# (1975 free and plain 1938), then R76c's far landings on run 67's three seeds. 2-4 at a time beside the queue.
cd /c/Git/Warism
sh critic/scripts/c68_afterStarts.sh
for a in "1975 6161,41161,41163,41165,41167" "0 6161,41161,41163,41165,41167"; do set -- $a; echo "$1 $2"; done |
  xargs -P 2 -L 1 sh -c 'npx tsx critic/scripts/c68_farConquests.ts $0 $1 730 > critic/c68_farc_$0.log 2>&1'
for s in 7019 39811 39813; do echo $s; done | xargs -P 3 -I{} sh -c 'npx tsx critic/scripts/c68_farlands.ts {} 3 > critic/c68_farlands_{}.log 2>&1'
echo done > critic/c68_chainS.done
