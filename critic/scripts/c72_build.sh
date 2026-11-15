#!/bin/sh
# Critic run 69 (copy of c69_build): build HEAD into critic/c72_dist, and the replay's yearly starts (to 1991) into critic/c72_starts,
# then put the fresh starts in the build (the local public/ ones are gitignored and stale).
cd /c/Git/Warism
( npx vite build --outDir critic/c72_dist > critic/c72_build.log 2>&1; echo "build exit $?" >> critic/c72_build.log ) &
( /usr/bin/time -v true >/dev/null 2>&1; s=$(date +%s); npm run saves -- critic/c72_starts > critic/c72_saves.log 2>&1; echo "saves exit $? in $(( $(date +%s) - s )) s" >> critic/c72_saves.log ) &
wait
rm -rf critic/c72_dist/data/scenarios/1938h/start && cp -r critic/c72_starts critic/c72_dist/data/scenarios/1938h/start
echo done > critic/c72_build.done
