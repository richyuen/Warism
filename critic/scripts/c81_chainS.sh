#!/bin/sh
# Critic run 80: after the build, run 78's replay cases and new seeds (c81_startsJobs.txt) on HEAD's built starts
# (critic/c81_starts), then run 78's named headless cases (c81_jobsB.txt); 3 at a time beside the named chain's 5.
cd /c/Git/Warism
until [ -f critic/c81_build.done ]; do sleep 15; done
tr -d '\r' < critic/scripts/c81_startsJobs.txt | xargs -P 3 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c81_starts.progress'
tr -d '\r' < critic/scripts/c81_jobsB.txt | xargs -P 3 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c81_jobsB.progress'
echo done > critic/c81_chainS.done
