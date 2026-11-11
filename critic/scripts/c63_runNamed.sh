#!/bin/sh
# Critic run 62: run 61's named landing cases, the R60-N1/N2 traces and two worldInvariants seeds, 6 at a time.
cd /c/Git/Warism
xargs -P 6 -I{} sh -c '{}' < critic/scripts/c63_jobsNamed.txt
echo done > critic/c63_named.done
