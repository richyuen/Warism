#!/bin/sh
# Critic run 80: afterTrack's two runs again, after its cache directory (critic/c81_atcache) was made (probe fault).
cd /c/Git/Warism
mkdir -p critic/c81_atcache
npx tsx critic/scripts/c81_afterTrack.ts 55601 10 critic/c81_atx_55601.json > critic/c81_atx_55601.log 2>&1; echo "55601 $?"
npx tsx critic/scripts/c81_afterTrack.ts 37601 10 critic/c81_atx_37601.json > critic/c81_atx_37601.log 2>&1; echo "37601 $?"
echo done > critic/c81_atx.done
