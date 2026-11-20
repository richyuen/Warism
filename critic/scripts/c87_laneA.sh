#!/bin/bash
# Critic run 87: run 86's named cases on HEAD (bbf47bca, critic/c87_dist on 5421): R86-N2 (c86_modeRow), R86-N1
# (c86_relSaid), the wide-desk row (c86_deskAttack, R202), and the lane G / lane K cases. Logs critic/c87_<n>_<args>.log.
cd /c/Git/Warism
p() { n=$1; s=$2; shift 2; echo "== $n $* $(date +%T)"; BASE=http://127.0.0.1:5421 TAG=_c87 DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c87_${n}_$(echo "$*" | tr ' ,' '__').log 2>&1; echo "   exit $?"; }
p mr c86_modeRow 85901 400 800 seaControl,airControl,fallout
p mr c86_modeRow 84901 400 800 political,seaControl,airControl,fallout,puppets
p rs c86_relSaid 84903 400
p da c86_deskAttack 84901 400
echo done > critic/c87_laneA.done
