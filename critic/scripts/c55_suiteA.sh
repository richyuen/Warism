#!/bin/sh
# Critic run 55 (full): landings, one at a time. Run 54's named cases first (R54-B1 and its seeds), then new seeds.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5355
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
SHOTAT=156,162,168,174,180,186 r c55_lhold 23105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200
for s in 24151 24153 24155 24159 24171; do r c55_lland $s ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 240; done
SHOTAT=36,60,90,120 r c55_lhold 21105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200
r c55_lbar 22105 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3_phone 390 844 14 4
SHOTAT=30,33,36 r c55_turnback 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_cancel 26 60
STEP=3 r c55_lland 22103 GER ENG 1100.5,267.5 1031.5,266.5 2 ger_norwich 130
r c55_lland 23109 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
r c55_lbox 21103 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4 844 390 5
for s in 26151 26153 26155 26157 26159 26161 26163; do r c55_lland $s ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 240; done
r c55_lland 26103 GER ENG 1100.5,267.5 1031.5,266.5 3 ger_norwich3 240
r c55_lland 26107 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
STEP=2 r c55_lland 26109 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 200
SHOTAT=30,36,48 r c55_turnback 26101 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_cancel3 26 60
r c55_lbar 26105 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3_phone 390 844 12
echo SUITEADONE
