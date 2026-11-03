#!/bin/sh
# Critic run 28 (new seeds): BOTH (AI-only war-list integrity) on 1777 and 8209 x 730 days; OR (every bonded Force war) on them.
cd /c/Git/Warism
until [ -f critic/c31_hq.done ]; do sleep 15; done
T="npx tsx critic/scripts"
for s in 1777 8209; do $T/c31_both.ts $s 730 critic/c31_both_new_$s.json > critic/c31_both_new_$s.log 2>&1 & done
for s in 1777 8209; do $T/c31_or.ts $s 60,200,350 critic/c31_or_new_$s.json 150 > critic/c31_or_new_$s.log 2>&1 & done
wait
echo HQ2DONE > critic/c31_hq2.done
