#!/bin/sh
# Critic run 76 (focused): the headless named cases and new 56xxx families (critic/scripts/c77_jobsAll.txt), 5 at a
# time, then landingFuzz on 15 new seeds from 56101. Guarded: a second copy does nothing.
cd /c/Git/Warism
mkdir critic/c77_named.lock 2>/dev/null || { echo "already running"; exit 0; }
tr -d '\r' < critic/scripts/c77_jobsAll.txt | xargs -P 6 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c77_named.progress'
echo done > critic/c77_named.done
npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 62101 --jobs 6 > critic/c77_landingFuzz.log 2>&1
echo done > critic/c77_fuzz.done
