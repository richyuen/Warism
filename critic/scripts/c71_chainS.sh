#!/bin/sh
# Critic run 71: the cases from the replay's built years (critic/scripts/c71_startsJobs.txt), 3 at a time, after the starts are built.
cd /c/Git/Warism
until [ -f critic/c71_build.done ]; do sleep 15; done
tr -d '\r' < critic/scripts/c71_startsJobs.txt | xargs -P 3 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c71_starts.progress'
echo done > critic/c71_startsjobs.done
