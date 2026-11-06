#!/bin/sh
# Critic run 43 (full): run 39's page probes on new seeds, lane 2.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c44_rg_relations 18513 365 1600 900 desk '&heroes=on'
r c44_pl_planes 18203 GER POL 5299
r c44_hf_herofold 18101 730 0 1600 900 desk
r c44_os2_scen critic/c26_critic_standoff.warsim-scenario c25
r c44_sb_seaballs 7019
r c44_g_editor 18101
r c44_p_phone
r c44_u_ui
r c44_bt 18411 390 844 phone
r c44_fw2_forcewar 18513
r c44_tr_traits 18101 phone phone
r c44_shm_mass 18203 10 1600 900 ten
echo SUITEF2DONE
