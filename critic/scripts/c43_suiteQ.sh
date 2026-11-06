#!/bin/sh
# Critic run 41: run 40's timing cases, alone on the machine (the previews only).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c43_pf_lookfps 7019 critic/c32_seed7019_y20.bin
r c43_long_watch 6151 10
r c43_long_watch2 3517 10 '&heroes=on' hon
r c43_long_watch 17101 10
echo SUITEQDONE
