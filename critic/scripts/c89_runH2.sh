#!/bin/sh
# Critic run 89: the rest of c89_jobsH.txt (from line 7), 6 at a time (the first runner's 4 at a time was too slow for
# the hour; it was stopped with its four running jobs left to end). Done when all 26 lines are in the progress file.
cd /c/Git/Warism
tail -n +7 critic/scripts/c89_jobsH.txt | tr -d '\r' | xargs -P 6 -I{} sh -c '[ -f critic/c89_stop.flag ] && exit 0; {}; echo "$? {}" | cut -c1-160 >> critic/c89_jobsH.progress'
until [ $(grep -c . critic/c89_jobsH.progress) -ge 26 ]; do sleep 15; done
echo done > critic/c89_jobsH.done
