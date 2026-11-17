#!/bin/sh
# Critic run 74 (copy of c73_build): build HEAD into critic/c75_dist, and the replay's yearly starts (to 1991) into critic/c75_starts,
# then put the fresh starts in the build (the local public/ ones are gitignored and stale).
cd /c/Git/Warism
( npx vite build --outDir critic/c75_dist > critic/c75_build.log 2>&1; echo "build exit $?" >> critic/c75_build.log ) &
( /usr/bin/time -v true >/dev/null 2>&1; s=$(date +%s); npm run saves -- critic/c75_starts > critic/c75_saves.log 2>&1; echo "saves exit $? in $(( $(date +%s) - s )) s" >> critic/c75_saves.log ) &
wait
rm -rf critic/c75_dist/data/scenarios/1938h/start && cp -r critic/c75_starts critic/c75_dist/data/scenarios/1938h/start
echo done > critic/c75_build.done
