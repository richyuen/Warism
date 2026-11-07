#!/bin/sh
# Critic run 51 (full): the rest of the page probes, after every c51 script was pointed at c51_lib (5321): run 48's
# copies imported c31_lib, fixed at 5299, a server not mine (c51_z_zoom 20865 and c51_c_battle were stopped and rerun).
cd /c/Git/Warism
export BASE=http://127.0.0.1:5321
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 5400 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c51_wait_page 20861 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 1600 900 45
r c51_z_zoom 20865
r c51_c_battle 20871
r c51_a_god_nuke 20873
r c51_q_god_tools 20875
r c51_g_editor 20877
r c51_k_breakthrough 20879
r c51_pl_planes 20881 GER POL 5321
r c51_w_wing 20883
r c51_sb_seaballs 20885
r c51_p_phone
r c51_u_ui
r c51_rg_relations 20887 365 1600 900 desk '&heroes=on'
r c51_rg_relations 20889 365 390 844 phone '&diplo=random'
r c51_phz 20891 40
r c51_os2_scen critic/c26_critic_standoff.warsim-scenario c51
r c51_fw2_forcewar 20893
r c51_tm_touch
r c51_an_ainuke 7019 critic/c51_seed7019_y20.bin 7019y20 2 400
r c51_hist 7019 critic/c51_seed7019_y20.bin
r c51_dl_export 7019 critic/c51_seed7019_y20.bin
r c51_long_watch2 20895 12 '&heroes=on' hon
r c51_long_watch2 20897 12 '' plain
echo SUITEBDONE
