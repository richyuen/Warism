#!/bin/sh
# Critic run 67 (full): run 66's named headless cases and its extra queue, the full run's new-seed families (39xxx: the
# checkers, sea battles, landing rows, area tops, piles, repulses, nuclear counts, track, trackFronts, afterTrack), 6 at
# a time (critic/scripts/c68_jobsAll.txt). Then landingFuzz on 15 new seeds from 39101.
cd /c/Git/Warism
tr -d '\r' < critic/scripts/c68_jobsAll.txt | xargs -P 6 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c68_named.progress'
echo done > critic/c68_named.done
npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 41101 --jobs 6 > critic/c68_landingFuzz.log 2>&1
echo done > critic/c68_fuzz.done
