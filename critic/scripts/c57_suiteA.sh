#!/bin/sh
# Critic run 57 (full): run 56's named landing cases on HEAD (5357) and the key ones on d016ed2a (5356), then new seeds.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5357
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
# R56-B1 (i): the Cancel button with a division left at the port
SHOTAT=66,72,84,96,120,180,240,300 r c57_turnback 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 ita6_cancelbtn 66 300
BASE=http://127.0.0.1:5356 SHOTAT=84,300 r c57_turnback 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 ita6_cancelbtn_OLD 66 300
# R56-B1 (ii): click back, re-click to Valletta
CANCELAT=66 ORDERAT=198 ORDERTO=1106.5,383.5 ORDERIDS=323,324 SHOTAT=78,198,240,420 r c57_retstuck 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 ita_malta6_reclick 480
CANCELAT=66 ORDERAT=198 ORDERTO=1095.5,350.5 SHOTAT=78,204,240 r c57_retstuck 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 ita_malta6 300
# R56-N1: a landing that sails without a marcher
for s in 27123 27127 27129; do r c57_lland $s ENG GER 1023.5,275.5 1072.5,259.5 10 eng_br10 400; done
r c57_lland 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 ita_malta6 240
r c57_lland 27121 JAP CHI 1818.5,385.5 1715.5,413.5 10 jap_sh10 360
# Malta, run 55/56's 18 seeds
SHOTAT=156,162,168 r c57_lhold 23105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200
SHOTAT=36,60,90,120 r c57_lhold 21105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200
for s in 24105 24151 24153 24155 24157 24159 24171 24173 24175 26151 26153 26155 26157 26159 26161 26163; do r c57_lland $s ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 240; done
# run 55/56's other named landing cases
r c57_lbar 22105 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3_phone 390 844 14 4
SHOTAT=30,33,36 r c57_turnback 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_cancel 26 60
STEP=3 r c57_lland 22103 GER ENG 1100.5,267.5 1031.5,266.5 2 ger_norwich 130
r c57_lland 23109 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
r c57_lbox 21103 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4 844 390 5
r c57_lland 26107 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
STEP=2 r c57_lland 26109 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 200
SHOTAT=30,36,48 r c57_turnback 26101 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_cancel3 26 60
for s in 27101 27103 27105; do r c57_lland $s JAP CHI 1818.5,385.5 1715.5,413.5 6 jap_sh6 360; done
for s in 27107 27109; do r c57_lland $s ENG GER 1023.5,275.5 1072.5,259.5 6 eng_br6 360; done
# new seeds: big and odd clicks
for s in 28101 28103; do r c57_lland $s ITA ENG 1095.5,344.5 1106.5,383.5 6 ita_malta6 300; done
for s in 28105 28107; do r c57_lland $s ENG GER 1023.5,275.5 1072.5,259.5 10 eng_br10 400; done
for s in 28109 28111; do r c57_lland $s JAP CHI 1818.5,385.5 1715.5,413.5 8 jap_sh8 360; done
for s in 28113 28115; do r c57_lland $s GER ENG 1100.5,267.5 1031.5,266.5 6 ger_norwich6 360; done
SHOTAT=40,60,90 r c57_turnback 28117 JAP CHI 1818.5,385.5 1715.5,413.5 6 jap_cancel6 40 240
SHOTAT=60,90,120 r c57_turnback 28119 ENG GER 1023.5,275.5 1072.5,259.5 8 eng_cancel8 60 300
CANCELAT=40 ORDERAT=120 ORDERTO=1715.5,413.5 SHOTAT=60,120,200 r c57_retstuck 28121 JAP CHI 1818.5,385.5 1715.5,413.5 6 jap6_reclick 360
echo SUITEADONE
