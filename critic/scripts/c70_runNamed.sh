#!/bin/sh
# Critic run 70 (focused): run 69's named headless cases and the new 53xxx families (critic/scripts/c70_jobs.txt), 6 at a time,
# then landingFuzz on 15 new seeds from 53101.
cd /c/Git/Warism
tr -d '\r' < critic/scripts/c70_jobs.txt | xargs -P 6 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c70_named.progress'
echo done > critic/c70_named.done
npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 53101 --jobs 6 > critic/c70_landingFuzz.log 2>&1
echo done > critic/c70_fuzz.done
