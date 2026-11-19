#!/bin/sh
# Critic run 80: build HEAD into critic/c80_dist and the replay's yearly starts into critic/c80_starts, put them in the build.
cd /c/Git/Warism
( npx vite build --outDir critic/c80_dist > critic/c80_build.log 2>&1; echo "build exit $?" >> critic/c80_build.log ) &
( s=$(date +%s); npm run saves -- critic/c80_starts > critic/c80_saves.log 2>&1; echo "saves exit $? in $(( $(date +%s) - s )) s" >> critic/c80_saves.log ) &
wait
rm -rf critic/c80_dist/data/scenarios/1938h/start && cp -r critic/c80_starts critic/c80_dist/data/scenarios/1938h/start
echo done > critic/c80_build.done
