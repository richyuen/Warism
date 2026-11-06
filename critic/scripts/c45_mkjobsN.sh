#!/bin/sh
# Critic run 45 (new): R36's new cases, each on HEAD (critic/c45_n_*) and on run 44's commit 0fba90d8 in critic/wt (critic/c45_nwt_*).
# Writes critic/scripts/c45_jobsN2.txt.
cd /c/Git/Warism
OUT=critic/scripts/c45_jobsN2.txt
: > $OUT
FZ='"x":1703.5,"y":445.5'
job() { # tag env seed n days orders
  tag=$1; envs=$2; seed=$3; n=$4; d=$5; ord=$6
  echo "$envs ORDERS='$ord' npx tsx critic/scripts/c45_ll5.ts $seed $n $d critic/c45_n_$tag.json > critic/c45_n_$tag.log 2>&1" >> $OUT
  echo "cd critic/wt && $envs ORDERS='$ord' npx tsx critic/scripts/c45_ll5.ts $seed $n $d ../c45_nwt_$tag.json > ../c45_nwt_$tag.log 2>&1" >> $OUT
}
P='AT0=port NOW=click T0=1 EXTRA=0'
# Run 44's split grid (8 shapes) and four_hourly on the AT's second seed 15101 and on new seed 18601.
for seed in 15101 18601; do
  job sx${seed}_n3_01 "$P" $seed 3 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,1],$FZ}]"
  job sx${seed}_n3_12 "$P" $seed 3 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[1,2],$FZ}]"
  job sx${seed}_n4_012 "$P" $seed 4 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,1,2],$FZ}]"
  job sx${seed}_n4_23 "$P" $seed 4 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[2,3],$FZ}]"
  job sx${seed}_n4_03 "$P" $seed 4 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,3],$FZ}]"
  job sx${seed}_n5_01 "$P" $seed 5 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,1],$FZ}]"
  job sx${seed}_n5_012 "$P" $seed 5 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,1,2],$FZ}]"
  job sx${seed}_n6_012 "$P" $seed 6 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,1,2],$FZ}]"
  job hourly${seed} "$P" $seed 4 60 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0],$FZ},{\"at\":\"aboard\",\"plus\":3,\"who\":[1],$FZ},{\"at\":\"aboard\",\"plus\":4,\"who\":[2],$FZ},{\"at\":\"aboard\",\"plus\":5,\"who\":[3],$FZ}]"
done
# New shapes on 3517.
job sx3517_n3_0 "$P" 3517 3 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0],$FZ}]"
job sx3517_n4_1 "$P" 3517 4 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[1],$FZ}]"
job sx3517_n5_234 "$P" 3517 5 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[2,3,4],$FZ}]"
job sx3517_n6_01 "$P" 3517 6 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,1],$FZ}]"
job sx3517_n6_345 "$P" 3517 6 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[3,4,5],$FZ}]"
job sx3517_n2_0d "$P" 3517 2 70 "[{\"at\":\"aboard\",\"plus\":30,\"who\":[0],$FZ}]"
# Two re-sent, then sent back to Shanghai a day later (re-merge).
job sx3517_n4_01_back "$P" 3517 4 70 "[{\"at\":\"aboard\",\"plus\":2,\"who\":[0,1],$FZ},{\"at\":\"aboard\",\"plus\":26,\"who\":[0,1],\"x\":1715.5,\"y\":413.5}]"
# A gathering landing (ashore at its port) clicked whole, or one of it, onto the water.
job gwater_both "$P" 3517 2 60 '[{"at":"aboard","plus":2,"who":[0,1],"x":1715.5,"y":412.5}]'
job gwater_one "$P" 3517 2 60 '[{"at":"aboard","plus":2,"who":[0],"x":1715.5,"y":412.5}]'
job gwater_tokyo "$P" 3517 2 60 '[{"at":"aboard","plus":2,"who":[0,1],"x":1822.5,"y":392.5}]'
# A landing at sea plus a fresh division ashore, one click onto the water.
S='NOW=click T0=1'
job mixwater "$S EXTRA=1" 3517 2 60 '[{"at":"aboard","plus":26,"who":[0,1,2],"x":1718.5,"y":413.5}]'
# One of a landing at sea onto the water.
job onewater "$S EXTRA=0" 3517 2 60 '[{"at":"aboard","plus":26,"who":[0],"x":1718.5,"y":413.5}]'
# The whole landing at sea onto water on the second seed and a new one; and onto water by Tokyo (its own port's sea).
job seawater_15101 "$S EXTRA=0" 15101 2 60 '[{"at":"aboard","plus":26,"who":[0,1],"x":1718.5,"y":413.5}]'
job seawater_18601 "$S EXTRA=0" 18601 2 60 '[{"at":"aboard","plus":26,"who":[0,1],"x":1718.5,"y":413.5}]'
job seawater_tokyo "$S EXTRA=0" 3517 2 60 '[{"at":"aboard","plus":26,"who":[0,1],"x":1822.5,"y":392.5}]'
# Two waters in a row (a second misclick a day later) and then the real cancel.
job seawater_twice "$S EXTRA=0" 3517 2 60 '[{"at":"aboard","plus":26,"who":[0,1],"x":1718.5,"y":413.5},{"at":"aboard","plus":50,"who":[0,1],"x":1730.5,"y":413.5},{"at":"aboard","plus":74,"who":[0,1],"x":1812.5,"y":382.5}]'
echo "$(wc -l < $OUT) jobs"
