#!/bin/sh
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c44_g_editor 4877
r c44_os2_scen critic/c26_critic_standoff.warsim-scenario c25
r c44_sb_seaballs 7019
r c44_pl_planes 7019 GER POL 5299
r c44_p_phone
r c44_u_ui
r c44_rg_relations 4111 365 1600 900 desk '&heroes=on'
r c44_hs_herostack 3517
r c44_bt 5113 390 844 phone
r c44_fw2_forcewar 2207
r c44_tr_traits 3517 phone phone
r c44_long_watch2 3517 10 '&heroes=on' hon
echo SUITEBDONE
