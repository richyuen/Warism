#!/bin/sh
# Critic run 58 (full): run 57's named page cases on HEAD (5358), then the batch's new UI.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5358
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,|' '______').log 2>&1; echo "   exit $?"; }
# R57-N1 (R56b)
SHOTAT=114,120,132 r c58_lhold 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 ita_malta6 140
# R57-N3 (R56c)
r c58_whotold 28113 GER ENG 1100.5,267.5 1031.5,266.5 6 120
# R57-N2 (R56d)
r c58_dip_player 28401
r c58_dip_player 28403
# R56-B1 cases still
SHOTAT=66,78,120 r c58_turnback 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 ita6_cancelbtn 66 200
for s in 28101 28103; do r c58_lland $s ITA ENG 1095.5,344.5 1106.5,383.5 6 ita_malta6 300; done
# Malta's 18
SHOTAT=156,162,168 r c58_lhold 23105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200
SHOTAT=36,60,90,120 r c58_lhold 21105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200
for s in 24105 24151 24153 24155 24157 24159 24171 24173 24175 26151 26153 26155 26157 26159 26161 26163; do r c58_lland $s ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 240; done
# new seeds: landings
for s in 29101 29103; do r c58_lland $s ITA ENG 1095.5,344.5 1106.5,383.5 6 ita_malta6 300; done
for s in 29105 29107; do r c58_lland $s ENG GER 1023.5,275.5 1072.5,259.5 10 eng_br10 400; done
for s in 29109 29111; do r c58_lland $s JAP CHI 1818.5,385.5 1715.5,413.5 8 jap_sh8 360; done
for s in 29113 29115; do r c58_lland $s GER ENG 1100.5,267.5 1031.5,266.5 6 ger_norwich6 360; done
r c58_whotold 29113 GER ENG 1100.5,267.5 1031.5,266.5 6 120
SHOTAT=40,60,90 r c58_turnback 29117 JAP CHI 1818.5,385.5 1715.5,413.5 6 jap_cancel6 40 240
echo SUITEADONE
