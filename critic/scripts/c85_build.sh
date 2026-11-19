#!/bin/sh
# Critic run 85 (full): build HEAD (a9736eb5) into critic/c85_dist. The sim, data and tools are unchanged since run 81's
# commit (git diff --stat 7c64529e HEAD -- src/sim data public/data tools is empty), so the replay's yearly starts run 80
# built (critic/c81_starts) are copied in (critic/c85_starts) instead of rebuilt.
cd /c/Git/Warism
npx vite build --outDir critic/c85_dist > critic/c85_build.log 2>&1; echo "build exit $?" >> critic/c85_build.log
rm -rf critic/c85_starts && cp -r critic/c81_starts critic/c85_starts
rm -rf critic/c85_dist/data/scenarios/1938h/start && cp -r critic/c85_starts critic/c85_dist/data/scenarios/1938h/start
echo done > critic/c85_build.done
