#!/bin/sh
# Critic run 68 (focused): the page cases of Batch 25's items and run 67's named page cases, one at a time on the c68
# build at 5368. Then chain B, after the year-20 saves and the starts.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5368
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1800 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,?:' '_______').log 2>&1; echo "   exit $?"; }
r c68_burst 41207 london a
r c68_c_battle 39915
r c68_c_battle 7781
r c68_c_battle 41915
r c68_w_wing 39927
r c68_w_wing 35127
r c68_w_wing 41927
r c68_rg_relations 39939 365 1600 900 desk ''
r c68_rg_relations 39931 730 390 844 phone '&diplo=random'
r c68_rg_relations 41939 365 1600 900 desk ''
r c68_rg_relations 41939 365 390 844 phone ''
r c68_a_god_nuke 39917
r c68_q_god_tools 39919
r c68_undo 41209 90
r c68_z_zoom 39911
r c68_pl_planes 39925 GER POL 5368
r c68_k_breakthrough 39979
r c68_saveload_page 39937 200
r c68_x_editor 32443
r c68_u_ui
r c68_p_phone
echo PAGESADONE
until grep -q '^done:' critic/c68_seed7019_save.log 2>/dev/null && grep -q '^done:' critic/c68_seed32019_save.log 2>/dev/null && [ -f critic/c68_build.done ]; do sleep 20; done
r c68_an_ainuke 7019 critic/c68_seed7019_y20.bin 7019y20 2 400
r c68_hist 32019 critic/c68_seed32019_y20.bin
r c68_dl_export 32019 critic/c68_seed32019_y20.bin
r c68_x_stage normandyD 1944 1944-06-05 1020.6 291.6 50
r c68_x_stage uranus 1942 1942-11-20 1277.2 296 8
r c68_long_watch2 41941 12 '' plain
echo PAGESBDONE
