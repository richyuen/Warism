#!/bin/sh
# Critic run 57 (full): the rest of the brief on HEAD (5357), one at a time; the batch's new UI (R55h-j) first.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5357
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,|' '______').log 2>&1; echo "   exit $?"; }
# R55-N1 (R55i): a war joined by guarantee, My wars only
r c57_new mine 26309 1600 900 FRA 540
r c57_histgrep 26309 FRA 540 'declared|joined|alliance|allied|pact|side|guarant'
r c57_new mine 28309 1600 900 FRA 540
r c57_new mine 28303 390 844 GER 365
# R55-N2 (R55j): landscape phone Build and Actions
r c57_new build 26301 844 390
r c57_new build 28301 844 390
r c57_new build 28301 390 844
r c57_new build 28301 1280 720
# R55h small items: editor filter, phone Breakthrough
r c57_new filter 26305 1600 900
r c57_new filter 26305 390 844
r c57_new corridor 26307 390 844
r c57_new corridor 28307 1600 900
# the rest of the brief, new seeds
r c57_rg_relations 28129 365 1600 900 desk '&heroes=on'
r c57_rg_relations 28139 365 1600 900 desk ''
r c57_rg_relations 28131 730 390 844 phone '&diplo=random'
r c57_os2_scen critic/c26_critic_standoff.warsim-scenario c57
r c57_sb_seaballs 20885 107 1188.17 328.5
r c57_k_breakthrough 28179
r c57_kwhist 28151
r c57_z_zoom 28111
r c57_seaclick 28113
r c57_c_battle 28115
r c57_a_god_nuke 28117
r c57_q_god_tools 28119
r c57_g_editor 28121
r c57_kw_breakthrough 28123
r c57_pl_planes 28125 GER POL 5357
r c57_w_wing 28127
r c57_p_phone
r c57_u_ui
r c57_phz 28133 40
r c57_fw2_forcewar 28135
r c57_tm_touch
r c57_saveload_page 28137
r c57_rw_random 28165
echo SUITEBDONE
until grep -q '^done:' critic/c57_seed7019_save.log 2>/dev/null; do sleep 20; done
r c57_an_ainuke 7019 critic/c57_seed7019_y20.bin 7019y20 2 400
r c57_hist 7019 critic/c57_seed7019_y20.bin
r c57_dl_export 7019 critic/c57_seed7019_y20.bin
r c57_long_watch2 28141 12 '&heroes=on' hon
r c57_long_watch2 28143 12 '' plain
echo SUITEB2DONE
