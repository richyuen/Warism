#!/bin/sh
cd /c/Git/Warism
until [ -f critic/c29_bs.done ]; do sleep 15; done
for s in 5113 6151 9241; do npx tsx critic/scripts/c29_both.ts $s 730 critic/c29_both_head_$s.json > critic/c29_both_head_$s.log 2>&1 & done; wait
echo BOTHDONE > critic/c29_both.done
