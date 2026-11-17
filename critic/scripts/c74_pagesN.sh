#!/bin/sh
# Critic run 74 (focused): run 73's named page cases on HEAD's build (5375), and the same on run 73's build (5373)
# where a figure is compared. Two chains: A (1938 cases), B (the look, long).
cd /c/Git/Warism
export BASE=http://127.0.0.1:5375
case "$1" in
A)
  node critic/scripts/c74_massSeen.mjs 56211 'Soviet Union' Romania 1218,300 40,55,65,72,75 > critic/c74_ms_56211.log 2>&1
  node critic/scripts/c74_look.mjs 56903 390 844 60,240 phone > critic/c74_look_56903_phone.log 2>&1
  node critic/scripts/c74_markers.mjs 56951 head 1600 900 1675,372 10,20,30 1800,1200,600 > critic/c74_mk_head_desk.log 2>&1
  echo ADONE;;
B)
  node critic/scripts/c74_look.mjs 56901 1600 900 45,180,400 > critic/c74_look_56901_desk.log 2>&1
  echo BDONE;;
C)
  until [ -f critic/c74_build.done ]; do sleep 10; done
  AFTER=4242 node critic/scripts/c74_bannerOwn.mjs 1942 GER Germany 150 > critic/c74_bo_1942_GER_after4242.log 2>&1
  AFTER=4242 TAG=phone node critic/scripts/c74_bannerOwn.mjs 1942 GER Germany 150 390 844 > critic/c74_bo_1942_GER_after4242_phone.log 2>&1
  node critic/scripts/c74_takescore.mjs 1942 GER 240 > critic/c74_takescore_1942_GER_240.log 2>&1
  echo CDONE;;
esac
