#!/bin/bash
# Critic run 79 (full), lane D: map visuals and semantic zoom at every tier (look, zoom, markers, heroes' counters),
# resizes, and the monkeys (four sizes, desk and touch), on new seeds 64xxx; then seaBattlesLook on this run's sea fights.
. /c/Git/Warism/critic/scripts/c79_r.sh
r look 64901 1600 900 45,180,400
r look 64903 390 844 60,240 phone
r look 64907 2560 1440 120,500
r z_zoom 64911
r markers 56951 head 1600 900 1675,372 10,20,30 1800,1200,600
r markers 64951 head 1600 900 1675,372 10,20,30 1800,1200,600
r markerPop 64951 30 head 1675,372
r markerPop 56951 30 head 1675,372
for c in "56901 400" "57905 200" "64905 300"; do r heroPop $c head; done
r resize 64821 60
TO=600 r monkey 64803 300
TO=600 r monkey 64811 300 390 844 touch
TO=600 r monkey 64813 180 1280 720
TO=600 r monkey 64815 180 844 390 touch
r massSeen 56211
waitfile critic/c79_named.done done
for s in 64061 64069; do
  echo "== sbl $s"; npx tsx tools/diag/seaBattlesLook.ts critic/c79_sb_$s.json --out critic/c79_sbl_$s.json > critic/c79_sbl_$s.log 2>&1; echo "   exit $?"
done
echo done > critic/c79_laneD.done
