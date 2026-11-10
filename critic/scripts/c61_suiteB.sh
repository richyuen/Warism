#!/bin/sh
# Critic run 61 (full): the whole brief on new seeds (32xxx), page probes one at a time on the c61 build at 5361.
cd /c/Git/Warism
until grep -q SUITEADONE critic/c61_suiteA.log 2>/dev/null; do sleep 20; done
export BASE=http://127.0.0.1:5361
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
M="1095.5,344.5 1106.5,383.5"; J="1818.5,385.5 1715.5,413.5"
# The batch's newest UI (R58b-d) on new seeds
r c61_nvpage 32211 ITA ENG $M 12 360
r c61_nvpage 32213 JAP CHI 1808.9,389.5 1715.0,413.7 10 480
r c61_whotold 32215 ITA ENG $M 6 300
r c61_peacebtn 32217 GER POL 40 5 844 390
r c61_peacebtn 32217 GER POL 40 5 1600 900
r c61_manywars 32219 GER POL,CZE,FRA,ENG,SOV,BEL,HOL,DEN,NOR,SWE 390 844
# Landings, new seeds
SHOTAT=30,36,48 r c61_turnback 32101 JAP CHI $J 3 jap_cancel3 26 60
SHOTAT=40,60,90 r c61_lhold 32105 ITA ENG $M 2 ita_malta 200
r c61_lland 32103 GER ENG 1100.5,267.5 1031.5,266.5 3 ger_norwich3 240
r c61_lland 32107 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
STEP=2 r c61_lland 32109 JAP CHI $J 3 jap_sh3 200
r c61_lbar 32221 JAP CHI $J 3 jap_sh3_phone 390 844 12
r c61_lbox 32223 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4 844 390 5
# Earlier batches' UI
r c61_new mine 32303 1600 900 GER 365
r c61_new mine 32303 390 844 GER 365
r c61_new filter 32305 1600 900
r c61_new filter 32305 390 844
r c61_new corridor 32307 1600 900
CORRM=3000 r c61_new corridor 32307 390 844
r c61_new build 32301 390 844
r c61_new build 32301 844 390
r c61_rg_relations 32129 365 1600 900 desk '&heroes=on'
r c61_rg_relations 32139 365 1600 900 desk ''
r c61_rg_relations 32131 730 390 844 phone '&diplo=random'
r c61_os2_scen critic/c26_critic_standoff.warsim-scenario c61
r c61_sb_seaballs 20885 107 1188.17 328.5
r c61_k_breakthrough 32179
r c61_kwhist 32151
r c61_c_battle 7781
r c61_c_battle 32115
r c61_z_zoom 32111
r c61_seaclick 32113
r c61_a_god_nuke 32117
r c61_q_god_tools 32119
r c61_g_editor 32121
r c61_kw_breakthrough 32123
r c61_pl_planes 32125 GER POL 5361
r c61_w_wing 32127
r c61_p_phone
r c61_u_ui
r c61_phz 32133 40
r c61_fw2_forcewar 32135
r c61_saveload_page 32137 200
r c61_rw_random 32165 365
r c61_histgrep 32309 FRA 540 joined
r c61_warsof 32309 FRA 540
echo SUITEBDONE
until grep -q '^done:' critic/c61_seed7019_save.log 2>/dev/null && grep -q '^done:' critic/c61_seed32019_save.log 2>/dev/null; do sleep 20; done
r c61_an_ainuke 7019 critic/c61_seed7019_y20.bin 7019y20 2 400
r c61_an_ainuke 32019 critic/c61_seed32019_y20.bin 32019y20 2 400
r c61_hist 7019 critic/c61_seed7019_y20.bin
r c61_hist 32019 critic/c61_seed32019_y20.bin
r c61_dl_export 32019 critic/c61_seed32019_y20.bin
r c61_long_watch2 32141 12 '&heroes=on' hon
r c61_long_watch2 32143 12 '' plain
echo SUITEB2DONE
