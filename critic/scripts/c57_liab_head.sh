#!/bin/sh
# Critic run 57: the bar's landingInvariants set on HEAD only (no worktree): run 56's 26 seeds and the new 28031-28059,
# each x 6 setups (3517 g2, 15101 g2, 3517 g1; and the same with orders for 8 days). Output critic/c57_li/head_*.log.
cd /c/Git/Warism
mkdir -p critic/c57_li
{
  for s in 24033 26031 26033 26035 26037 26039 26041 26043 26045 26047 26049 27031 27033 27035 27037 27039 27041 27043 27045 27047 27049 27051 27053 27055 27057 27059 28031 28033 28035 28037 28039 28041 28043 28045 28047 28049 28051 28053 28055 28057 28059; do
    echo "$s 3517 30,90 2 -"; echo "$s 15101 30,90 2 -"; echo "$s 3517 30,90 1 -"
    echo "$s 3517 30 2 8"; echo "$s 15101 30 2 8"; echo "$s 3517 30 1 8"
  done
} | xargs -P ${P:-3} -L 1 sh -c 'f=critic/c57_li/head_$0_$1_g$3_od$4.log; if [ $4 = - ]; then x=""; else x=$4; fi; npx tsx tools/diag/landingInvariants.ts $0 $1 120 $0 $2 $3 $x > $f 2>&1; echo "head $0 $1 g$3 od$4: $(grep -E "broken" $f | tail -1)"'
echo done:
