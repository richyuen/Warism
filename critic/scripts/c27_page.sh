#!/bin/sh
# Critic run 27 (focused): run 26's diplomacy page probes on HEAD (5299), PP also on run 26's build (5298).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1800 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c27_pp 7019 30 MAN JAP 5299 head
r c27_pp 7019 30 MAN JAP 5298 c26
r c27_pp 7019 30 ALB ITA 5299 head
r c27_fw2_forcewar 2207
r c27_fw_forcewar 2207
r c27_es2_exit 7019 5299 head 10
r c27_es_escape 7019 5299 head
r c27_es2_exit 2531 5299 head 10
r c27_es2_exit 8467 5299 head 10
r c27_bt 5113 1600 900 desk
r c27_bt 5113 390 844 phone
r c27_pg 3739 1600 900 desk
r c27_pg 7019 1600 900 wl ENG,POL 33 LIT,POL
r c27_gu_guarantee 3739
r c27_k2_refusal 2203
r c27_k3_godtab 2203
r c27_td_touchdiplo 3391
r c27_dr_diplo 8821
echo PAGEDONE
