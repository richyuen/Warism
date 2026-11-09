#!/bin/sh
# Critic run 57 (full): after every other job, alone: frame rates on each commit's 7019 year-20 save (HEAD 5357,
# d016ed2a 5356), lookFps, and the 1938 tick time on seed 99 (5 years) on each commit, one after the other.
cd /c/Git/Warism
echo "start $(date +%T)" > critic/c57_pf.status
TAG=_head BASE=http://127.0.0.1:5357 node critic/scripts/c57_pf_lookfps.mjs 7019 critic/c57_seed7019_y20.bin > critic/c57_pf_lookfps.log 2>&1; echo "pf head $? $(date +%T)" >> critic/c57_pf.status
TAG=_old BASE=http://127.0.0.1:5356 node critic/scripts/c57_pf_lookfps.mjs 7019 critic/c57_seed7019_y20_old.bin > critic/c57_pf_lookfps_old.log 2>&1; echo "pf old $? $(date +%T)" >> critic/c57_pf.status
BASE=http://127.0.0.1:5357 npx tsx tools/diag/lookFps.ts 7019 critic/c57_seed7019_y20.bin critic/c57_lookfps_7019.json > critic/c57_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c57_pf.status
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c57_sim99_head.log 2>&1; echo "sim head $? $(date +%T)" >> critic/c57_pf.status
(cd critic/wt && npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF) > critic/c57_sim99_old.log 2>&1; echo "sim old $? $(date +%T)" >> critic/c57_pf.status
echo done: >> critic/c57_pf.status
