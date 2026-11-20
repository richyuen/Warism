#!/bin/bash
# Critic run 89, lane S3: R88-B1's own case on both builds at the same time, as this run's control: plain 1938 seed
# 88901, one step of 9,600 hours, 16 loads each, 4 at once, HEAD (5441) and run 88's build (3e1ed78e, 5442).
cd /c/Git/Warism
until [ -f critic/c89_laneS.done ]; do sleep 10; done
(BASE=http://127.0.0.1:5442 TAG=_old_ctl timeout 1500 node critic/scripts/c89_longStep.mjs 88901 9600 16 4 > critic/c89_ls_old_ctl_88901.log 2>&1) &
BASE=http://127.0.0.1:5441 TAG=_head_ctl timeout 1500 node critic/scripts/c89_longStep.mjs 88901 9600 16 4 > critic/c89_ls_head_ctl_88901.log 2>&1
wait
echo done > critic/c89_laneS3.done
