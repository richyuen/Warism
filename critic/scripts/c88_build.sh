#!/bin/sh
# Critic run 88: build HEAD (3e1ed78e: R203 to R208; page only, the sim unchanged since a9736eb5) into critic/c88_dist,
# with the replay starts copied (critic/c85_starts, sim unchanged).
cd /c/Git/Warism
git rev-parse HEAD > critic/c88_commit.txt
npx vite build --outDir critic/c88_dist > critic/c88_build.log 2>&1; echo "build exit $?" >> critic/c88_build.log
rm -rf critic/c88_dist/data/scenarios/1938h/start && cp -r critic/c85_starts critic/c88_dist/data/scenarios/1938h/start
