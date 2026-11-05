#!/bin/sh
# Critic run 37: the timing cases and the editor probe, alone on the machine (nothing else running).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c37_pf_lookfps 7019 critic/c32_seed7019_y20.bin
r c37_long_watch 6151 10
r c37_long_watch2 3517 10 '&heroes=on' hon
r c37_g_editor 4877
echo SUITEQDONE
