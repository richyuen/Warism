#!/bin/bash
# Critic run 90 (copy of run 89's) (copy of run 88's lane), lane X: Batch 55 off its cases, at the supported sizes (ADR-1141) and on new seeds: the page's boxes at
# the five sizes on two worlds (c88_sizes; the second at day 0 with a landing ordered), R204's row in a running game at
# 2560 x 1305 and run 87's four desks on a new seed (c88_rowJitter), R205's footer at the five sizes (c88_relSaid).
. /c/Git/Warism/critic/scripts/c90_r.sh
echo "== sizes 88903 0"; MODES=political,seaControl timeout 1500 node critic/scripts/c88_sizes.mjs 88903 0 > critic/c90_sz_88903.log 2>&1; echo "   exit $?"
p rs c88_relSaid 88905 400
p rj c88_rowJitter 88601 300 40 2560x1305,1920x1080 political,seaControl,airControl
p rj c88_rowJitter 88603 500 40
p da c86_deskAttack 88907 400 wide
echo done > critic/c90_laneX.done
