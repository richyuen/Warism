#!/bin/sh
# Critic run 79: after the build, run 78's replay cases and new seeds (c79_startsJobs.txt) on HEAD's built starts
# (critic/c79_starts), then run 78's named headless cases (c79_jobsB.txt); 3 at a time beside the named chain's 5.
cd /c/Git/Warism
until [ -f critic/c79_build.done ]; do sleep 15; done
tr -d '\r' < critic/scripts/c79_startsJobs.txt | xargs -P 3 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c79_starts.progress'
tr -d '\r' < critic/scripts/c79_jobsB.txt | xargs -P 3 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c79_jobsB.progress'
echo done > critic/c79_chainS.done
