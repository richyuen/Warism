#!/bin/bash
# Critic run 80 (full), lane D: map visuals and semantic zoom at every tier (look, zoom, markers, heroes' counters),
# resizes, and the monkeys (four sizes, desk and touch), on new seeds 68xxx; then seaBattlesLook on this run's sea fights.
. /c/Git/Warism/critic/scripts/c80_r.sh
r look 68901 1600 900 45,180,400
r look 68903 390 844 60,240 phone
r look 68907 2560 1440 120,500
r z_zoom 68911
r markers 56951 head 1600 900 1675,372 10,20,30 1800,1200,600
r markers 68951 head 1600 900 1675,372 10,20,30 1800,1200,600
r markerPop 68951 30 head 1675,372
r markerPop 56951 30 head 1675,372
for c in "56901 400" "57905 200" "68905 300"; do r heroPop $c head; done
r resize 68821 60
TO=600 r monkey 68803 300
TO=600 r monkey 68811 300 390 844 touch
TO=600 r monkey 68813 180 1280 720
TO=600 r monkey 68815 180 844 390 touch
r massSeen 56211
waitfile critic/c80_named.done done
for s in 68061 68069; do
  echo "== sbl $s"; npx tsx tools/diag/seaBattlesLook.ts critic/c80_sb_$s.json --out critic/c80_sbl_$s.json > critic/c80_sbl_$s.log 2>&1; echo "   exit $?"
done
# Run 79's named page cases on their own seeds: the WebGL warning's look (R79-N2), the strike's ring over Paris, the
# civil war's sea battle flags, the AI's bomb spot on 64511 (run 79's save), the phone's heroes' names.
r look 64907 2560 1440 120,500
r a_god_nuke 64917
r seaclick 64913
r an_ainuke 64511 critic/c79_seed64511_y13.bin 64511y13 2 400
r look 64903 390 844 60,240 phone
echo done > critic/c80_laneD.done
