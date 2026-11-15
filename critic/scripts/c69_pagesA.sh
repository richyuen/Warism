#!/bin/sh
# Critic run 69 (full): run 68's named page cases and the same probes on new seeds (51xxx), one at a time on the c69
# build at 5369: R68-B1's three cases and the untried scenario load, the bursts, battle tags (R81i), the wing, the
# relations graph, God, zoom, planes, breakthrough, save/load, the editor, the UI; then the cases on the year-20 saves.
cd /c/Git/Warism
until [ -f critic/c69_build.done ]; do sleep 15; done
export BASE=http://127.0.0.1:5369
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1800 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,?:' '_______').log 2>&1; echo "   exit $?"; }
r c69_undo2 41211
r c69_loadruins 41203
r c69_undo 41201 30
r c69_loadscen 41203
r c69_undo2 51211
r c69_loadruins 51203
r c69_loadscen 51205
r c69_undo 51209 90
r c69_burst 41205 paris
r c69_burst 41207 london a
r c69_burst 51207 moscow
r c69_c_battle 39915
r c69_c_battle 7781
r c69_c_battle 41915
r c69_c_battle 51915
r c69_w_wing 39927
r c69_w_wing 35127
r c69_w_wing 41927
r c69_w_wing 51927
r c69_rg_relations 39939 365 1600 900 desk ''
r c69_rg_relations 39931 730 390 844 phone '&diplo=random'
r c69_rg_relations 41939 365 1600 900 desk ''
r c69_rg_relations 51939 365 1600 900 desk ''
r c69_rg_relations 51939 365 390 844 phone ''
r c69_a_god_nuke 39917
r c69_a_god_nuke 51917
r c69_q_god_tools 39919
r c69_q_god_tools 51919
r c69_z_zoom 39911
r c69_z_zoom 51911
r c69_pl_planes 39925 GER POL 5369
r c69_pl_planes 51925 GER POL 5369
r c69_k_breakthrough 39979
r c69_k_breakthrough 51979
r c69_saveload_page 39937 200
r c69_saveload_page 51937 200
r c69_x_editor 32443
r c69_u_ui
r c69_p_phone
echo PAGESADONE
until grep -q '^done:' critic/c69_seed7019_save.log 2>/dev/null && grep -q '^done:' critic/c69_seed32019_save.log 2>/dev/null; do sleep 20; done
r c69_an_ainuke 7019 critic/c69_seed7019_y20.bin 7019y20 2 400
r c69_hist 32019 critic/c69_seed32019_y20.bin
r c69_dl_export 32019 critic/c69_seed32019_y20.bin
r c69_x_stage normandyD 1944 1944-06-05 1020.6 291.6 50
r c69_x_stage uranus 1942 1942-11-20 1277.2 296 8
r c69_x_stage stalin 1942 1942-10-22 1277.2 296 12
r c69_long_watch2 51941 12 '' plain
r c69_long_watch2 51943 12 '&heroes=on' hon
echo PAGESBDONE
