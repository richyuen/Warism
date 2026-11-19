#!/bin/sh
# Critic run 84 (focused): build HEAD (764aa144) into critic/c84_dist. Sim, data and tools unchanged since run 83's commit
# (git diff --stat 42d0964e HEAD -- src/sim data public/data tools is empty), so the replay starts are copied.
cd /c/Git/Warism
npx vite build --outDir critic/c84_dist > critic/c84_build.log 2>&1; echo "build exit $?" >> critic/c84_build.log
rm -rf critic/c84_dist/data/scenarios/1938h/start && cp -r critic/c81_starts critic/c84_dist/data/scenarios/1938h/start
echo done > critic/c84_build.done
