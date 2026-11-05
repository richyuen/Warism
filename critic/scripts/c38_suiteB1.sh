#!/bin/sh
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c38_os2_scen critic/c26_critic_standoff.warsim-scenario c25
r c38_sb_seaballs 7019
r c38_pl_planes 7019 GER POL 5299
r c38_p_phone
r c38_u_ui
r c38_rg_relations 4111 365 1600 900 desk '&heroes=on'
r c38_hs_herostack 3517
r c38_bt 5113 390 844 phone
r c38_fw2_forcewar 2207
r c38_tr_traits 3517 phone phone
echo SUITEBDONE
