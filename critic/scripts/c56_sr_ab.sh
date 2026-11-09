#!/bin/sh
# Critic run 56: c56_stuckret (a turned-back landing standing still at its port) on HEAD and on 715a5448 (critic/wt2's src
# is 715a5448's), the liab setups on 24033, 26031-26049, 27031-27059. Output critic/c56_sr/<tag>_<seed>_<setup>_g<g>.log.
cd /c/Git/Warism
mkdir -p critic/c56_sr
for s in 24033 26031 26033 26035 26037 26039 26041 26043 26045 26047 26049 27031 27033 27035 27037 27039 27041 27043 27045 27047 27049 27051 27053 27055 27057 27059; do
  for t in head old; do echo "$t $s 3517 2"; echo "$t $s 15101 2"; echo "$t $s 3517 1"; done
done | xargs -P 4 -L 1 sh -c 'f=critic/c56_sr/$0_$1_$2_g$3.log; if [ $0 = head ]; then d=.; else d=critic/wt2; fi; (cd $d && npx tsx critic/scripts/c56_stuckret.ts $1 $2 120 $1 30,90 $3) > $f 2>&1; echo "$0 $1 $2 g$3: $(grep longest $f)"'
echo done:
