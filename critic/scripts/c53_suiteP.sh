#!/bin/sh
# Critic run 53 (focused): page probes one at a time on the c53 build at 5353. Run 52's named cases first, then new seeds.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5353
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
# Run 52's bar cases (R52-B1, N2, N3, N5)
STEP=3 r c53_lland 22103 GER ENG 1100.5,267.5 1031.5,266.5 2 ger_norwich 130
r c53_lland 21105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 240
r c53_lost 3517 desk
STEP=2 r c53_lland 20861 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 200
r c53_cancel_page 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_cancel 26 240
r c53_kw_breakthrough 21151
r c53_kw_breakthrough 22151
# Run 52's other page cases
r c53_lbar 20861 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 1600 900 12
r c53_lbar 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_sh_cancel1 1600 900 12 1
r c53_lbar 20863 ENG GER 1023.5,275.5 1072.5,259.5 2 eng_br_cancelsea 1600 900 14 2
r c53_lbar 21101 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3_phone 390 844 12
r c53_lbar 21107 GER ENG 1100.5,267.5 1031.5,266.5 3 ger_norwich3_phone 390 844 25 3
r c53_lbox 21103 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4 844 390 5
r c53_lost 3517 phone 390 844
r c53_lost 3517 land 844 390
r c53_k_breakthrough 20879
r c53_q_god_tools 20875
r c53_sb_seaballs 20885
r c53_lbar 22101 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3_land 844 390 12 2
r c53_lbar 22105 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3_phone 390 844 14 4
r c53_lbar 22107 ITA ENG 1095.5,344.5 1106.5,383.5 3 ita_malta3 1600 900 20 5
# New seeds
r c53_lland 23103 GER ENG 1100.5,267.5 1031.5,266.5 2 ger_norwich 240
r c53_lland 23105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 240
r c53_lland 23107 ITA ENG 1095.5,344.5 1106.5,383.5 3 ita_malta3 240
r c53_lland 23109 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
STEP=3 r c53_lland 23111 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 200
r c53_cancel_page 23113 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_cancel 30 200
r c53_cancel_page 23115 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_cancel 60 200
r c53_kw_breakthrough 23151
r c53_q_god_tools 23119
r c53_saveload_page 23137
r c53_u_ui
r c53_p_phone
echo SUITEPDONE
