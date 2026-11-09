#!/bin/sh
# Critic run 58 (full): the rest of the brief on HEAD (5358), new seeds.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5358
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,|' '______').log 2>&1; echo "   exit $?"; }
r c58_new mine 29309 1600 900 FRA 540
r c58_new build 29301 844 390
r c58_new build 29301 390 844
r c58_new filter 29305 1600 900
r c58_new filter 29305 390 844
r c58_new corridor 29307 390 844
r c58_new corridor 29307 1600 900
r c58_rg_relations 29129 365 1600 900 desk '&heroes=on'
r c58_rg_relations 29131 730 390 844 phone '&diplo=random'
r c58_os2_scen critic/c26_critic_standoff.warsim-scenario c58
r c58_sb_seaballs 20885 107 1188.17 328.5
r c58_kwhist 29151
r c58_z_zoom 29111
r c58_seaclick 29113
r c58_c_battle 29115
r c58_a_god_nuke 29117
r c58_q_god_tools 29119
r c58_g_editor 29121
r c58_kw_breakthrough 29123
r c58_pl_planes 29125 GER POL 5358
r c58_w_wing 29127
r c58_p_phone
r c58_u_ui
r c58_phz 29133 40
r c58_fw2_forcewar 29135
r c58_tm_touch
r c58_saveload_page 29137
r c58_rw_random 29165
echo SUITEBDONE
until grep -q '^done:' critic/c58_seed7019_save.log 2>/dev/null; do sleep 20; done
r c58_an_ainuke 7019 critic/c58_seed7019_y20.bin 7019y20 2 400
r c58_hist 7019 critic/c58_seed7019_y20.bin
r c58_dl_export 7019 critic/c58_seed7019_y20.bin
r c58_long_watch2 29141 12 '&heroes=on' hon
r c58_long_watch2 29143 12 '' plain
echo SUITEB2DONE
