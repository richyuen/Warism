#!/bin/sh
# Critic run 23: run 22's probes re-run on HEAD (port 5299).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /' '__').log 2>&1; echo "   exit $?"; }
r c27_ex2_enemypanel 4441
r c27_sxg_front 6827 JAP CHI China 45
r c27_sxg_front 3917 ITA YUG Yugoslavia 45
r c27_sx_selpanel 4441
r c27_sxt_touch
echo CLICKSDONE
