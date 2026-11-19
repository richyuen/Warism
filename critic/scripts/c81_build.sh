#!/bin/sh
# Critic run 81: build HEAD into critic/c81_dist. The sim, data and tools are unchanged since run 80's commit
# (git diff --stat 18c2b40a HEAD -- src/sim data public/data tools is empty), so the replay's yearly starts run 80 built
# (critic/c80_starts) are copied into it (critic/c81_starts) instead of rebuilt.
cd /c/Git/Warism
npx vite build --outDir critic/c81_dist > critic/c81_build.log 2>&1; echo "build exit $?" >> critic/c81_build.log
rm -rf critic/c81_starts && cp -r critic/c80_starts critic/c81_starts
rm -rf critic/c81_dist/data/scenarios/1938h/start && cp -r critic/c81_starts critic/c81_dist/data/scenarios/1938h/start
echo done > critic/c81_build.done
