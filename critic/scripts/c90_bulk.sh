#!/bin/bash
# Critic run 90 (copy of run 89's): the bulk landing sets, due because src/sim/ai and src/sim/systems changed (R217, R218) (no carry, ADR-917, ADR-959):
# the 396 named landingInvariants setups (as c85_liab.sh named), the 153 stuck-return runs (c85_sr.sh), the 168
# next-voyage runs (c85_nv.sh), into critic/c90_li, c90_sr, c90_nv; P at once; critic/c90_stop.flag ends it between runs
# (the performance chain runs alone). Compared file by file by c90_bulkcmp.sh with the last sets on the sim before R209
# (c80_li, c81_sr, c81_nv: the sim was unchanged from run 80's commit to run 88's).
cd /c/Git/Warism
mkdir -p critic/c90_li critic/c90_sr critic/c90_nv
until grep -q LONGDONE critic/c90_long.status 2>/dev/null; do sleep 15; done
SEEDS="24033 26031 26033 26035 26037 26039 26041 26043 26045 26047 26049 27031 27033 27035 27037 27039 27041 27043 27045 27047 27049 27051 27053 27055 27057 27059 28031 28033 28035 28037 28039 28041 28043 28045 28047 28049 28051 28053 28055 28057 28059 29031 29033 29035 29037 29039 29041 29043 29045 29047 29049 30031 30033 30035 30037 30039 30041 30043 30045 30047 30049 30051 30053 30055 30057 30059"
{
  for s in $SEEDS; do
    echo "$s 3517 30,90 2 -"; echo "$s 15101 30,90 2 -"; echo "$s 3517 30,90 1 -"
    echo "$s 3517 30 2 8"; echo "$s 15101 30 2 8"; echo "$s 3517 30 1 8"
  done
} | xargs -P ${P:-6} -L 1 sh -c '[ -f critic/c90_stop.flag ] && exit 0; f=critic/c90_li/named_$0_$1_g$3_od$4.log; [ -s $f ] && grep -q broken $f && exit 0; if [ $4 = - ]; then x=""; else x=$4; fi; npx tsx tools/diag/landingInvariants.ts $0 $1 120 $0 $2 $3 $x > $f.tmp 2>&1; mv $f.tmp $f'
echo "li $(date +%T)" >> critic/c90_bulk.status
{
for s in 24033 26031 26033 26035 26037 26039 26041 26043 26045 26047 26049 27031 27033 27035 27037 27039 27041 27043 27045 27047 27049 27051 27053 27055 27057 27059 28031 28033 28035 28037 28039 28041 28043 28045 28047 28049 28051 28053 28055 28057 28059 29031 29033 29035 29037 29039 29041 29043 29045 29047 29049; do
  echo "head $s 3517 2"; echo "head $s 15101 2"; echo "head $s 3517 1"
done
} | xargs -P ${P:-6} -L 1 sh -c '[ -f critic/c90_stop.flag ] && exit 0; f=critic/c90_sr/$0_$1_$2_g$3.log; [ -s $f ] && exit 0; npx tsx critic/scripts/c59_stuckret.ts $1 $2 120 $1 30,90 $3 > $f.tmp 2>&1; mv $f.tmp $f'
echo "sr $(date +%T)" >> critic/c90_bulk.status
{
  for s in 29043 30041 $(seq 31101 2 31179); do
    echo "$s 3517 2"; echo "$s 15101 2"; echo "$s 3517 1"; echo "$s 15101 1"
  done
} | xargs -P ${P:-6} -L 1 sh -c '[ -f critic/c90_stop.flag ] && exit 0; f=critic/c90_nv/$0_$1_g$2.log; [ -s $f ] && exit 0; SEED=$0 SETUP=$1 KEEPG=$2 npx tsx critic/scripts/c77_nvtrue.ts > $f.tmp 2>&1; mv $f.tmp $f'
echo "nv $(date +%T)" >> critic/c90_bulk.status
echo BULKDONE >> critic/c90_bulk.status
