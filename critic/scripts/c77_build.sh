#!/bin/sh
# Critic run 74 (copy of c73_build): build HEAD into critic/c77_dist, and the replay's yearly starts (to 1991) into critic/c77_starts,
# then put the fresh starts in the build (the local public/ ones are gitignored and stale).
cd /c/Git/Warism
( npx vite build --outDir critic/c77_dist > critic/c77_build.log 2>&1; echo "build exit $?" >> critic/c77_build.log ) &
( /usr/bin/time -v true >/dev/null 2>&1; s=$(date +%s); npm run saves -- critic/c77_starts > critic/c77_saves.log 2>&1; echo "saves exit $? in $(( $(date +%s) - s )) s" >> critic/c77_saves.log ) &
wait
rm -rf critic/c77_dist/data/scenarios/1938h/start && cp -r critic/c77_starts critic/c77_dist/data/scenarios/1938h/start
echo done > critic/c77_build.done
