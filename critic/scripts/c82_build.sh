#!/bin/sh
# Critic run 82 (focused): build HEAD into critic/c82_dist. The sim, data and tools are unchanged since run 81's commit
# (git diff --stat 7c64529e HEAD -- src/sim data public/data tools is empty), so run 81's replay starts are copied.
cd /c/Git/Warism
npx vite build --outDir critic/c82_dist > critic/c82_build.log 2>&1; echo "build exit $?" >> critic/c82_build.log
rm -rf critic/c82_dist/data/scenarios/1938h/start && cp -r critic/c81_starts critic/c82_dist/data/scenarios/1938h/start
echo done > critic/c82_build.done
