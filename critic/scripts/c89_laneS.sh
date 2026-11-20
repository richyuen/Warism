#!/bin/bash
# Critic run 89, lane S: R88-B1 (stability; R209). Its four "seen fixed when" cases on HEAD (5441); then the fault off
# its seed: c89_longStep on new seeds, HEAD (5441) and run 88's build (critic/c88_dist, 3e1ed78e, on 5442) at the same
# time, 8 loads a seed, 4 at once; the headless hashes of the same seeds (c88_headHash). Then what run 88 left out:
# pageHash on its own seed 1307 (the headless year hash read first), a hidden tab, heroes on, two years in one step.
. /c/Git/Warism/critic/scripts/c89_r.sh
p swm c88_sameWorldMsgs 88901 400 12
p swm c88_sameWorldMsgs 88901 300 12
echo "== pageHash 88901"; npx tsx tools/diag/pageHash.ts http://127.0.0.1:5441 88901 1 76540321 10 3 critic/c89_pageHash_88901.json > critic/c89_pageHash_88901.log 2>&1; echo "   exit $?"
p ph c88_playHash 88901 9600 6
SEEDS=89901,89903,89905,89907,89909,89911,89913,89915
(for s in $(echo $SEEDS | tr ',' ' '); do npx tsx critic/scripts/c88_headHash.ts $s 9600 9600 > critic/c89_headHash_$s.log 2>&1; done; echo "   headless done") &
(BASE=http://127.0.0.1:5442 TAG=_old timeout 3000 node critic/scripts/c89_longStep.mjs $SEEDS 9600 8 4 > critic/c89_ls_old_9600.log 2>&1; echo "   old exit $?") &
TAG=_head timeout 3000 node critic/scripts/c89_longStep.mjs $SEEDS 9600 8 4 > critic/c89_ls_head_9600.log 2>&1; echo "   head exit $?"
wait
echo done > critic/c89_laneS.done
