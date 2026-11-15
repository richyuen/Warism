#!/bin/sh
# Critic run 70: the starts-based headless cases (critic/scripts/c70_startsJobs.txt), 4 at a time, after the starts are built.
cd /c/Git/Warism
while [ ! -f critic/c70_build.done ]; do sleep 10; done
tr -d '\r' < critic/scripts/c70_startsJobs.txt | xargs -P 4 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c70_starts.progress'
echo done > critic/c70_chainS.done
