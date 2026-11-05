#!/bin/sh
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c36_g_editor 4877
r c36_os2_scen critic/c26_critic_standoff.warsim-scenario c25
r c36_sb_seaballs 7019
r c36_pl_planes 7019 GER POL 5299
r c36_p_phone
r c36_u_ui
r c36_rg_relations 4111 365 1600 900 desk '&heroes=on'
r c36_hs_herostack 3517
r c36_bt 5113 390 844 phone
r c36_fw2_forcewar 2207
r c36_tr_traits 3517 phone phone
r c36_long_watch2 3517 10 '&heroes=on' hon
echo SUITEBDONE
