#!/bin/sh
# Critic run 65: run 64's named headless cases, the checkers on new seeds (37001-37011) and the track checker
# (1938, 37301, 37303; the track now runs to 1975), 6 at a time. Then landingFuzz on 15 new seeds from 37101.
cd /c/Git/Warism
tr -d '\r' < critic/scripts/c65_jobsNamed.txt | xargs -P 6 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c65_named.progress'
echo done > critic/c65_named.done
