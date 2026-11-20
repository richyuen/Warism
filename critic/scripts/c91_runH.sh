#!/bin/sh
# Critic run 91: the headless cases on new seeds 91xxx (c91_jobsH.txt: run 85's jobs for the dimensions src/sim touches,
# and the capitals' tools, whose rule R209 rewrote), 4 at a time, after the every-run jobs (memory).
cd /c/Git/Warism
# the peace and R221 jobs first, at once with the every-run jobs (light: few-nation worlds)
tr -d '\r' < critic/scripts/c91_jobsH.txt | xargs -P ${P:-3} -I{} sh -c '[ -f critic/c91_stop.flag ] && exit 0; {}; echo "$? {}" | cut -c1-160 >> critic/c91_jobsH.progress'
echo done > critic/c91_jobsH.done
