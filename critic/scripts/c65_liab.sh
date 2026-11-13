#!/bin/sh
# Critic run 61 (copy of c60_liab.sh): landingInvariants. Arg 1: "named" (run 59's 306 + 90 setups) or "new" (fresh seeds 32101..32199 odd, 50 seeds x 6 = 300).
# Output critic/c65_li/<set>_<seed>_<setup>_g<groups>_od<days>.log. P jobs at once (default 6).
cd /c/Git/Warism
mkdir -p critic/c65_li
SET=${1:-new}
if [ "$SET" = named ]; then
  SEEDS="24033 26031 26033 26035 26037 26039 26041 26043 26045 26047 26049 27031 27033 27035 27037 27039 27041 27043 27045 27047 27049 27051 27053 27055 27057 27059 28031 28033 28035 28037 28039 28041 28043 28045 28047 28049 28051 28053 28055 28057 28059 29031 29033 29035 29037 29039 29041 29043 29045 29047 29049 30031 30033 30035 30037 30039 30041 30043 30045 30047 30049 30051 30053 30055 30057 30059"
else
  SEEDS=$(seq 32101 2 32199)
fi
{
  for s in $SEEDS; do
    echo "$s 3517 30,90 2 -"; echo "$s 15101 30,90 2 -"; echo "$s 3517 30,90 1 -"
    echo "$s 3517 30 2 8"; echo "$s 15101 30 2 8"; echo "$s 3517 30 1 8"
  done
} | SET=$SET xargs -P ${P:-6} -L 1 sh -c 'f=critic/c65_li/${SET}_$0_$1_g$3_od$4.log; if [ $4 = - ]; then x=""; else x=$4; fi; npx tsx tools/diag/landingInvariants.ts $0 $1 120 $0 $2 $3 $x > $f 2>&1; echo "$0 $1 g$3 od$4: $(grep -E "broken" $f | tail -1)"'
echo done:
