#!/bin/sh
# Critic run 54 (full): page probes one at a time on the c61 build at 5361. Run 53's named cases first, then new seeds, the full brief.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5361
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
# Run 53's "what the bar needs" and named cases (R53-N1..N3, R52 cases)
SHOTAT=30,33,36 r c61_turnback 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_cancel 26 60
r c61_lbar 22101 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3_land 844 390 12 2
SHOTAT=36,60,120 r c61_lhold 21105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200
STEP=3 SHOTAT=117,120,123,126 r c61_lhold 20861 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 160
STEP=3 r c61_lland 22103 GER ENG 1100.5,267.5 1031.5,266.5 2 ger_norwich 130
r c61_lland 21105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 240
r c61_lost 3517 desk
STEP=2 r c61_lland 20861 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 200
r c61_cancel_page 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_cancel 26 240
r c61_kwhist 21151
r c61_lbar 22105 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3_phone 390 844 14 4
r c61_lbar 22107 ITA ENG 1095.5,344.5 1106.5,383.5 3 ita_malta3 1600 900 20 5
r c61_lbox 21103 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4 844 390 5
r c61_lland 23105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 240
r c61_lland 23109 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
r c61_rg_relations 20887 365 1600 900 desk '&heroes=on'
r c61_rg_relations 21129 365 1600 900 desk '&heroes=on'
r c61_os2_scen critic/c26_critic_standoff.warsim-scenario c61
r c61_sb_seaballs 20885 107 1188.17 328.5
r c61_k_breakthrough 20879
# New seeds, the full brief
SHOTAT=30,36,48 r c61_turnback 24101 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_cancel3 26 60
SHOTAT=40,60,90 r c61_lhold 24105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200
r c61_lland 24103 GER ENG 1100.5,267.5 1031.5,266.5 3 ger_norwich3 240
r c61_lland 24107 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
r c61_lbar 24109 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3_phone 390 844 12
r c61_z_zoom 24111
r c61_seaclick 24113
r c61_c_battle 24115
r c61_a_god_nuke 24117
r c61_q_god_tools 24119
r c61_g_editor 24121
r c61_kw_breakthrough 24123
r c61_pl_planes 24125 GER POL 5361
r c61_w_wing 24127
r c61_p_phone
r c61_u_ui
r c61_rg_relations 24129 365 1600 900 desk '&heroes=on'
r c61_rg_relations 24131 730 390 844 phone '&diplo=random'
r c61_phz 24133 40
r c61_fw2_forcewar 24135
r c61_tm_touch
r c61_saveload_page 24137
echo SUITEPDONE
