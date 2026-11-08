#!/bin/sh
# Critic run 52 (focused): page probes one at a time on the c52 build at 5352. Run 51's named cases first, then new seeds.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5352
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
# Run 51's landings-bar cases
r c52_lbar 20861 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 1600 900 12
r c52_lbar 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_sh_cancel1 1600 900 12 1
r c52_lbar 20863 ENG GER 1023.5,275.5 1072.5,259.5 2 eng_br_cancelsea 1600 900 14 2
r c52_lbar 21101 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3_phone 390 844 12
r c52_lbar 21103 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4_land 844 390 14
r c52_lbar 21105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 1600 900 20
r c52_lost 3517 desk
r c52_lost 3517 phone 390 844
r c52_lost 3517 land 844 390
export N=6; r c52_lost 3517 phone6 390 844; unset N
r c52_rise_page
r c52_kw_breakthrough 21151
r c52_k_breakthrough 20879
r c52_q_god_tools 20875
r c52_sb_seaballs 20885
# New seeds
r c52_lbar 22101 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3_land 844 390 12 2
r c52_lbar 22103 GER ENG 1100.5,267.5 1031.5,266.5 2 ger_norwich_desk 1600 900 25 6
r c52_lbar 22105 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3_phone 390 844 14 4
r c52_lbar 22107 ITA ENG 1095.5,344.5 1106.5,383.5 3 ita_malta3 1600 900 20 5
r c52_kw_breakthrough 22151
r c52_q_god_tools 22119
r c52_a_god_nuke 22117
r c52_seaclick 22113
r c52_tm_touch
r c52_u_ui
r c52_p_phone
r c52_saveload_page 22137
echo SUITEPDONE
