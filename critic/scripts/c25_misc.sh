#!/bin/sh
# Critic run 23: run 22's new probes behind its non-blocking list, re-run on HEAD (5297).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /' '__').log 2>&1; echo "   exit $?"; }
until grep -q CLICKSDONE critic/c25_clicks.log; do sleep 10; done
r c25_fw_forcewar 2207
r c25_fw2_forcewar 2207
r c25_k2_refusal 2203
r c25_k3_godtab 2203
r c25_td_touchdiplo 3391
r c25_hu_hurt 7019 12
r c25_sb_seaballs 7019
r c25_os2_scen
r c25_os2_scen critic/c24_critic_standoff.warsim-scenario c24
echo MISCDONE
