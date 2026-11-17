#!/bin/sh
# Critic run 75 (focused): run 74's named page cases on HEAD's build (5377), and the row's probes on run 74's build
# (5378) where a figure is compared. Chains: A, B, C as run 74's c75_pagesN.sh; R (R130: bannerRank, bannerFlip).
cd /c/Git/Warism
export BASE=http://127.0.0.1:5377
case "$1" in
R)
  node critic/scripts/c75_bannerRank.mjs 57901 150 > critic/c75_br_57901.log 2>&1
  node critic/scripts/c75_bannerRank.mjs 57903 150 > critic/c75_br_57903.log 2>&1
  node critic/scripts/c75_bannerRank.mjs 58901 150 > critic/c75_br_58901.log 2>&1
  echo RDONE > critic/c75_pagesR.done;;
F)
  for sd in "57901 150" "57903 120" "58901 200"; do
    set -- $sd
    ( node critic/scripts/c75_bannerFlip.mjs $1 $2 head 60 > critic/c75_bf_head_$1.log 2>&1 ) &
    ( BASE=http://127.0.0.1:5378 node critic/scripts/c75_bannerFlip.mjs $1 $2 c74build 60 > critic/c75_bf_c74build_$1.log 2>&1 ) &
    wait
  done
  ( node critic/scripts/c75_bannerFlip.mjs 57901 150 headphone 60 390 844 > critic/c75_bf_headphone_57901.log 2>&1 ) &
  ( BASE=http://127.0.0.1:5378 node critic/scripts/c75_bannerFlip.mjs 57901 150 c74phone 60 390 844 > critic/c75_bf_c74phone_57901.log 2>&1 ) &
  wait
  echo FDONE > critic/c75_pagesF.done;;
esac
