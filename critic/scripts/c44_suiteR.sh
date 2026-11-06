#!/bin/sh
# Critic run 36: run 35's R22/R23 page cases on HEAD (the blocking cases and R35-N1), with the commands recorded.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c44_sn_stale 3517 GER 1100.5 267.5 1079.5 260.5 1037.5 294.5 1076.5 276.5 ger3
r c44_sn_stale 3517 GER 1100.5 267.5 1079.5 260.5 1037.5 294.5 1079.5 260.5 ger_samegoal
r c44_lwt_landwait 3517 4 60 24 same 1600 900 four_same
r c44_lwt_landwait 3517 4 8 24 sea 1600 900 four_sea
r c44_lwt_landwait 3517 4 8 24 neutral 1600 900 four_neutral
r c44_lwt_landwait 3517 4 60 300 recall 1600 900 four_recall
r c44_ssb_stranded
r c44_pst_portshut
r c44_lwp_phonepanel 1600 900 desk
r c44_lwp_phonepanel 390 844 phone
echo SUITERDONE
