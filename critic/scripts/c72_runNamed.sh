#!/bin/sh
# Critic run 72 (full): the headless named cases and new 55xxx families (critic/scripts/c72_jobsAll.txt), 6 at a time, then landingFuzz on 15 new seeds from 55101.
cd /c/Git/Warism
tr -d '\r' < critic/scripts/c72_jobsAll.txt | xargs -P 6 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c72_named.progress'
echo done > critic/c72_named.done
npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 55101 --jobs 6 > critic/c72_landingFuzz.log 2>&1
echo done > critic/c72_fuzz.done
