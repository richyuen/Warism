#!/bin/sh
# Critic run 73 (focused): the headless named cases and new 56xxx families (critic/scripts/c73_jobsAll.txt), 5 at a
# time, then landingFuzz on 15 new seeds from 56101. Guarded: a second copy does nothing.
cd /c/Git/Warism
mkdir critic/c73_named.lock 2>/dev/null || { echo "already running"; exit 0; }
tr -d '\r' < critic/scripts/c73_jobsAll.txt | xargs -P 5 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c73_named.progress'
echo done > critic/c73_named.done
npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 56101 --jobs 6 > critic/c73_landingFuzz.log 2>&1
echo done > critic/c73_fuzz.done
