#!/bin/sh
# Critic run 73: the cases from the replay's built years (critic/scripts/c74_startsJobs.txt), 3 at a time, after the
# starts are built. Guarded: a second copy does nothing.
cd /c/Git/Warism
mkdir critic/c74_starts.lock 2>/dev/null || { echo "already running"; exit 0; }
until [ -f critic/c74_build.done ]; do sleep 15; done
tr -d '\r' < critic/scripts/c74_startsJobs.txt | xargs -P 3 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c74_starts.progress'
echo done > critic/c74_startsjobs.done
