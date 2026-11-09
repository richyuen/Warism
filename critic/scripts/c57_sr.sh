#!/bin/sh
# Critic run 57: c57_stuckret (a turned-back landing standing still) on HEAD, run 56's 78 liab setups; and on new seeds
# 28031-28059 on HEAD and d016ed2a. Output critic/c57_sr/.
cd /c/Git/Warism
{
for s in 24033 26031 26033 26035 26037 26039 26041 26043 26045 26047 26049 27031 27033 27035 27037 27039 27041 27043 27045 27047 27049 27051 27053 27055 27057 27059; do
  echo "head $s 3517 2"; echo "head $s 15101 2"; echo "head $s 3517 1"
done
for s in 28031 28033 28035 28037 28039 28041 28043 28045 28047 28049 28051 28053 28055 28057 28059; do
  for t in head old; do echo "$t $s 3517 2"; echo "$t $s 15101 2"; echo "$t $s 3517 1"; done
done
} | xargs -P ${P:-3} -L 1 sh -c 'f=critic/c57_sr/$0_$1_$2_g$3.log; if [ $0 = head ]; then d=.; else d=critic/wt; fi; (cd $d && npx tsx critic/scripts/c57_stuckret.ts $1 $2 120 $1 30,90 $3) > $f 2>&1; echo "$0 $1 $2 g$3: $(grep longest $f)"'
echo done:
