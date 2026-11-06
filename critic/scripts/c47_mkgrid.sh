#!/bin/sh
# Critic run 47 (copy of run 46): new split grid, Japan, seeds x shapes x delay x target, on c47_ll7 (HEAD only).
for seed in 19101 19103 19105 19107 19109; do
 for tg in fz:1703.5:445.5 ts:1703.5:373.5; do
  T=${tg%%:*}; R=${tg#*:}; X=${R%%:*}; Y=${R#*:}
  for plus in 2 24 72; do
   for sh in "4:012:0,1,2" "4:23:2,3" "5:01:0,1" "3:12:1,2" "6:0123:0,1,2,3"; do
    n=${sh%%:*}; r=${sh#*:}; nm=${r%%:*}; who=${r#*:}
    echo "AT0=port NOW=click T0=1 EXTRA=0 ORDERS='[{\"at\":\"aboard\",\"plus\":$plus,\"who\":[$who],\"x\":$X,\"y\":$Y}]' npx tsx critic/scripts/c47_ll7.ts $seed $n 80 critic/c47_g_${seed}_${T}_p${plus}_n${n}_${nm}.json > critic/c47_g_${seed}_${T}_p${plus}_n${n}_${nm}.log 2>&1"
   done
  done
 done
done
