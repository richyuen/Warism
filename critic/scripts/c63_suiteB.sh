#!/bin/sh
# Critic run 63 (full): the whole brief on new seeds (35xxx), page probes one at a time on the c63 build at 5363.
cd /c/Git/Warism
until grep -q SUITETDONE critic/c63_suiteT2.log 2>/dev/null; do sleep 20; done
export BASE=http://127.0.0.1:5363
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
M="1095.5,344.5 1106.5,383.5"; J="1818.5,385.5 1715.5,413.5"
# The batch's newest UI (R58b-d) on new seeds
r c63_nvpage 35211 ITA ENG $M 12 360
r c63_nvpage 35213 JAP CHI 1808.9,389.5 1715.0,413.7 10 480
r c63_whotold 35215 ITA ENG $M 6 300
r c63_peacebtn 35217 GER POL 40 5 844 390
r c63_peacebtn 35217 GER POL 40 5 1600 900
r c63_manywars 35219 GER POL,CZE,FRA,ENG,SOV,BEL,HOL,DEN,NOR,SWE 390 844
# Landings, new seeds
SHOTAT=30,36,48 r c63_turnback 35101 JAP CHI $J 3 jap_cancel3 26 60
SHOTAT=40,60,90 r c63_lhold 35105 ITA ENG $M 2 ita_malta 200
r c63_lland 35103 GER ENG 1100.5,267.5 1031.5,266.5 3 ger_norwich3 240
r c63_lland 35107 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
STEP=2 r c63_lland 35109 JAP CHI $J 3 jap_sh3 200
r c63_lbar 35221 JAP CHI $J 3 jap_sh3_phone 390 844 12
r c63_lbox 35223 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4 844 390 5
# Earlier batches' UI
r c63_new mine 35303 1600 900 GER 365
r c63_new mine 35303 390 844 GER 365
r c63_new filter 35305 1600 900
r c63_new filter 35305 390 844
r c63_new corridor 35307 1600 900
CORRM=3000 r c63_new corridor 35307 390 844
r c63_new build 35301 390 844
r c63_new build 35301 844 390
r c63_rg_relations 35129 365 1600 900 desk '&heroes=on'
r c63_rg_relations 35139 365 1600 900 desk ''
r c63_rg_relations 35131 730 390 844 phone '&diplo=random'
r c63_os2_scen critic/c26_critic_standoff.warsim-scenario c63
r c63_sb_seaballs 20885 107 1188.17 328.5
r c63_k_breakthrough 35179
r c63_kwhist 35151
r c63_c_battle 7781
r c63_c_battle 35115
r c63_z_zoom 35111
r c63_seaclick 35113
r c63_a_god_nuke 35117
r c63_q_god_tools 35119
r c63_g_editor 35121
r c63_kw_breakthrough 35123
r c63_pl_planes 35125 GER POL 5363
r c63_w_wing 35127
r c63_p_phone
r c63_u_ui
r c63_phz 35133 40
r c63_fw2_forcewar 35135
r c63_saveload_page 35137 200
r c63_rw_random 35165 365
r c63_histgrep 35309 FRA 540 joined
r c63_warsof 35309 FRA 540
echo SUITEBDONE
until grep -q '^done:' critic/c63_seed7019_save.log 2>/dev/null && grep -q '^done:' critic/c63_seed32019_save.log 2>/dev/null; do sleep 20; done
r c63_an_ainuke 7019 critic/c63_seed7019_y20.bin 7019y20 2 400
r c63_an_ainuke 32019 critic/c63_seed32019_y20.bin 32019y20 2 400
r c63_hist 7019 critic/c63_seed7019_y20.bin
r c63_hist 32019 critic/c63_seed32019_y20.bin
r c63_dl_export 32019 critic/c63_seed32019_y20.bin
r c63_long_watch2 35141 12 '&heroes=on' hon
r c63_long_watch2 35143 12 '' plain

# Run 61's own x probes on new seeds
r c63_x_mouse 35421 10 1600 900
r c63_x_keys 35423
r c63_x_continue 35415 40 GER 60
r c63_x_title
r c63_x_few 35403 3 3
r c63_x_play rnd_large random large 90
r c63_hero 35425 300 hon
r c63_joinseen 35427 GER 120
until grep -q '^done:' critic/c63_seed34505_save.log 2>/dev/null; do sleep 20; done
r c63_an_ainuke 34505 critic/c63_seed34505_y13.bin 34505y13 2 400
until [ -s critic/c63_sb_34061.json ] && grep -q . critic/c63_sb_34061.log; do sleep 20; done
echo "== sbl 34061"; BASE=http://127.0.0.1:5363 npx tsx tools/diag/seaBattlesLook.ts critic/c63_sb_34061.json --out critic/c63_sbl_34061.json > critic/c63_sbl_34061.log 2>&1; echo "  exit $?"
echo SUITEB2DONE
