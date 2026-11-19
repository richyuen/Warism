#!/bin/sh
# Critic run 79 (full): the plain-1938 hash check first, then the headless cases on new seeds 64xxx (c79_jobsAll.txt),
# 5 at a time; then landingFuzz from 64101 (15 seeds x six shapes = 90 runs).
cd /c/Git/Warism
tr -d '\r' < critic/scripts/c79_jobsAll.txt | xargs -P 5 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c79_named.progress'
echo done > critic/c79_named.done
npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 64101 --jobs 4 > critic/c79_landingFuzz.log 2>&1
echo "fuzz exit $?" >> critic/c79_landingFuzz.log
echo done > critic/c79_fuzz.done
