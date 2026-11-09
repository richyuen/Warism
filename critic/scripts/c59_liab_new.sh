#!/bin/sh
# Critic run 58: run 57 liab set on HEAD plus new seeds 29031-29049. Output critic/c59_li/new_*.log.
# each x 6 setups (3517 g2, 15101 g2, 3517 g1; and the same with orders for 8 days). Output critic/c59_li/new_*.log.
cd /c/Git/Warism
mkdir -p critic/c59_li
{
  for s in 30031 30033 30035 30037 30039 30041 30043 30045 30047 30049 30051 30053 30055 30057 30059; do
    echo "$s 3517 30,90 2 -"; echo "$s 15101 30,90 2 -"; echo "$s 3517 30,90 1 -"
    echo "$s 3517 30 2 8"; echo "$s 15101 30 2 8"; echo "$s 3517 30 1 8"
  done
} | xargs -P ${P:-3} -L 1 sh -c 'f=critic/c59_li/new_$0_$1_g$3_od$4.log; if [ $4 = - ]; then x=""; else x=$4; fi; npx tsx tools/diag/landingInvariants.ts $0 $1 120 $0 $2 $3 $x > $f 2>&1; echo "head $0 $1 g$3 od$4: $(grep -E "broken" $f | tail -1)"'
echo done:
