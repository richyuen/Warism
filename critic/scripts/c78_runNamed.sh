#!/bin/sh
# Critic run 78 (focused): plain-1938 hash check, three new seeds per checker, R76-B1's seed; then landingFuzz from 63101.
cd /c/Git/Warism
tr -d '\r' < critic/scripts/c78_jobs.txt | xargs -P 4 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c78_named.progress'
echo done > critic/c78_named.done
npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 63101 --jobs 4 > critic/c78_landingFuzz.log 2>&1
echo done > critic/c78_fuzz.done
