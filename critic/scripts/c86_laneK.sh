#!/bin/bash
# Critic run 86: run 85's named phone cases of the war row again on bd85eb10 (5411): R197 now clears the row's inline
# left and max-width on every layout, the phone's included. Outputs critic/c86_<n>_<args>_5411.log.
cd /c/Git/Warism
p() { b=$1; n=$2; s=$3; shift 3; echo "== $n $b $* $(date +%T)"; BASE=http://127.0.0.1:$b TAG=_c86_$b DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c86_${n}_$(echo "$*" | tr ' ,' '__')_$b.log 2>&1; echo "   exit $?"; }
p 5411 pr c83_phoneRow 83901 200 375 667 90
p 5411 pr c83_phoneRow 83903 500 844 390 90
p 5411 pd c83_phoneToDesk 68901 400
p 5411 pd c83_phoneToDesk 83903 700 375x667,1280x720,1024x768,375x667
p 5411 pd c83_phoneToDesk 83901 400 384x832,1366x768,1024x768,384x832
p 5411 rot c83_rotate 68901 400 GER 20
echo done > critic/c86_laneK.done
