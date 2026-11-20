#!/bin/bash
# Critic run 87: emergentDynamics and stability (the rotation), new seeds 87xxx: a 12-year plain page watch, topArea over
# 25 years, farConquests on five seeds, few-nation worlds, workerDeterminism, the page's save and load, Continue.
. /c/Git/Warism/critic/scripts/c87_r.sh
npx tsx tools/diag/workerDeterminism.ts 87059 4380 24 critic/c87_wd_87059.json > critic/c87_wd_87059.log 2>&1; echo "wd $?"
npx tsx critic/scripts/c77_topArea.ts 87097 25 critic/c87_toparea_87097.json > critic/c87_toparea_87097.log 2>&1; echo "toparea $?"
npx tsx critic/scripts/c77_farConquests.ts 0 87161,87163,87165,87167,87169 730 > critic/c87_farc.log 2>&1; echo "farc $?"
r x_few 87403 3 3
r saveload_page 87937 200
r x_continue 87415 40 GER 60
echo done > /c/Git/Warism/critic/c87_laneD.done
