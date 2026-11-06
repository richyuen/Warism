#!/bin/sh
# Critic run 43 (full): run 39's page probes on new seeds, lane 2.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c43_rg_relations 17513 365 1600 900 desk '&heroes=on'
r c43_pl_planes 17203 GER POL 5299
r c43_hf_herofold 17101 730 0 1600 900 desk
r c43_os2_scen critic/c26_critic_standoff.warsim-scenario c25
r c43_sb_seaballs 7019
r c43_g_editor 17101
r c43_p_phone
r c43_u_ui
r c43_bt 17411 390 844 phone
r c43_fw2_forcewar 17513
r c43_tr_traits 17101 phone phone
r c43_shm_mass 17203 10 1600 900 ten
echo SUITEF2DONE
