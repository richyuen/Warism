#!/bin/sh
# Critic run 67: the four afterTrack runs again (their cache dir was missing on the first try), 2 at a time.
cd /c/Git/Warism
mkdir -p critic/c68_atcache
for s in 37601 37603 38601 1938; do echo $s; done | xargs -P 2 -I{} sh -c 'npx tsx critic/scripts/c68_afterTrack.ts {} 10 critic/c68_atx_{}.json > critic/c68_atx_{}.log 2>&1; echo "$? {}" >> critic/c68_atRerun.progress'
echo done > critic/c68_atRerun.done
