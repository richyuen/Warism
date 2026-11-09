#!/bin/sh
# Critic run 58 (full): the rest of the brief on HEAD (5359), new seeds.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5359
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,|' '______').log 2>&1; echo "   exit $?"; }
r c59_new mine 30309 1600 900 FRA 540
r c59_new build 30301 844 390
r c59_new build 30301 390 844
r c59_new filter 30305 1600 900
r c59_new filter 30305 390 844
r c59_new corridor 30307 390 844
r c59_new corridor 30307 1600 900
r c59_rg_relations 30129 365 1600 900 desk '&heroes=on'
r c59_rg_relations 30131 730 390 844 phone '&diplo=random'
r c59_os2_scen critic/c26_critic_standoff.warsim-scenario c59
r c59_sb_seaballs 20885 107 1188.17 328.5
r c59_kwhist 30151
r c59_z_zoom 30139
r c59_seaclick 30113
r c59_c_battle 30115
r c59_a_god_nuke 30117
r c59_q_god_tools 30119
r c59_g_editor 30121
r c59_kw_breakthrough 30123
r c59_pl_planes 30125 GER POL 5359
r c59_w_wing 30127
r c59_p_phone
r c59_u_ui
r c59_phz 30133 40
r c59_fw2_forcewar 30135
r c59_tm_touch
r c59_saveload_page 30137
r c59_rw_random 30165
echo SUITEBDONE
until grep -q '^done:' critic/c59_seed7019_save.log 2>/dev/null; do sleep 20; done
r c59_an_ainuke 7019 critic/c59_seed7019_y20.bin 7019y20 2 400
r c59_hist 7019 critic/c59_seed7019_y20.bin
r c59_dl_export 7019 critic/c59_seed7019_y20.bin
r c59_long_watch2 30141 12 '&heroes=on' hon
r c59_long_watch2 30143 12 '' plain
echo SUITEB2DONE
