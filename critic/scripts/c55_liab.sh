#!/bin/sh
# Critic run 55: landingInvariants (3517, groups 2 and 1; 15101 groups 2) on new seeds, on HEAD and on 8d7d02fe (critic/wt).
cd /c/Git/Warism
for s in 26031 26033 26035 26037 26039 26041 26043 26045 26047 26049; do
  for spec in "3517 120 $s 30,90 2" "15101 120 $s 30,90 2" "3517 120 $s 30,90 1"; do
    set -- $spec
    h=$(npx tsx tools/diag/landingInvariants.ts $s $spec 2>&1 | grep -E "broken|slowClick:" | tr '\n' ' ')
    o=$(cd critic/wt && npx tsx tools/diag/landingInvariants.ts $s $spec 2>&1 | grep -E "broken|slowClick:" | tr '\n' ' ')
    echo "$s [$spec] HEAD: $h"
    echo "$s [$spec] OLD:  $o"
  done
done
echo done:
