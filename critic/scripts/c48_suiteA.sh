#!/bin/sh
# Critic run 48 (full): broad page probes on new seeds (run 44's scripts, renamed).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c48_z_zoom 20441
r c48_c_battle 20443
r c48_a_god_nuke 20445
r c48_q_god_tools 20447
r c48_g_editor 20449
r c48_k_breakthrough 20451
r c48_pl_planes 20453 GER POL 5299
r c48_w_wing 20455
r c48_sb_seaballs 20457
r c48_p_phone
r c48_u_ui
r c48_rg_relations 20459 365 1600 900 desk '&heroes=on'
r c48_phz 20461 40
r c48_os2_scen critic/c26_critic_standoff.warsim-scenario c48
r c48_fw2_forcewar 20463
echo SUITEADONE
