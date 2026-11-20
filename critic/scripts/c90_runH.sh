#!/bin/sh
# Critic run 90: the headless cases on new seeds 90xxx (c90_jobsH.txt: run 85's jobs for the dimensions src/sim touches,
# and the capitals' tools, whose rule R209 rewrote), 4 at a time, after the every-run jobs (memory).
cd /c/Git/Warism
until grep -q LONGDONE critic/c90_long.status 2>/dev/null; do sleep 15; done
tr -d '\r' < critic/scripts/c90_jobsH.txt | xargs -P 4 -I{} sh -c '[ -f critic/c90_stop.flag ] && exit 0; {}; echo "$? {}" | cut -c1-160 >> critic/c90_jobsH.progress'
echo done > critic/c90_jobsH.done
