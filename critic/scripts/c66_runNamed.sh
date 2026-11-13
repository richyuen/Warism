#!/bin/sh
# Critic run 66: run 65's named headless cases, the checkers on run 65's seeds (37xxx) and new seeds (38xxx), the track
# checker (1938, 38301, 38303), trackFronts 37701/38701, afterTrack 37601/38601, 6 at a time. Then landingFuzz from 38101.
cd /c/Git/Warism
tr -d '\r' < critic/scripts/c66_jobsNamed.txt | xargs -P 5 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c66_named.progress'
echo done > critic/c66_named.done
npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 38101 --jobs 6 > critic/c66_landingFuzz.log 2>&1
echo done > critic/c66_fuzz.done
