#!/bin/bash
# Critic run 89, lane S2 (after lane S): the long step in other shapes, HEAD (5441) and run 88's build (5442) at once:
# heroes on (four new seeds, 9,600 hours, 8 loads), two years in one step (17,520 hours, three seeds, 8 loads; the
# headless hash by c88_headHash), the phone's size, a tab told hidden before the step, pageHash on its own seed 1307
# (the headless year hash read by workerDeterminism's plain arm), workerDeterminism on a new seed is in c89_jobsH.txt.
. /c/Git/Warism/critic/scripts/c89_r.sh
# (run beside lane S, for time)
H=89921,89923,89925,89927
(EXTRA='&heroes=on' BASE=http://127.0.0.1:5442 TAG=_old_heroes timeout 2400 node critic/scripts/c89_longStep.mjs $H 9600 8 4 > critic/c89_ls_old_heroes_9600.log 2>&1; echo "   old heroes exit $?") &
EXTRA='&heroes=on' TAG=_head_heroes timeout 2400 node critic/scripts/c89_longStep.mjs $H 9600 8 4 > critic/c89_ls_head_heroes_9600.log 2>&1; echo "   head heroes exit $?"
wait
L=88901,89931,89933
(for s in $(echo $L | tr ',' ' '); do npx tsx critic/scripts/c88_headHash.ts $s 17520 17520 > critic/c89_headHash2y_$s.log 2>&1; done; echo "   headless 2y done") &
(BASE=http://127.0.0.1:5442 TAG=_old_2y timeout 3000 node critic/scripts/c89_longStep.mjs $L 17520 8 4 > critic/c89_ls_old_17520.log 2>&1; echo "   old 2y exit $?") &
TAG=_head_2y timeout 3000 node critic/scripts/c89_longStep.mjs $L 17520 8 4 > critic/c89_ls_head_17520.log 2>&1; echo "   head 2y exit $?"
wait
TAG=_head_phone timeout 1500 node critic/scripts/c89_longStep.mjs 88901,89901 9600 8 4 393x852 > critic/c89_ls_head_phone_9600.log 2>&1; echo "   head phone exit $?"
TAG=_head timeout 1500 node critic/scripts/c89_longStep.mjs 88901,89903 9600 8 4 1280x720 hidden > critic/c89_ls_head_hidden_9600.log 2>&1; echo "   head hidden exit $?"
echo done > critic/c89_laneS2.done
