#!/bin/sh
# Critic run 59 (full): run 58's named page cases on HEAD (5359), then new seeds' landings.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5359
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,|' '______').log 2>&1; echo "   exit $?"; }
# R58-N2 (R57c)
r c59_whotold 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 140
r c59_whotold 28113 GER ENG 1100.5,267.5 1031.5,266.5 6 120
# R58-N3 (R57d)
r c59_peacebtn 29403 GER POL 60 5 390 844
r c59_peacebtn 29401 GER POL 45 5 1600 900
# R58 small (R57e): 27125's bar at h120/h132/h138
SHOTAT=114,120,132,138 r c59_lhold 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 ita_malta6 140
# Malta's 18
for s in 24105 24151 24153 24155 24157 24159 24171 24173 24175 26151 26153 26155 26157 26159 26161 26163 23105 21105; do r c59_lland $s ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 240; done
# new seeds: landings
for s in 30101 30103; do r c59_lland $s ITA ENG 1095.5,344.5 1106.5,383.5 6 ita_malta6 300; done
for s in 30105 30107; do r c59_lland $s ENG GER 1023.5,275.5 1072.5,259.5 10 eng_br10 400; done
for s in 30109 30111; do r c59_lland $s JAP CHI 1818.5,385.5 1715.5,413.5 8 jap_sh8 360; done
for s in 30113 30115; do r c59_lland $s GER ENG 1100.5,267.5 1031.5,266.5 6 ger_norwich6 360; done
r c59_whotold 30101 ITA ENG 1095.5,344.5 1106.5,383.5 6 140
r c59_whotold 30113 GER ENG 1100.5,267.5 1031.5,266.5 6 120
SHOTAT=40,60,90 r c59_turnback 30117 JAP CHI 1818.5,385.5 1715.5,413.5 6 jap_cancel6 40 240
echo SUITEADONE
