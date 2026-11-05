#!/bin/sh
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c40_g_editor 4877
r c40_os2_scen critic/c26_critic_standoff.warsim-scenario c25
r c40_sb_seaballs 7019
r c40_pl_planes 7019 GER POL 5299
r c40_p_phone
r c40_u_ui
r c40_rg_relations 4111 365 1600 900 desk '&heroes=on'
r c40_hs_herostack 3517
r c40_bt 5113 390 844 phone
r c40_fw2_forcewar 2207
r c40_tr_traits 3517 phone phone
r c40_long_watch2 3517 10 '&heroes=on' hon
echo SUITEBDONE
