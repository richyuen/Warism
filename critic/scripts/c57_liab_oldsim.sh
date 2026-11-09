#!/bin/sh
# Critic run 57: HEAD's landingInvariants checker (tests/helpers, tools/diag) on d016ed2a's sim (critic/wt2), the new
# seeds 28031-28059 x the three setups with orders for 8 days, and 28037's case. Output critic/c57_li/oldsim_*.log.
cd /c/Git/Warism
for s in 28031 28033 28035 28037 28039 28041 28043 28045 28047 28049 28051 28053 28055 28057 28059; do
  echo "$s 3517 30 2 8"; echo "$s 15101 30 2 8"; echo "$s 3517 30 1 8"
done | xargs -P ${P:-3} -L 1 sh -c 'f=critic/c57_li/oldsim_$0_$1_g$3_od$4.log; (cd critic/wt2 && npx tsx tools/diag/landingInvariants.ts $0 $1 120 $0 $2 $3 $4) > $f 2>&1; echo "oldsim $0 $1 g$3 od$4: $(grep -E "broken" $f | tail -1)"'
echo done:
