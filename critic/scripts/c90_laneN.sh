#!/bin/bash
# Critic run 90 (copy of run 89's) (copy of run 88's lane), lane N: naval (the rotation: last fresh in run 85), run 85's naval cases on new seeds 88xxx: the sea
# fights of two worlds and their look, two repulses, and on the page the sea battle, the click on it, landings ordered,
# held, turned back, the landings' bar and box at the iPhone 16's sizes.
. /c/Git/Warism/critic/scripts/c90_r.sh
M="1095.5,344.5 1106.5,383.5"; J="1818.5,385.5 1715.5,413.5"
(npx tsx tools/diag/seaBattles.ts 90061 scenario --years 3 --out critic/c90_sb_89061.json > critic/c90_sb_89061.log 2>&1; echo "sb 90061 $?"; npx tsx tools/diag/seaBattlesLook.ts critic/c90_sb_89061.json --out critic/c90_sbl_89061.json > critic/c90_sbl_89061.log 2>&1; echo "sbl 90061 $?") &
(npx tsx tools/diag/seaBattles.ts 90069 scenario --years 3 --out critic/c90_sb_89069.json > critic/c90_sb_89069.log 2>&1; echo "sb 90069 $?"; npx tsx tools/diag/seaBattlesLook.ts critic/c90_sb_89069.json --out critic/c90_sbl_89069.json > critic/c90_sbl_89069.log 2>&1; echo "sbl 90069 $?") &
(npx tsx tools/diag/seaBattles.ts 90067 random --years 2 --out critic/c90_sb_89067r.json > critic/c90_sb_89067r.log 2>&1; echo "sb 89067r $?") &
(npx tsx critic/scripts/c77_repulse.ts 90071 ENG GER 1023.5,275.5 1072.5,259.5 3 critic/c90_repulse_89071.json 500 12 > critic/c90_repulse_89071.log 2>&1; echo "repulse 90071 $?"
 npx tsx critic/scripts/c77_repulse.ts 90073 JAP CHI 1818.5,385.5 1715.5,413.5 3 critic/c90_repulse_89073.json 400 12 > critic/c90_repulse_89073.log 2>&1; echo "repulse 90073 $?") &
export EXTRA='&heroes=on'
r nvpage 90211 ITA ENG $M 12 360
r nvpage 90213 JAP CHI 1808.9,389.5 1715.0,413.7 10 480
r seaclick 90913
EXTRA= r sb_seaballs 20885 107 1188.17 328.5
r whotold 90215 ITA ENG $M 6 300
SHOTAT=30,36,48 r turnback 90901 JAP CHI $J 3 jap_cancel3 26 60
SHOTAT=40,60,90 r lhold 90905 ITA ENG $M 2 ita_malta 200
r lland 90903 GER ENG 1100.5,267.5 1031.5,266.5 3 ger_norwich3 240
r lland 90907 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
STEP=2 r lland 90909 JAP CHI $J 3 jap_sh3 200
r lbar 90221 JAP CHI $J 3 jap_sh3_phone 393 852 12
r lbar 90221 JAP CHI $J 3 jap_sh3_side 734 343 12
r lbox 90223 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4 852 393 5
r lbox 90223 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4q 2560 1305 5
wait
echo done > /c/Git/Warism/critic/c90_laneN.done
