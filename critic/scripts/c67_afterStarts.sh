#!/bin/sh
# Critic run 66: the headless cases that need the built starts (critic/c67_starts): free bursts (plain 1938, and the
# replay left at 1938, 1939, 1941, 1946, 1954, 1963, 1975), the end hours of 1975 on four seeds, the 1975 traits and
# land, and the 1975 arsenals and first-year strikes.
cd /c/Git/Warism
until [ -f critic/c67_build.done ]; do sleep 15; done
sh critic/scripts/c67_freeburst.sh
for a in 999 5151 6161 31337; do npx tsx critic/scripts/c67_endhours.ts $a > critic/c67_endhours_$a.log 2>&1 & done; wait
npx tsx critic/scripts/c67_traits.ts 1975 JAP ITA NSP FRG USA SOV ENG > critic/c67_traits.log 2>&1
npx tsx critic/scripts/c67_landof.ts 1975 NFL TAN BEA SUD MAN FRG NSP > critic/c67_landof_1975.log 2>&1
npx tsx critic/scripts/c67_nukes75.ts 6161 365 1975 > critic/c67_nukes75_6161.log 2>&1
echo done > critic/c67_afterStarts.done
