#!/bin/sh
# Critic run 71 (focused): headless named cases and new 54xxx families (critic/scripts/c71_jobs.txt), 6 at a time, then landingFuzz on 15 new seeds from 54101.
cd /c/Git/Warism
tr -d '\r' < critic/scripts/c71_jobs.txt | xargs -P 6 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c71_named.progress'
echo done > critic/c71_named.done
npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 54101 --jobs 6 > critic/c71_landingFuzz.log 2>&1
echo done > critic/c71_fuzz.done
