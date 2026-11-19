#!/bin/sh
# Critic run 80 (full): the plain-1938 hash check first, then the headless cases on new seeds 68xxx (c85_jobsAll.txt),
# 5 at a time; then landingFuzz from 85101 (15 seeds x six shapes = 90 runs).
cd /c/Git/Warism
tr -d '\r' < critic/scripts/c85_jobsAll.txt | xargs -P 4 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c85_named.progress'
echo done > critic/c85_named.done
npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 85101 --jobs 4 > critic/c85_landingFuzz.log 2>&1
echo "fuzz exit $?" >> critic/c85_landingFuzz.log
echo done > critic/c85_fuzz.done
