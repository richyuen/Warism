#!/bin/sh
# Critic run 58: c59_lastashore on HEAD (critic/c59_la.ts) and on d3519cb0's sim (critic/old/la.ts), the same seeds.
cd /c/Git/Warism
mkdir -p critic/c59_la
{
for s in 28031 28033 28035 28037 28039 28041 28043 28045 28047 28049 28051 28053 28055 28057 28059 29031 29033 29035 29037 29039 29041 29043 29045 29047 29049; do
  for t in head old; do echo "$t $s 3517 2 8"; echo "$t $s 15101 2 8"; echo "$t $s 3517 1 8"; echo "$t $s 3517 2 -"; done
done
} | xargs -P ${P:-4} -L 1 sh -c 'f=/c/Git/Warism/critic/c59_la/$0_$1_$2_g$3_od$4.log; if [ $4 = - ]; then x=""; else x=$4; fi; if [ $0 = head ]; then npx tsx critic/c59_la.ts $1 $2 $3 $x > $f 2>&1; else (cd critic/old && npx tsx la.ts $1 $2 $3 $x) > $f 2>&1; fi; echo "$(grep SUMMARY $f | sed "s/^/$0 /")"'
echo done:
