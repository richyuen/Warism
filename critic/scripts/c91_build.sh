#!/bin/sh
# Critic run 91: build HEAD (4f5c5427) into critic/c91_dist; run 90's replay starts (rebuilt on fc767d88) copied in
# until c91_starts.sh decides (1938's hash unchanged by Batch 58: then they stand).
cd /c/Git/Warism
git rev-parse HEAD > critic/c91_commit.txt
npx vite build --outDir critic/c91_dist > critic/c91_build.log 2>&1; echo "build exit $?" >> critic/c91_build.log
rm -rf critic/c91_dist/data/scenarios/1938h/start && cp -r critic/c90_starts critic/c91_dist/data/scenarios/1938h/start
