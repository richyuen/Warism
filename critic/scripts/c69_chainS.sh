#!/bin/sh
# Critic run 69 (full): the headless cases that need the built starts (critic/c69_starts, to 1991), 3 at a time beside the
# queue: free bursts (plain 1938 and ten years, R83b's options left at their defaults), the 1991 end hours on four
# seeds, the 1975 traits and land, the 1975 strikes; R82d's farConquests (run 68's seeds and new ones); the far landings;
# then c69_free.ts, the rule checkers on games from built years, free with R83b's options and on the track past 1991.
cd /c/Git/Warism
until [ -f critic/c69_build.done ]; do sleep 15; done
sh critic/scripts/c69_freeburst.sh
for a in 999 5151 6161 31337; do echo $a; done | xargs -P 3 -I{} sh -c 'npx tsx critic/scripts/c69_endhours91.ts {} > critic/c69_endhours91_{}.log 2>&1'
npx tsx critic/scripts/c69_traits.ts 1975 JAP ITA NSP FRG USA SOV ENG > critic/c69_traits.log 2>&1
npx tsx critic/scripts/c69_landof.ts 1975 NFL TAN BEA SUD MAN FRG NSP > critic/c69_landof_1975.log 2>&1
npx tsx critic/scripts/c69_nukes75.ts 6161 365 1975 > critic/c69_nukes75_6161.log 2>&1
for a in "1975 6161,41161,41163,41165,41167 a" "0 6161,41161,41163,41165,41167 a" "0 51161,51163,51165,51167,51169 b" "1975 51161,51163,51165,51167,51169 b"; do echo "$a"; done |
  xargs -P 3 -L 1 sh -c 'npx tsx critic/scripts/c69_farConquests.ts $0 $1 730 > critic/c69_farc_$0_$2.log 2>&1'
for s in 7019 39811 39813; do echo $s; done | xargs -P 3 -I{} sh -c 'npx tsx critic/scripts/c69_farlands.ts {} 3 > critic/c69_farlands_{}.log 2>&1'
cat > critic/c69_free.jobs <<'J'
1975 51501 730 free -
1975 51503 730 free diplomacy=random,aggression=random,heroes=on
1983 51505 730 free traits=random,gold=random
1991 51507 1825 free -
1989 51509 1825 track -
1991 51511 1825 track -
1962 51513 730 free heroes=on
1946 51515 730 free diplomacy=random
1983 51517 365 free loopingMap=false
1991 51519 1825 free diplomacy=random,heroes=on
J
xargs -P 3 -L 1 sh -c 'npx tsx critic/scripts/c69_free.ts $0 $1 $2 $3 $4 > critic/c69_free_$0_$1_$3.log 2>&1' < critic/c69_free.jobs
npx tsx tools/diag/blocEnd.ts 51521 10 > critic/c69_blocEnd_51521.log 2>&1
npx tsx tools/diag/breakup.ts 51523 30 > critic/c69_breakup_51523.log 2>&1
echo done > critic/c69_chainS.done
