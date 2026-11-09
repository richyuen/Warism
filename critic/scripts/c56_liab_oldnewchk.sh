#!/bin/sh
# Critic run 56: the 27031-27059 x 3 landingInvariants setups on 715a5448's sim with HEAD's checker (critic/wt2: old src,
# HEAD's tests/helpers/slowClick.ts and landingInvariants.ts), so both commits are judged by one checker.
cd /c/Git/Warism
for s in 27031 27033 27035 27037 27039 27041 27043 27045 27047 27049 27051 27053 27055 27057 27059 24033 26045; do
  echo "$s 3517 120 $s 30,90 2"; echo "$s 15101 120 $s 30,90 2"; echo "$s 3517 120 $s 30,90 1"
done | xargs -P 5 -L 1 sh -c 'f=critic/c56_li/oldnewchk_$0_$1_g$5.log; (cd critic/wt2 && npx tsx tools/diag/landingInvariants.ts $0 $1 $2 $3 $4 $5) > $f 2>&1; echo "oldcode+newchk $0 $1 g$5: $(grep -E "broken" $f | tail -1)"'
echo done:
