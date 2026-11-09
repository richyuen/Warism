#!/bin/sh
# Critic run 57: landingInvariants on run 56's 26 seeds x 6 setups (3 as run 56, 3 with orders for 8 days, ADR-896) on
# HEAD, and new seeds 28031-28059 x the same on HEAD, x the 3 old setups on d016ed2a (critic/wt). Output critic/c58_li/.
cd /c/Git/Warism
P=${P:-4}
{
  for s in 24033 26031 26033 26035 26037 26039 26041 26043 26045 26047 26049 27031 27033 27035 27037 27039 27041 27043 27045 27047 27049 27051 27053 27055 27057 27059; do
    echo "head $s 3517 30,90 2 -"; echo "head $s 15101 30,90 2 -"; echo "head $s 3517 30,90 1 -"
    echo "head $s 3517 30 2 8"; echo "head $s 15101 30 2 8"; echo "head $s 3517 30 1 8"
  done
  for s in 28031 28033 28035 28037 28039 28041 28043 28045 28047 28049 28051 28053 28055 28057 28059; do
    echo "head $s 3517 30,90 2 -"; echo "head $s 15101 30,90 2 -"; echo "head $s 3517 30,90 1 -"
    echo "head $s 3517 30 2 8"; echo "head $s 15101 30 2 8"; echo "head $s 3517 30 1 8"
    echo "old $s 3517 30,90 2 -"; echo "old $s 15101 30,90 2 -"; echo "old $s 3517 30,90 1 -"
  done
} | xargs -P $P -L 1 sh -c 'tag=$0; s=$1; set_=$2; pr=$3; g=$4; od=$5; f=critic/c58_li/${tag}_${s}_${set_}_g${g}_od${od}.log; if [ $tag = head ]; then d=.; else d=critic/wt; fi; if [ $od = - ]; then x=""; else x=$od; fi; (cd $d && npx tsx tools/diag/landingInvariants.ts $s $set_ 120 $s $pr $g $x) > $f 2>&1; echo "$tag $s $set_ g$g od$od: $(grep -E "broken" $f | tail -1)"'
echo done:
