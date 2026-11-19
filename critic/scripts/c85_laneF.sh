#!/bin/bash
# Critic run 85, lane F: heroPop 85905 (13 jumps on HEAD in lane D; run 81 gave 2 on 69905 and 0 to 9 on one case of one
# build) on HEAD (5411) and run 84's build (5410) at the same time, twice, so a difference can be told from the probe's timing.
cd /c/Git/Warism
for k in 1 2; do
  BASE=http://127.0.0.1:5411 timeout 900 node critic/scripts/c85_heroPop.mjs 85905 300 head > critic/c85_hpF_85905_5411_$k.log 2>&1 &
  BASE=http://127.0.0.1:5410 timeout 900 node critic/scripts/c85_heroPop.mjs 85905 300 c84build > critic/c85_hpF_85905_5410_$k.log 2>&1 &
  wait
done
echo done > critic/c85_laneF.done
