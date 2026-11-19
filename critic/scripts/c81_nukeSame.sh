#!/bin/sh
# Critic run 80: run 79's nuke-count seeds on HEAD (new seeds 69501-69509 gave 0,25,0,0,0 launches; run 79's 64501-64509
# gave 26,7,0,3,10): the same seeds on both commits, so a difference can be judged.
cd /c/Git/Warism
npx tsx tools/diag/nukeIntercepts.ts 64501 22 > critic/c81_nukeIntercepts_64501.log 2>&1 &
for s in 64503 64505 64507 64509; do npx tsx critic/scripts/c77_nukecount.ts $s 22 > critic/c81_nc_$s.log 2>&1 & done
wait
echo done > critic/c81_nukeSame.done
