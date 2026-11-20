#!/bin/sh
# Critic run 90: build HEAD (fc767d88) into critic/c90_dist. The replay starts are rebuilt by c90_starts.sh (the sim
# changed: R217, R218, the AI's peace line); until then run 89's are copied in.
cd /c/Git/Warism
git rev-parse HEAD > critic/c90_commit.txt
npx vite build --outDir critic/c90_dist > critic/c90_build.log 2>&1; echo "build exit $?" >> critic/c90_build.log
rm -rf critic/c90_dist/data/scenarios/1938h/start && cp -r critic/c89_starts critic/c90_dist/data/scenarios/1938h/start
