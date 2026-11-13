#!/bin/sh
# Critic run 67 (full): run 66's named headless cases and its extra queue, the full run's new-seed families (39xxx: the
# checkers, sea battles, landing rows, area tops, piles, repulses, nuclear counts, track, trackFronts, afterTrack), 6 at
# a time (critic/scripts/c67_jobsAll.txt). Then landingFuzz on 15 new seeds from 39101.
cd /c/Git/Warism
tr -d '\r' < critic/scripts/c67_jobsAll.txt | xargs -P 6 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c67_named.progress'
echo done > critic/c67_named.done
npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 39101 --jobs 6 > critic/c67_landingFuzz.log 2>&1
echo done > critic/c67_fuzz.done
