#!/bin/sh
cd /c/Git/Warism
r() { tag=$1; shift; echo "== $tag $* $(date +%T)"; timeout 3600 "$@" > critic/c45_$tag.log 2>&1; echo "   exit $?"; }
r se_one env MODE=one node critic/scripts/c45_se_seaedit.mjs 3517 50 one &
r se_both env MODE=both node critic/scripts/c45_se_seaedit.mjs 3517 50 both &
wait
r se_home env MODE=home node critic/scripts/c45_se_seaedit.mjs 3517 50 home &
r se_tsing env MODE=tsing node critic/scripts/c45_se_seaedit.mjs 3517 50 tsing &
wait
echo SUITESEDONE
