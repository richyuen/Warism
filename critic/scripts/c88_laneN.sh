#!/bin/bash
# Critic run 88, lane N: naval (the rotation: last fresh in run 85), run 85's naval cases on new seeds 88xxx: the sea
# fights of two worlds and their look, two repulses, and on the page the sea battle, the click on it, landings ordered,
# held, turned back, the landings' bar and box at the iPhone 16's sizes.
. /c/Git/Warism/critic/scripts/c88_r.sh
M="1095.5,344.5 1106.5,383.5"; J="1818.5,385.5 1715.5,413.5"
(npx tsx tools/diag/seaBattles.ts 88061 scenario --years 3 --out critic/c88_sb_88061.json > critic/c88_sb_88061.log 2>&1; echo "sb 88061 $?"; npx tsx tools/diag/seaBattlesLook.ts critic/c88_sb_88061.json --out critic/c88_sbl_88061.json > critic/c88_sbl_88061.log 2>&1; echo "sbl 88061 $?") &
(npx tsx tools/diag/seaBattles.ts 88069 scenario --years 3 --out critic/c88_sb_88069.json > critic/c88_sb_88069.log 2>&1; echo "sb 88069 $?"; npx tsx tools/diag/seaBattlesLook.ts critic/c88_sb_88069.json --out critic/c88_sbl_88069.json > critic/c88_sbl_88069.log 2>&1; echo "sbl 88069 $?") &
(npx tsx tools/diag/seaBattles.ts 88067 random --years 2 --out critic/c88_sb_88067r.json > critic/c88_sb_88067r.log 2>&1; echo "sb 88067r $?") &
(npx tsx critic/scripts/c77_repulse.ts 88071 ENG GER 1023.5,275.5 1072.5,259.5 3 critic/c88_repulse_88071.json 500 12 > critic/c88_repulse_88071.log 2>&1; echo "repulse 88071 $?"
 npx tsx critic/scripts/c77_repulse.ts 88073 JAP CHI 1818.5,385.5 1715.5,413.5 3 critic/c88_repulse_88073.json 400 12 > critic/c88_repulse_88073.log 2>&1; echo "repulse 88073 $?") &
export EXTRA='&heroes=on'
r nvpage 88211 ITA ENG $M 12 360
r nvpage 88213 JAP CHI 1808.9,389.5 1715.0,413.7 10 480
r seaclick 88913
EXTRA= r sb_seaballs 20885 107 1188.17 328.5
r whotold 88215 ITA ENG $M 6 300
SHOTAT=30,36,48 r turnback 88901 JAP CHI $J 3 jap_cancel3 26 60
SHOTAT=40,60,90 r lhold 88905 ITA ENG $M 2 ita_malta 200
r lland 88903 GER ENG 1100.5,267.5 1031.5,266.5 3 ger_norwich3 240
r lland 88907 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
STEP=2 r lland 88909 JAP CHI $J 3 jap_sh3 200
r lbar 88221 JAP CHI $J 3 jap_sh3_phone 393 852 12
r lbar 88221 JAP CHI $J 3 jap_sh3_side 734 343 12
r lbox 88223 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4 852 393 5
r lbox 88223 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4q 2560 1305 5
wait
echo done > /c/Git/Warism/critic/c88_laneN.done
