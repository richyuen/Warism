#!/bin/sh
# Critic run 27: OR on 4 seeds, 3 probe days, up to 150 bonded pairs a day.
cd /c/Git/Warism
for s in 7019 2207 5113 9241; do npx tsx critic/scripts/c28_or.ts $s 30,120,300 critic/c28_or_$s.json 150 > critic/c28_or_$s.log 2>&1 & done
wait
echo ORDONE > critic/c28_or.done
