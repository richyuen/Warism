#!/bin/sh
# Critic run 80 (full): the plain-1938 hash check first, then the headless cases on new seeds 68xxx (c80_jobsAll.txt),
# 5 at a time; then landingFuzz from 68101 (15 seeds x six shapes = 90 runs).
cd /c/Git/Warism
tr -d '\r' < critic/scripts/c80_jobsAll.txt | xargs -P 5 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c80_named.progress'
echo done > critic/c80_named.done
npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 68101 --jobs 4 > critic/c80_landingFuzz.log 2>&1
echo "fuzz exit $?" >> critic/c80_landingFuzz.log
echo done > critic/c80_fuzz.done
