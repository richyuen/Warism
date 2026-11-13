#!/bin/sh
# Critic run 65: build HEAD into critic/c66_dist, and the replay's yearly starts (to 1975) into critic/c66_starts,
# then put the fresh starts in the build (the local public/ ones are gitignored and stale).
cd /c/Git/Warism
( npx vite build --outDir critic/c66_dist > critic/c66_build.log 2>&1; echo "build exit $?" >> critic/c66_build.log ) &
( /usr/bin/time -v true >/dev/null 2>&1; s=$(date +%s); npm run saves -- critic/c66_starts > critic/c66_saves.log 2>&1; echo "saves exit $? in $(( $(date +%s) - s )) s" >> critic/c66_saves.log ) &
wait
rm -rf critic/c66_dist/data/scenarios/1938h/start && cp -r critic/c66_starts critic/c66_dist/data/scenarios/1938h/start
echo done > critic/c66_build.done
