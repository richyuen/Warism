#!/bin/sh
# Critic run 69 (copy of c69_build): build HEAD into critic/c71_dist, and the replay's yearly starts (to 1991) into critic/c71_starts,
# then put the fresh starts in the build (the local public/ ones are gitignored and stale).
cd /c/Git/Warism
( npx vite build --outDir critic/c71_dist > critic/c71_build.log 2>&1; echo "build exit $?" >> critic/c71_build.log ) &
( /usr/bin/time -v true >/dev/null 2>&1; s=$(date +%s); npm run saves -- critic/c71_starts > critic/c71_saves.log 2>&1; echo "saves exit $? in $(( $(date +%s) - s )) s" >> critic/c71_saves.log ) &
wait
rm -rf critic/c71_dist/data/scenarios/1938h/start && cp -r critic/c71_starts critic/c71_dist/data/scenarios/1938h/start
echo done > critic/c71_build.done
