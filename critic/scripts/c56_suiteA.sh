#!/bin/sh
# Critic run 56 (focused): run 55's named landing cases on the page, then new seeds, and the R54a change: clicks too
# big for the groups at hand (JAP 4 and 6, ENG 6, GER 5), where those that fit sail and the rest go on a next voyage.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5299
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
SHOTAT=156,162,168,174,180,186 r c56_lhold 23105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200
for s in 24151 24157 26151 26163; do r c56_lland $s ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 240; done
SHOTAT=36,60,90,120 r c56_lhold 21105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200
r c56_lbar 22105 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3_phone 390 844 14 4
SHOTAT=30,33,36 r c56_turnback 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_cancel 26 60
STEP=3 r c56_lland 22103 GER ENG 1100.5,267.5 1031.5,266.5 2 ger_norwich 130
r c56_lland 23109 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
r c56_lbox 21103 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4 844 390 5
r c56_lland 26107 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
STEP=2 r c56_lland 26109 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 200
SHOTAT=30,36,48 r c56_turnback 26101 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_cancel3 26 60
r c56_lbar 26105 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3_phone 390 844 12
# new: big clicks
for s in 27101 27103 27105; do r c56_lland $s JAP CHI 1818.5,385.5 1715.5,413.5 6 jap_sh6 360; done
for s in 27107 27109; do r c56_lland $s ENG GER 1023.5,275.5 1072.5,259.5 6 eng_br6 360; done
for s in 27111 27113; do r c56_lland $s GER ENG 1100.5,267.5 1031.5,266.5 5 ger_norwich5 300; done
for s in 27115 27117; do r c56_lland $s JAP CHI 1818.5,385.5 1715.5,413.5 4 jap_sh4 300; done
echo SUITEADONE
