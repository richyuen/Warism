#!/bin/sh
# Critic run 89: build HEAD (f27f48f5: R209, enemyDistance's loop; src/sim/systems/capitals.ts) into critic/c89_dist.
# The replay starts are rebuilt by c89_starts.sh (the sim changed); until then run 85's are copied in.
cd /c/Git/Warism
git rev-parse HEAD > critic/c89_commit.txt
npx vite build --outDir critic/c89_dist > critic/c89_build.log 2>&1; echo "build exit $?" >> critic/c89_build.log
rm -rf critic/c89_dist/data/scenarios/1938h/start && cp -r critic/c85_starts critic/c89_dist/data/scenarios/1938h/start
