#!/bin/bash
# Critic run 89, lane V: mapVisuals (the rotation: last fresh in run 86) at the supported sizes on new seeds: the page's
# boxes and map modes at the five sizes (c88_sizes), every tier's look at 2560 x 1305 and on the iPhone 16 both ways,
# markers, the desk's row (c86_deskAttack wide), run 86's own cases (c86_modeRow, c85_deskRow).
. /c/Git/Warism/critic/scripts/c89_r.sh
export EXTRA='&heroes=on'
r look 89901 2560 1305 45,180,400
r look 89903 393 852 60,240 phone
r look 89907 852 393 120,400 phone
r look 89909 734 343 200 phone
r look 89911 393 659 300 phone
export EXTRA=
echo "== sizes 89901 300"; timeout 1800 node critic/scripts/c88_sizes.mjs 89901 300 > critic/c89_sz_89901.log 2>&1; echo "   exit $?"
r markers 89951 head 2560 1305 1675,372 10,20,30 1800,1200,600
p da c86_deskAttack 89907 400 wide
p mr c86_modeRow 85901 400 800 seaControl,airControl,fallout
p dr c85_deskRow 84901 400 800
r massSeen 56211
echo done > /c/Git/Warism/critic/c89_laneV.done
