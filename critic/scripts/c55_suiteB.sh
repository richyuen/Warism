#!/bin/sh
# Critic run 55 (full): the rest of the brief, one at a time; the batch's new UI first.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5355
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c55_new mine 26303 1600 900 GER 365
r c55_new mine 26303 390 844 GER 365
r c55_new mine 26309 1600 900 FRA 540
r c55_new filter 26305 1600 900
r c55_new filter 26305 390 844
r c55_new corridor 26307 1600 900
r c55_new corridor 26307 390 844
r c55_rg_relations 20887 365 1600 900 desk '&heroes=on'
r c55_rg_relations 21129 365 1600 900 desk '&heroes=on'
r c55_rg_relations 24129 365 1600 900 desk '&heroes=on'
r c55_rg_relations 26129 365 1600 900 desk '&heroes=on'
r c55_rg_relations 26139 365 1600 900 desk ''
r c55_rg_relations 26131 730 390 844 phone '&diplo=random'
r c55_os2_scen critic/c26_critic_standoff.warsim-scenario c55
r c55_sb_seaballs 20885 107 1188.17 328.5
r c55_k_breakthrough 20879
r c55_kwhist 21151
r c55_c_battle 7781
r c55_z_zoom 26111
r c55_seaclick 26113
r c55_c_battle 26115
r c55_a_god_nuke 26117
r c55_q_god_tools 26119
r c55_g_editor 26121
r c55_kw_breakthrough 26123
r c55_pl_planes 26125 GER POL 5355
r c55_w_wing 26127
r c55_p_phone
r c55_u_ui
r c55_phz 26133 40
r c55_fw2_forcewar 26135
r c55_tm_touch
r c55_saveload_page 26137
r c55_rw_random 26165
echo SUITEBDONE
until grep -q '^done:' critic/c55_seed7019_save.log 2>/dev/null; do sleep 20; done
r c55_an_ainuke 7019 critic/c55_seed7019_y20.bin 7019y20 2 400
r c55_hist 7019 critic/c55_seed7019_y20.bin
r c55_dl_export 7019 critic/c55_seed7019_y20.bin
r c55_long_watch2 26141 12 '&heroes=on' hon
r c55_long_watch2 26143 12 '' plain
echo SUITEB2DONE
