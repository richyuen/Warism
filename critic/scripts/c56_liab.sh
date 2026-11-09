#!/bin/sh
# Critic run 56: landingInvariants on run 55's setups. R55-B1's two commands, run 55's 26031-26049 x 3 on HEAD, and new
# seeds 27031-27059 x 3 on HEAD and on 715a5448 (critic/wt). P at a time. Output: critic/c56_li/<tag>_<seed>_<n>.log.
cd /c/Git/Warism
P=${P:-4}
{
  echo "head 24033 3517 120 24033 30,90 2"
  echo "head 26045 3517 120 26045 30,90 2"
  echo "old 24033 3517 120 24033 30,90 2"
  echo "old 26045 3517 120 26045 30,90 2"
  for s in 26031 26033 26035 26037 26039 26041 26043 26045 26047 26049; do
    echo "head $s 3517 120 $s 30,90 2"; echo "head $s 15101 120 $s 30,90 2"; echo "head $s 3517 120 $s 30,90 1"
  done
  for s in 27031 27033 27035 27037 27039 27041 27043 27045 27047 27049 27051 27053 27055 27057 27059; do
    for t in head old; do
      echo "$t $s 3517 120 $s 30,90 2"; echo "$t $s 15101 120 $s 30,90 2"; echo "$t $s 3517 120 $s 30,90 1"
    done
  done
} | xargs -P $P -L 1 sh -c 'tag=$0; s=$1; set_=$2; g=$6; f=critic/c56_li/${tag}_${s}_${set_}_g${g}.log; if [ $tag = head ]; then d=.; else d=critic/wt; fi; (cd $d && npx tsx tools/diag/landingInvariants.ts $s $2 $3 $4 $5 $6) > $f 2>&1; echo "$tag $s $set_ g$g: $(grep -E "broken" $f | tail -1)"'
echo done:
