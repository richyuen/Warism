#!/bin/sh
# Critic run 58 (full): after every other job, alone: frame rates on HEAD's 7019 year-20 save (hash 78d08a02, the same
# world as run 57's), lookFps, and the 1938 tick time on seed 99 (5 years) on HEAD and on d3519cb0's sim (critic/old).
cd /c/Git/Warism
echo "start $(date +%T)" > critic/c58_pf.status
TAG=_head BASE=http://127.0.0.1:5358 node critic/scripts/c58_pf_lookfps.mjs 7019 critic/c58_seed7019_y20.bin > critic/c58_pf_lookfps.log 2>&1; echo "pf head $? $(date +%T)" >> critic/c58_pf.status
BASE=http://127.0.0.1:5358 npx tsx tools/diag/lookFps.ts 7019 critic/c58_seed7019_y20.bin critic/c58_lookfps_7019.json > critic/c58_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c58_pf.status
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c58_sim99_head.log 2>&1; echo "sim head $? $(date +%T)" >> critic/c58_pf.status
(cd critic/old && npx tsx tools/headless/cli.ts --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF) > critic/c58_sim99_old.log 2>&1; echo "sim old $? $(date +%T)" >> critic/c58_pf.status
echo done: >> critic/c58_pf.status
