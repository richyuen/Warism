#!/bin/sh
# Critic run 51 (full): page probes one at a time on the c51 build at 5321. Run 50's cases first, then new seeds and R47's bar.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5321
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
# Run 50's cases
r c51_wait_page 20861 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 1600 900 45
r c51_wait_page 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_sh 390 844 30
r c51_lost 3517 desk
r c51_lost 3517 phone 390 844
r c51_lost 3517 land 844 390
export N=6; r c51_lost 3517 desk6; unset N
export N=6; r c51_lost 3517 phone6 390 844; unset N
r c51_rise_page
r c51_hero 20471 17520 desk
r c51_hero 20471 17520 phone 390 844
r c51_rg_relations 20887 365 1600 900 desk '&heroes=on'
r c51_rg_relations 20889 365 390 844 phone '&diplo=random'
r c51_q_god_tools 20875
r c51_k_breakthrough 20879
r c51_os2_scen critic/c26_critic_standoff.warsim-scenario c51
# R47 landings bar
r c51_lbar 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_sh_cancel1 1600 900 12 1
r c51_lbar 20863 ENG GER 1023.5,275.5 1072.5,259.5 2 eng_br_cancelsea 1600 900 14 2
r c51_lbar 21101 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3_phone 390 844 12
r c51_lbar 21103 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4_land 844 390 14
r c51_lbar 21105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 1600 900 20
r c51_lbar 21107 GER ENG 1100.5,267.5 1031.5,266.5 3 ger_norwich3_phone 390 844 25 3
# New seeds, the full brief
r c51_z_zoom 21111
r c51_seaclick 21113
r c51_c_battle 21115
r c51_a_god_nuke 21117
r c51_q_god_tools 21119
r c51_g_editor 21121
r c51_k_breakthrough 21123
r c51_pl_planes 21125 GER POL 5321
r c51_w_wing 21127
r c51_p_phone
r c51_u_ui
r c51_rg_relations 21129 365 1600 900 desk '&heroes=on'
r c51_rg_relations 21131 730 390 844 phone '&diplo=random'
r c51_phz 21133 40
r c51_fw2_forcewar 21135
r c51_tm_touch
r c51_saveload_page 21137
echo SUITEPDONE
