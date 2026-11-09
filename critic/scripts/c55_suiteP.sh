#!/bin/sh
# Critic run 54 (full): page probes one at a time on the c55 build at 5355. Run 53's named cases first, then new seeds, the full brief.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5355
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
# Run 53's "what the bar needs" and named cases (R53-N1..N3, R52 cases)
SHOTAT=30,33,36 r c55_turnback 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_cancel 26 60
r c55_lbar 22101 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3_land 844 390 12 2
SHOTAT=36,60,120 r c55_lhold 21105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200
STEP=3 SHOTAT=117,120,123,126 r c55_lhold 20861 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 160
STEP=3 r c55_lland 22103 GER ENG 1100.5,267.5 1031.5,266.5 2 ger_norwich 130
r c55_lland 21105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 240
r c55_lost 3517 desk
STEP=2 r c55_lland 20861 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 200
r c55_cancel_page 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_cancel 26 240
r c55_kwhist 21151
r c55_lbar 22105 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3_phone 390 844 14 4
r c55_lbar 22107 ITA ENG 1095.5,344.5 1106.5,383.5 3 ita_malta3 1600 900 20 5
r c55_lbox 21103 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4 844 390 5
r c55_lland 23105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 240
r c55_lland 23109 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
r c55_rg_relations 20887 365 1600 900 desk '&heroes=on'
r c55_rg_relations 21129 365 1600 900 desk '&heroes=on'
r c55_os2_scen critic/c26_critic_standoff.warsim-scenario c55
r c55_sb_seaballs 20885 107 1188.17 328.5
r c55_k_breakthrough 20879
# New seeds, the full brief
SHOTAT=30,36,48 r c55_turnback 24101 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_cancel3 26 60
SHOTAT=40,60,90 r c55_lhold 24105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200
r c55_lland 24103 GER ENG 1100.5,267.5 1031.5,266.5 3 ger_norwich3 240
r c55_lland 24107 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
r c55_lbar 24109 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3_phone 390 844 12
r c55_z_zoom 24111
r c55_seaclick 24113
r c55_c_battle 24115
r c55_a_god_nuke 24117
r c55_q_god_tools 24119
r c55_g_editor 24121
r c55_kw_breakthrough 24123
r c55_pl_planes 24125 GER POL 5355
r c55_w_wing 24127
r c55_p_phone
r c55_u_ui
r c55_rg_relations 24129 365 1600 900 desk '&heroes=on'
r c55_rg_relations 24131 730 390 844 phone '&diplo=random'
r c55_phz 24133 40
r c55_fw2_forcewar 24135
r c55_tm_touch
r c55_saveload_page 24137
echo SUITEPDONE
