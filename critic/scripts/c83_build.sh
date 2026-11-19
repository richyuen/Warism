#!/bin/sh
# Critic run 83 (focused): build HEAD (42d0964e) into critic/c83_dist. The sim, data and tools are unchanged since run 82's
# commit (git diff --stat 3e560a9c HEAD -- src/sim data public/data tools is empty), so run 82's replay starts are copied.
cd /c/Git/Warism
npx vite build --outDir critic/c83_dist > critic/c83_build.log 2>&1; echo "build exit $?" >> critic/c83_build.log
rm -rf critic/c83_dist/data/scenarios/1938h/start && cp -r critic/c81_starts critic/c83_dist/data/scenarios/1938h/start
echo done > critic/c83_build.done
