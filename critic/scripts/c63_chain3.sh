#!/bin/sh
# Critic run 55: after every other job, alone: frame rates and the glide, on HEAD (5363) and on 8d7d02fe (5362).
cd /c/Git/Warism
until grep -q SUITEB2DONE critic/c63_suiteB.log 2>/dev/null && [ "$(grep -c . critic/c63_q_all.done 2>/dev/null)" -ge 27 ] && grep -q '^done:' critic/c63_replay.log 2>/dev/null; do sleep 30; done
echo "start $(date +%T)" > critic/c63_pf.status
export BASE=http://127.0.0.1:5363
node critic/scripts/c63_pf_lookfps.mjs 7019 critic/c63_seed7019_y20.bin > critic/c63_pf_lookfps.log 2>&1; echo "pf $? $(date +%T)" >> critic/c63_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c63_seed7019_y20.bin critic/c63_lookfps_7019.json > critic/c63_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c63_pf.status
node critic/scripts/c63_glide.mjs 7019 critic/c63_seed7019_y20.bin 120 head > critic/c63_glide_head_120.log 2>&1
node critic/scripts/c63_glide.mjs 7019 critic/c63_seed7019_y20.bin 30 head > critic/c63_glide_head_30.log 2>&1
node critic/scripts/c63_glide.mjs 99 - 150 head > critic/c63_glide_head_99.log 2>&1
node critic/scripts/c63_tm_touch.mjs > critic/c63_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c63_pf.status
(cd critic/wt && npx vite preview --outDir ../c63_olddist --port 5362 --strictPort --host 127.0.0.1 > ../c63_oldpreview.log 2>&1 &)
until curl -s http://127.0.0.1:5362/ > /dev/null; do sleep 2; done
export BASE=http://127.0.0.1:5362
node critic/scripts/c63_glide.mjs 7019 critic/c54_seed7019_y20.bin 120 old > critic/c63_glide_old_120.log 2>&1
node critic/scripts/c63_glide.mjs 7019 critic/c54_seed7019_y20.bin 30 old > critic/c63_glide_old_30.log 2>&1
node critic/scripts/c63_glide.mjs 99 - 150 old > critic/c63_glide_old_99.log 2>&1
TAG=_old node critic/scripts/c63_pf_lookfps.mjs 7019 critic/c54_seed7019_y20.bin > critic/c63_pf_lookfps_old.log 2>&1; echo "pfold $? $(date +%T)" >> critic/c63_pf.status
echo PFDONE >> critic/c63_pf.status
