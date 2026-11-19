#!/bin/sh
# Critic run 80: after the build, run 78's replay cases and new seeds (c80_startsJobs.txt) on HEAD's built starts
# (critic/c80_starts), then run 78's named headless cases (c80_jobsB.txt); 3 at a time beside the named chain's 5.
cd /c/Git/Warism
until [ -f critic/c80_build.done ]; do sleep 15; done
tr -d '\r' < critic/scripts/c80_startsJobs.txt | xargs -P 3 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c80_starts.progress'
tr -d '\r' < critic/scripts/c80_jobsB.txt | xargs -P 3 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c80_jobsB.progress'
echo done > critic/c80_chainS.done
