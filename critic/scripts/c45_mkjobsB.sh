#!/bin/sh
# Critic run 45 (new): R36 on Britain (two divisions a transport group) and Japan on new seeds; HEAD (c45_b_*) and 0fba90d8 (c45_bwt_*).
cd /c/Git/Warism
OUT=critic/scripts/c45_jobsB.txt
: > $OUT
job() { # tag env seed n days orders
  echo "$2 ORDERS='$6' npx tsx critic/scripts/c45_ll6.ts $3 $4 $5 critic/c45_b_$1.json > critic/c45_b_$1.log 2>&1" >> $OUT
  echo "cd critic/wt && $2 ORDERS='$6' npx tsx critic/scripts/c45_ll6.ts $3 $4 $5 ../c45_bwt_$1.json > ../c45_bwt_$1.log 2>&1" >> $OUT
}
E='TAG=ENG FOE=FRA HOME_XY=1023.5,275.5 TGT=1034.5,279.5 AT0=port NOW=click T0=1 EXTRA=0'
CAEN='"x":1021.5,"y":291.5'; CHER='"x":1014.5,"y":289.5'; DIEP='"x":1030.5,"y":287.5'
for seed in 15101 18701; do
  job eng${seed}_n4_01 "$E" $seed 4 50 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,1],$CAEN}]"
  job eng${seed}_n4_0 "$E" $seed 4 50 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0],$CAEN}]"
  job eng${seed}_n6_012 "$E" $seed 6 50 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,1,2],$CHER}]"
  job eng${seed}_n5_34 "$E" $seed 5 50 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[3,4],$CAEN}]"
  job eng${seed}_hourly "$E" $seed 4 50 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0],$DIEP},{\"at\":\"aboard\",\"plus\":3,\"who\":[1],$DIEP},{\"at\":\"aboard\",\"plus\":4,\"who\":[2],$DIEP},{\"at\":\"aboard\",\"plus\":5,\"who\":[3],$DIEP}]"
done
E2='TAG=ENG FOE=FRA HOME_XY=1023.5,275.5 TGT=1034.5,279.5 NOW=click T0=1 EXTRA=0'
job eng15101_seawater "$E2" 15101 2 40 '[{"at":"aboard","plus":4,"who":[0,1],"x":1030.5,"y":283.5}]'
job eng18701_seawater "$E2" 18701 3 40 '[{"at":"aboard","plus":4,"who":[0,1,2],"x":1027.5,"y":281.5}]'
J='AT0=port NOW=click T0=1 EXTRA=0'
FZ='"x":1703.5,"y":445.5'
for seed in 18703 18705 18707; do
  job jap${seed}_n4_012 "$J" $seed 4 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,1,2],$FZ}]"
  job jap${seed}_n5_01 "$J" $seed 5 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,1],$FZ}]"
  job jap${seed}_n4_23 "$J" $seed 4 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[2,3],$FZ}]"
done
echo "$(wc -l < $OUT) jobs"
