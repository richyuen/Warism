#!/bin/sh
# Critic run 91: the headless jobs from line 6 of c91_jobsH.txt on (lines 1-5: the first runner, c91_runH.sh, stopped at
# 13:08 with lines 3-5 still running to their end), P at once (default 4); each line claimed by a mkdir so that a second
# copy of this runner never runs a job twice.
cd /c/Git/Warism
mkdir -p critic/c91_claims
tr -d '\r' < critic/scripts/c91_jobsH.txt | tail -n +6 | awk '{print NR+5 "\t" $0}' | xargs -P ${P:-4} -I{} sh -c 'L="{}"; n=${L%%	*}; c=${L#*	}; [ -f critic/c91_stop.flag ] && exit 0; mkdir critic/c91_claims/$n 2>/dev/null || exit 0; sh -c "$c"; echo "$? $c" | cut -c1-160 >> critic/c91_jobsH.progress'
echo done > critic/c91_jobsH.done
