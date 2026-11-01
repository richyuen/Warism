#!/bin/sh
# Critic run 22: run 21's click probes (EX2, SXG, SX, SXT) on HEAD (5299) and on run 21's build (5298).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /' '__').log 2>&1; echo "   exit $?"; }
r c22_ex2_enemypanel 4441
r c22_ex2old_enemypanel 4441
r c22_sxg_front 6827 JAP CHI China 45
r c22_sxgold_front 6827 JAP CHI China 45
r c22_sxg_front 3917 ITA YUG Yugoslavia 45
r c22_sxgold_front 3917 ITA YUG Yugoslavia 45
r c22_sx_selpanel 4441
r c22_sxt_touch
echo CLICKSDONE
