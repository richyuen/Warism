#!/bin/sh
# Critic run 78: run 77's replay cases (c78_startsJobs.txt) on HEAD's built starts (critic/c78_starts), 5 at a time.
cd /c/Git/Warism
tr -d '\r' < critic/scripts/c78_startsJobs.txt | xargs -P 5 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c78_starts.progress'
echo done > critic/c78_startsjobs.done
