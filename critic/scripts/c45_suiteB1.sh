#!/bin/sh
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c45_os2_scen critic/c26_critic_standoff.warsim-scenario c25
r c45_sb_seaballs 7019
r c45_pl_planes 7019 GER POL 5299
r c45_p_phone
r c45_u_ui
r c45_rg_relations 4111 365 1600 900 desk '&heroes=on'
r c45_hs_herostack 3517
r c45_bt 5113 390 844 phone
r c45_fw2_forcewar 2207
r c45_tr_traits 3517 phone phone
echo SUITEBDONE
