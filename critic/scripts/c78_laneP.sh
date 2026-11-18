#!/bin/sh
# Critic run 78: run 77's page cases of the carried dimensions on HEAD (5397), three lanes at a time. They click through
# view.onSelect and togglePause, which R157 and R158 changed.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5397
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 900 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,?:' '_______' | cut -c1-80).log 2>&1; echo "   exit $?"; }
(
  r c78_takescore 1942 GER 240
  r c78_heropanel 55929
  r c78_undo2 41211
  r c78_undo2y 51231
  r c78_peacebtn 58217 GER POL 40 5 844 390
) > critic/c78_laneP1.out 2>&1 &
(
  r c78_godpeace 1942 JAP 'United States'
  r c78_god42 1942 53542 replay
  r c78_x_stage normandyD 1944 1944-06-05 1020.6 291.6 50
  r c78_x_continue 58415 40 GER 60
) > critic/c78_laneP2.out 2>&1 &
(
  timeout 500 node critic/scripts/c78_a_god_nuke.mjs 63917 > critic/c78_a_god_nuke.63917.log 2>&1; echo "a_god_nuke $?"
  timeout 500 node critic/scripts/c78_q_god_tools.mjs 63919 > critic/c78_q_god_tools.63919.log 2>&1; echo "q_god_tools $?"
  EXTRA='&heroes=on' timeout 600 node critic/scripts/c78_g_editor.mjs 58921 > critic/c78_g_editor.58921.log 2>&1; echo "g_editor $?"
  timeout 500 node critic/scripts/c78_c_battle.mjs 63915 > critic/c78_c_battle.63915.log 2>&1; echo "c_battle $?"
  timeout 500 node critic/scripts/c78_pl_planes.mjs 63925 GER POL 5397 > critic/c78_pl_planes.63925.log 2>&1; echo "pl_planes $?"
  timeout 500 node critic/scripts/c78_z_zoom.mjs 63911 > critic/c78_z_zoom.63911.log 2>&1; echo "z_zoom $?"
) > critic/c78_laneP3.out 2>&1 &
wait
echo done > critic/c78_laneP.done
