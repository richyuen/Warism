#!/bin/sh
cd /c/Git/Warism
tr '\n' '\0' < critic/scripts/c59_jobs2.txt | xargs -0 -P ${P:-6} -I{} sh -c '{}; echo "fin: $(date +%T) {}"'
echo done:
