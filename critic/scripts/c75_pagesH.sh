#!/bin/sh
# Critic run 75 (focused): R128 on run 74's own probe (R74-N1, the bar of semantic zoom): heroPop on HEAD's build (5377)
# and on run 73's build (5378; `git diff a9814c43 HEAD -- src/render` is empty), the two at the same time, pair by pair.
cd /c/Git/Warism
pair() { # seed day wheel
  if [ "$3" = w ]; then
    ( WHEEL=1 BASE=http://127.0.0.1:5377 node critic/scripts/c75_heroPop.mjs $1 $2 head > critic/c75_hpw_head_$1.log 2>&1 ) &
    ( WHEEL=1 BASE=http://127.0.0.1:5378 node critic/scripts/c75_heroPop.mjs $1 $2 c74build > critic/c75_hpw_c74build_$1.log 2>&1 ) &
  else
    ( BASE=http://127.0.0.1:5377 node critic/scripts/c75_heroPop.mjs $1 $2 head > critic/c75_hp_head_$1$4.log 2>&1 ) &
    ( BASE=http://127.0.0.1:5378 node critic/scripts/c75_heroPop.mjs $1 $2 c74build > critic/c75_hp_c74build_$1$4.log 2>&1 ) &
  fi
  wait
}
pair 56901 400
pair 57905 200
pair 56901 430 w
pair 57905 230 w
pair 58905 300
pair 58905 330 w
echo HDONE > critic/c75_pagesH.done
