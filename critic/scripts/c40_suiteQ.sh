#!/bin/sh
# Critic run 38 (copy of run 37): the timing cases and the editor probe, alone on the machine (nothing else running).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c40_pf_lookfps 7019 critic/c32_seed7019_y20.bin
r c40_long_watch 6151 10
r c40_long_watch2 3517 10 '&heroes=on' hon
r c40_g_editor 4877
r c40_long_watch 13109 10
echo SUITEQDONE
