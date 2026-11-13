#!/bin/sh
# Critic run 65: the builder's afterTrack measure (blocs, deterrence, aid after the track's 1975 end) on new seeds
# 37601 and 37603, 10 years each, plus the track's own seed (1938), 10 years.
cd /c/Git/Warism
for s in 37601 37603 1938; do
  npx tsx tools/diag/afterTrack.ts $s 10 critic/c65_at_$s.json > critic/c65_at_$s.log 2>&1 &
done
wait
echo done > critic/c65_at.done
