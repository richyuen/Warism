#!/bin/sh
# Critic run 69 (full): run 68's named headless cases and the new 51xxx families (critic/scripts/c69_jobsAll.txt), 6 at a time,
# Then landingFuzz on 15 new seeds from 51101.
cd /c/Git/Warism
tr -d '\r' < critic/scripts/c69_jobsAll.txt | xargs -P 6 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c69_named.progress'
echo done > critic/c69_named.done
npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 51101 --jobs 6 > critic/c69_landingFuzz.log 2>&1
echo done > critic/c69_fuzz.done
