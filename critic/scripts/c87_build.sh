#!/bin/sh
# Critic run 87: build HEAD (bbf47bca: R200 to R202; page only, the sim unchanged since a9736eb5) into critic/c87_dist,
# with the replay starts copied (critic/c85_starts, sim unchanged).
cd /c/Git/Warism
git rev-parse HEAD > critic/c87_commit.txt
npx vite build --outDir critic/c87_dist > critic/c87_build.log 2>&1; echo "build exit $?" >> critic/c87_build.log
rm -rf critic/c87_dist/data/scenarios/1938h/start && cp -r critic/c85_starts critic/c87_dist/data/scenarios/1938h/start
