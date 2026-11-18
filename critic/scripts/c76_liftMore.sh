#!/bin/sh
# Critic run 76: the `lift` rule (R139) on more new seeds, after it broke on 33501 and 58011: diploInvariants five years.
cd /c/Git/Warism
printf '%s\n' "59013 scenario" "59015 scenario" "59017 scenario --heroes" "59019 random" "59021 random --heroes" "59023 scenario" | xargs -P 3 -L 1 sh -c 'npx tsx tools/diag/diploInvariants.ts $0 $1 1825 $2 > critic/c76_diploinv_lift_$0.log 2>&1'
echo done > critic/c76_liftMore.done
