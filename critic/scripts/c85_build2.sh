#!/bin/sh
# Critic run 85, completion: build HEAD (bd85eb10: R197, R198; page only, the sim unchanged since a9736eb5) into
# critic/c85b_dist with the replay starts copied (critic/c85_starts).
cd /c/Git/Warism
npx vite build --outDir critic/c85b_dist > critic/c85b_build.log 2>&1; echo "build exit $?" >> critic/c85b_build.log
rm -rf critic/c85b_dist/data/scenarios/1938h/start && cp -r critic/c85_starts critic/c85b_dist/data/scenarios/1938h/start
