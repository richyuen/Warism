#!/bin/sh
# Critic run 72: the cases from the replay's built years (critic/scripts/c72_startsJobs.txt), 3 at a time, after the starts are built; then the afterStarts set.
cd /c/Git/Warism
until [ -f critic/c72_build.done ]; do sleep 15; done
tr -d '\r' < critic/scripts/c72_startsJobs.txt | xargs -P 3 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c72_starts.progress'
echo done > critic/c72_startsjobs.done
