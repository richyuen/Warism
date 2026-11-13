#!/bin/sh
# Critic run 66: the page cases, one at a time on the c66 build at 5366, after the starts are in it: B1's probes (run
# 65's and a new one), the card at three years, the end of 1975, the stages, the places of 1975, the 1965 replay to 1977,
# Vietnam 1968, the AI's H-bomb of 1975, the phone line, God from 1970; then run 65's two page suites and chainE.
cd /c/Git/Warism
until [ -f critic/c66_build.done ]; do sleep 15; done
export BASE=http://127.0.0.1:5366
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 2400 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,:' '______').log 2>&1; echo "   exit $?"; }
r c66_x_badyear
r c66_x_badyearsave
r c66_x_badyear2
r c66_x_replaycard 1960 replay
r c66_x_replaycard 1965 replay 390 844
r c66_x_replaycard 1975 free
r c66_x_replaycard 1946 replay
r c66_x_trackend 1975
r c66_x_stage normandy 1944 1944-06-01 1020.6 291.6 7
r c66_x_stage uranus 1942 1942-11-20 1277.2 296 8
r c66_x_stage uranus2 1942 1942-12-24 1277.2 296 8
r c66_x_places 1975 newfoundland:705.4:293.8:3000 tuva:1561.6:274.5:3000 bonn:1064.4:281.6:600 madrid:1002.9:355.5:600
r c66_h_phone 390 844
r c66_h_phone 844 390
r c66_x_vietnam 1968 40
r c66_an_ainuke 0 year:1975:6161 y1975 2 400
r c66_h_god70
r c66_x_lateworld 1965 replay 1977 91 1600 900 4242
echo PAGESDONE
