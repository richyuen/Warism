#!/bin/bash
# Critic run 90 (copy of run 89's lane L): run 88's cases the first lanes left out, on HEAD (5451): c88_sizes 88901 400 (R88-N2,
# R88-N4), heroPop 88905 300, c88_playHash2 (the stalled page), pageHash on its own seed 1307 (the headless year hash by
# workerDeterminism's plain arm, read here), fewNationWars on run 85's seeds (the same seeds across R209), and two
# re-runs made by hand earlier in the run: the held landing watched for 480 hours, deskAttack 84901 with a longer limit.
. /c/Git/Warism/critic/scripts/c90_r.sh
(ARMS=plain npx tsx tools/diag/workerDeterminism.ts 1307 8760 8760 critic/c90_wd_1307.json > critic/c90_wd_1307.log 2>&1
 W=$(grep -o 'plain: [0-9a-f]*' critic/c90_wd_1307.log | head -1 | cut -d' ' -f2)
 npx tsx tools/diag/pageHash.ts http://127.0.0.1:5451 1307 1 $W 10 3 critic/c90_pageHash_1307.json > critic/c90_pageHash_1307.log 2>&1; echo "pageHash 1307 want $W $?") &
echo "== sizes 88901 400"; timeout 1800 node critic/scripts/c88_sizes.mjs 88901 400 > critic/c90_sz_88901.log 2>&1; echo "   exit $?"
EXTRA='&heroes=on' r heroPop 88905 300 head
p ph2 c88_playHash2 88901 9600 5
wait
echo done > critic/c90_laneL.done
# The stalled page (run 88's c88_ph_block): run by hand beside this lane as
#   BLOCK=20000 TAGL=block_ p ph2 c88_playHash2 88901 9600 5   (output critic/c90_ph2_block_88901_9600_5.log)
