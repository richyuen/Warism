#!/bin/sh
# Critic run 78: build HEAD into critic/c78_dist and the replay's yearly starts into critic/c78_starts, put them in the build.
cd /c/Git/Warism
( npx vite build --outDir critic/c78_dist > critic/c78_build.log 2>&1; echo "build exit $?" >> critic/c78_build.log ) &
( s=$(date +%s); npm run saves -- critic/c78_starts > critic/c78_saves.log 2>&1; echo "saves exit $? in $(( $(date +%s) - s )) s" >> critic/c78_saves.log ) &
wait
rm -rf critic/c78_dist/data/scenarios/1938h/start && cp -r critic/c78_starts critic/c78_dist/data/scenarios/1938h/start
echo done > critic/c78_build.done
