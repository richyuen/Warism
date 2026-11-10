#!/bin/sh
# Critic run 60 (copy of c59_sr.sh): c59_stuckret (a turned-back landing standing still) on HEAD only: run 56's 78 setups and 28031-28059, 29031-29049.
cd /c/Git/Warism
mkdir -p critic/c61_sr
{
for s in 24033 26031 26033 26035 26037 26039 26041 26043 26045 26047 26049 27031 27033 27035 27037 27039 27041 27043 27045 27047 27049 27051 27053 27055 27057 27059 28031 28033 28035 28037 28039 28041 28043 28045 28047 28049 28051 28053 28055 28057 28059 29031 29033 29035 29037 29039 29041 29043 29045 29047 29049; do
  echo "head $s 3517 2"; echo "head $s 15101 2"; echo "head $s 3517 1"
done
} | xargs -P ${P:-3} -L 1 sh -c 'f=critic/c61_sr/$0_$1_$2_g$3.log; npx tsx critic/scripts/c59_stuckret.ts $1 $2 120 $1 30,90 $3 > $f 2>&1; echo "$0 $1 $2 g$3: $(grep longest $f)"'
echo done:
