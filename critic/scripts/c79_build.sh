#!/bin/sh
# Critic run 79: build HEAD into critic/c79_dist and the replay's yearly starts into critic/c79_starts, put them in the build.
cd /c/Git/Warism
( npx vite build --outDir critic/c79_dist > critic/c79_build.log 2>&1; echo "build exit $?" >> critic/c79_build.log ) &
( s=$(date +%s); npm run saves -- critic/c79_starts > critic/c79_saves.log 2>&1; echo "saves exit $? in $(( $(date +%s) - s )) s" >> critic/c79_saves.log ) &
wait
rm -rf critic/c79_dist/data/scenarios/1938h/start && cp -r critic/c79_starts critic/c79_dist/data/scenarios/1938h/start
echo done > critic/c79_build.done
