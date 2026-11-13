#!/bin/sh
# Critic run 65: build HEAD into critic/c67_dist, and the replay's yearly starts (to 1975) into critic/c67_starts,
# then put the fresh starts in the build (the local public/ ones are gitignored and stale).
cd /c/Git/Warism
( npx vite build --outDir critic/c67_dist > critic/c67_build.log 2>&1; echo "build exit $?" >> critic/c67_build.log ) &
( /usr/bin/time -v true >/dev/null 2>&1; s=$(date +%s); npm run saves -- critic/c67_starts > critic/c67_saves.log 2>&1; echo "saves exit $? in $(( $(date +%s) - s )) s" >> critic/c67_saves.log ) &
wait
rm -rf critic/c67_dist/data/scenarios/1938h/start && cp -r critic/c67_starts critic/c67_dist/data/scenarios/1938h/start
echo done > critic/c67_build.done
