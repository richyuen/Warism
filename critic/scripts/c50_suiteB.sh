#!/bin/sh
# Critic run 50 (full): the rest of the page probes, after every c50 script was pointed at c50_lib (5311): run 48's
# copies imported c31_lib, fixed at 5299, a server not mine (c50_z_zoom 20865 and c50_c_battle were stopped and rerun).
cd /c/Git/Warism
export BASE=http://127.0.0.1:5311
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 5400 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c50_wait_page 20861 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 1600 900 45
r c50_z_zoom 20865
r c50_c_battle 20871
r c50_a_god_nuke 20873
r c50_q_god_tools 20875
r c50_g_editor 20877
r c50_k_breakthrough 20879
r c50_pl_planes 20881 GER POL 5311
r c50_w_wing 20883
r c50_sb_seaballs 20885
r c50_p_phone
r c50_u_ui
r c50_rg_relations 20887 365 1600 900 desk '&heroes=on'
r c50_rg_relations 20889 365 390 844 phone '&diplo=random'
r c50_phz 20891 40
r c50_os2_scen critic/c26_critic_standoff.warsim-scenario c50
r c50_fw2_forcewar 20893
r c50_tm_touch
r c50_an_ainuke 7019 critic/c50_seed7019_y20.bin 7019y20 2 400
r c50_hist 7019 critic/c50_seed7019_y20.bin
r c50_dl_export 7019 critic/c50_seed7019_y20.bin
r c50_long_watch2 20895 12 '&heroes=on' hon
r c50_long_watch2 20897 12 '' plain
echo SUITEBDONE
