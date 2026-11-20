#!/bin/bash
# Critic run 91 (copy of run 90's), lane S: stability on the page (src/sim and src/worker changed). R88-B1's cases on HEAD (fc767d88, 5491)
# as the guard of R209 and R215 (R89-N3); the long step on new seeds 91901.. against their headless hashes
# (c88_headHash), 8 loads a seed, 4 at once; heroes on for four of them.
. /c/Git/Warism/critic/scripts/c91_r.sh
p swm c88_sameWorldMsgs 88901 400 12
(ARMS=plain npx tsx tools/diag/workerDeterminism.ts 88901 8760 8760 critic/c91_wd_88901.json > critic/c91_wd_88901.log 2>&1
 W=$(grep -o 'plain: [0-9a-f]*' critic/c91_wd_88901.log | head -1 | cut -d' ' -f2)
 npx tsx tools/diag/pageHash.ts http://127.0.0.1:5491 88901 1 $W 10 3 critic/c91_pageHash_88901.json > critic/c91_pageHash_88901.log 2>&1; echo "   pageHash 88901 want $W $?") &
SEEDS=91901,91903,91905,91907,91909,91911
(for s in $(echo $SEEDS | tr ',' ' '); do npx tsx critic/scripts/c88_headHash.ts $s 9600 9600 > critic/c91_headHash_$s.log 2>&1; done; echo "   headless done") &
TAG=_head timeout 3000 node critic/scripts/c89_longStep.mjs $SEEDS 9600 8 4 > critic/c91_ls_head_9600.log 2>&1; echo "   head exit $?"
EXTRA='&heroes=on' TAG=_headh timeout 3000 node critic/scripts/c89_longStep.mjs 91921,91923 9600 8 4 > critic/c91_ls_head_heroes_9600.log 2>&1; echo "   heroes exit $?"
p ph c88_playHash 88901 9600 6
wait
echo done > critic/c91_laneStab.done
