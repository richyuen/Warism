#!/bin/sh
# Critic run 64: run 63's named headless cases (landing, traces, R61-SC, sea battles, workerDeterminism, the 3350x
# checkers, the two 20-year saves) and two more worldInvariants seeds, 6 at a time.
cd /c/Git/Warism
xargs -P 6 -I{} sh -c '{}' < critic/scripts/c64_jobsNamed.txt
echo done > critic/c64_named.done
