#!/bin/sh
# Critic run 45 (new): run 44's split grid shapes on five new seeds, HEAD (c45_s_*) beside 813eb375 (c45_swt2_*, critic/wt2, c43_ll4 as run 44's sxwt).
cd /c/Git/Warism
OUT=critic/scripts/c45_jobsS.txt
: > $OUT
FZ='"x":1703.5,"y":445.5'
job() { # tag seed n orders
  echo "AT0=port NOW=click T0=1 EXTRA=0 ORDERS='$4' npx tsx critic/scripts/c45_ll5.ts $2 $3 70 critic/c45_s_$1.json > critic/c45_s_$1.log 2>&1" >> $OUT
  echo "cd critic/wt2 && NOW=click T0=1 EXTRA=0 ORDERS='$4' npx tsx critic/scripts/c43_ll4.ts $2 $3 70 ../c45_swt2_$1.json > ../c45_swt2_$1.log 2>&1" >> $OUT
}
for s in 18705 18709 18711 18713 18715; do
  job ${s}_n3_12 $s 3 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[1,2],$FZ}]"
  job ${s}_n4_012 $s 4 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,1,2],$FZ}]"
  job ${s}_n4_03 $s 4 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,3],$FZ}]"
  job ${s}_n4_23 $s 4 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[2,3],$FZ}]"
  job ${s}_n5_01 $s 5 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,1],$FZ}]"
  job ${s}_n5_012 $s 5 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,1,2],$FZ}]"
  job ${s}_n6_012 $s 6 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,1,2],$FZ}]"
  job ${s}_hourly $s 4 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0],$FZ},{\"at\":\"aboard\",\"plus\":3,\"who\":[1],$FZ},{\"at\":\"aboard\",\"plus\":4,\"who\":[2],$FZ},{\"at\":\"aboard\",\"plus\":5,\"who\":[3],$FZ}]"
done
echo "$(wc -l < $OUT) jobs"
