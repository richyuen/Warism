#!/bin/sh
# Critic run 71: the cases from the replay's built years (critic/scripts/c72_jobs4.txt), 3 at a time, after the starts are built.
cd /c/Git/Warism
true
tr -d '\r' < critic/scripts/c72_jobs4.txt | xargs -P 2 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c72_jobs4.progress'
echo done > critic/c72_jobs4.done
