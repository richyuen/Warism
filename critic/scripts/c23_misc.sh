#!/bin/sh
# Critic run 23: run 22's new probes behind its non-blocking list, re-run on HEAD (5299).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /' '__').log 2>&1; echo "   exit $?"; }
until grep -q CLICKSDONE critic/c23_clicks.log; do sleep 10; done
r c23_fw_forcewar 2207
r c23_fw2_forcewar 2207
r c23_k2_refusal 2203
r c23_k3_godtab 2203
r c23_td_touchdiplo 3391
r c23_hu_hurt 7019 12
r c23_sb_seaballs 7019
r c23_os2_scen
r c23_os2_scen critic/c22_critic_standoff.warsim-scenario c22
echo MISCDONE
