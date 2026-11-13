#!/bin/sh
# Critic run 60: c65_nvtrue.ts (is "next voyage in about N days" true?) on seeds 31101..31179 odd and run 59's 29043/30041,
# four shapes each (3517 g2, 15101 g2, 3517 g1, 15101 g1). Output critic/c65_nv/<seed>_<setup>_g<g>.log; P at once (4).
cd /c/Git/Warism
mkdir -p critic/c65_nv
{
  for s in 29043 30041 $(seq 31101 2 31179); do
    echo "$s 3517 2"; echo "$s 15101 2"; echo "$s 3517 1"; echo "$s 15101 1"
  done
} | xargs -P ${P:-4} -L 1 sh -c 'SEED=$0 SETUP=$1 KEEPG=$2 npx tsx critic/scripts/c65_nvtrue.ts > critic/c65_nv/$0_$1_g$2.log 2>&1; echo "$0 $1 g$2: $(grep -c ^NV critic/c65_nv/$0_$1_g$2.log)"'
echo done:
