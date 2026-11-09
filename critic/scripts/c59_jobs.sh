#!/bin/sh
cd /c/Git/Warism
until grep -q '^done:' critic/c59_la.log 2>/dev/null; do sleep 30; done
tr '\n' '\0' < critic/scripts/c59_jobsAll.txt | xargs -0 -P ${P:-4} -I{} sh -c '{}; echo "fin: $(date +%T) {}"'
echo done:
