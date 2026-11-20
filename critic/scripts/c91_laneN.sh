#!/bin/bash
# Critic run 91 (copy of run 90's) (copy of run 89's) (copy of run 88's lane), lane N: naval (the rotation: last fresh in run 85), run 85's naval cases on new seeds 88xxx: the sea
# fights of two worlds and their look, two repulses, and on the page the sea battle, the click on it, landings ordered,
# held, turned back, the landings' bar and box at the iPhone 16's sizes.
. /c/Git/Warism/critic/scripts/c91_r.sh
M="1095.5,344.5 1106.5,383.5"; J="1818.5,385.5 1715.5,413.5"
(npx tsx tools/diag/seaBattles.ts 91061 scenario --years 3 --out critic/c91_sb_89061.json > critic/c91_sb_89061.log 2>&1; echo "sb 91061 $?"; npx tsx tools/diag/seaBattlesLook.ts critic/c91_sb_89061.json --out critic/c91_sbl_89061.json > critic/c91_sbl_89061.log 2>&1; echo "sbl 91061 $?") &
(npx tsx tools/diag/seaBattles.ts 91069 scenario --years 3 --out critic/c91_sb_89069.json > critic/c91_sb_89069.log 2>&1; echo "sb 91069 $?"; npx tsx tools/diag/seaBattlesLook.ts critic/c91_sb_89069.json --out critic/c91_sbl_89069.json > critic/c91_sbl_89069.log 2>&1; echo "sbl 91069 $?") &
(npx tsx tools/diag/seaBattles.ts 91067 random --years 2 --out critic/c91_sb_89067r.json > critic/c91_sb_89067r.log 2>&1; echo "sb 89067r $?") &
(npx tsx critic/scripts/c77_repulse.ts 91071 ENG GER 1023.5,275.5 1072.5,259.5 3 critic/c91_repulse_89071.json 500 12 > critic/c91_repulse_89071.log 2>&1; echo "repulse 91071 $?"
 npx tsx critic/scripts/c77_repulse.ts 91073 JAP CHI 1818.5,385.5 1715.5,413.5 3 critic/c91_repulse_89073.json 400 12 > critic/c91_repulse_89073.log 2>&1; echo "repulse 91073 $?") &
export EXTRA='&heroes=on'
r nvpage 91211 ITA ENG $M 12 360
r nvpage 91213 JAP CHI 1808.9,389.5 1715.0,413.7 10 480
r seaclick 91913
EXTRA= r sb_seaballs 20885 107 1188.17 328.5
r whotold 91215 ITA ENG $M 6 300
SHOTAT=30,36,48 r turnback 91901 JAP CHI $J 3 jap_cancel3 26 60
SHOTAT=40,60,90 r lhold 91905 ITA ENG $M 2 ita_malta 200
r lland 91903 GER ENG 1100.5,267.5 1031.5,266.5 3 ger_norwich3 240
r lland 91907 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
STEP=2 r lland 91909 JAP CHI $J 3 jap_sh3 200
r lbar 91221 JAP CHI $J 3 jap_sh3_phone 393 852 12
r lbar 91221 JAP CHI $J 3 jap_sh3_side 734 343 12
r lbox 91223 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4 852 393 5
r lbox 91223 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4q 2560 1305 5
wait
echo done > /c/Git/Warism/critic/c91_laneN.done
