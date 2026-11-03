#!/bin/sh
# Critic run 23: run 22's new probes behind its non-blocking list, re-run on HEAD (5299).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /' '__').log 2>&1; echo "   exit $?"; }
until grep -q CLICKSDONE critic/c30_clicks.log; do sleep 10; done
r c30_fw_forcewar 2207
r c30_fw2_forcewar 2207
r c30_k2_refusal 2203
r c30_k3_godtab 2203
r c30_td_touchdiplo 3391
r c30_hu_hurt 7019 12
r c30_sb_seaballs 7019
r c30_os2_scen
r c30_os2_scen critic/c26_critic_standoff.warsim-scenario c25
echo MISCDONE
