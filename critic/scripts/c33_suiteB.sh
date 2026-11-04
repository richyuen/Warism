#!/bin/sh
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c33_g_editor 4877
r c33_os2_scen critic/c26_critic_standoff.warsim-scenario c25
r c33_sb_seaballs 7019
r c33_pl_planes 7019 GER POL 5299
r c33_p_phone
r c33_u_ui
r c33_rg_relations 4111 365 1600 900 desk '&heroes=on'
r c33_hs_herostack 3517
r c33_bt 5113 390 844 phone
r c33_fw2_forcewar 2207
r c33_tr_traits 3517 phone phone
r c33_long_watch2 3517 10 '&heroes=on' hon
echo SUITEBDONE
