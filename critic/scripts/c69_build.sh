#!/bin/sh
# Critic run 69 (copy of c68_build): build HEAD into critic/c69_dist, and the replay's yearly starts (to 1991) into critic/c69_starts,
# then put the fresh starts in the build (the local public/ ones are gitignored and stale).
cd /c/Git/Warism
( npx vite build --outDir critic/c69_dist > critic/c69_build.log 2>&1; echo "build exit $?" >> critic/c69_build.log ) &
( /usr/bin/time -v true >/dev/null 2>&1; s=$(date +%s); npm run saves -- critic/c69_starts > critic/c69_saves.log 2>&1; echo "saves exit $? in $(( $(date +%s) - s )) s" >> critic/c69_saves.log ) &
wait
rm -rf critic/c69_dist/data/scenarios/1938h/start && cp -r critic/c69_starts critic/c69_dist/data/scenarios/1938h/start
echo done > critic/c69_build.done
