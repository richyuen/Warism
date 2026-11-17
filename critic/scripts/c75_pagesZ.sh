#!/bin/sh
# Critic run 75 (full): semantic zoom's own cases. The heroes' counters (run 74's heroPop, HEAD at 5377 beside run 74's
# build at 5378), run 73's markers case on both, and the new markerPop (R125's far rule, R131's hero markers at T1) on both.
cd /c/Git/Warism
sh critic/scripts/c75_pagesH.sh
for b in "head 5377" "c74build 5378"; do set -- $b
  BASE=http://127.0.0.1:$2 node critic/scripts/c75_markers.mjs 56951 $1 1600 900 1675,372 10,20,30 1800,1200,600 > critic/c75_mk_$1_desk.log 2>&1
done
mp() { # seed day cx,cy
  ( BASE=http://127.0.0.1:5377 node critic/scripts/c75_markerPop.mjs $1 $2 head $3 > critic/c75_mp_head_$1.log 2>&1 ) &
  ( BASE=http://127.0.0.1:5378 node critic/scripts/c75_markerPop.mjs $1 $2 c74build $3 > critic/c75_mp_c74build_$1.log 2>&1 ) &
  wait
}
mp 56951 30 1675,372
mp 58951 60 1675,372
mp 56901 400 1090,300
mp 58905 300 1090,300
echo ZDONE > critic/c75_pagesZ.done
