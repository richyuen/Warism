#!/bin/sh
# Critic run 41: run 40's timing cases, alone on the machine (the previews only).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c44_pf_lookfps 7019 critic/c44_seed7019_y20.bin
r c44_long_watch 6151 10
r c44_long_watch2 3517 10 '&heroes=on' hon
r c44_long_watch 18101 10
echo SUITEQDONE
