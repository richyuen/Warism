#!/bin/sh
# Critic run 87: the QHD frame case of the chain (c85_pf_lookfps 7019 year-20 world, 2560 x 1440) on run 86's build
# (critic/c85b_dist, bd85eb10, on 5422) and HEAD's (5421), alternated A B A B, alone after the chain: is the 1.3 fps drop at
# QHD and 4K the page's (R200 to R202) or the machine's?
cd /c/Git/Warism
until grep -q PFDONE critic/c87_pf.status; do sleep 10; done
(npx vite preview --outDir critic/c85b_dist --port 5422 --strictPort --host 127.0.0.1 > critic/c87_preview86.log 2>&1 &)
sleep 8
for i in 1 2; do
  for b in 5422 5421; do
    BASE=http://127.0.0.1:$b TAG=_c87ab_${b}_$i VW=2560 VH=1440 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c87_seed7019_y20.bin > critic/c87_pfab_${b}_$i.log 2>&1
    echo "ab $b $i $? $(date +%T)" >> critic/c87_pfab.status
  done
done
echo ABDONE >> critic/c87_pfab.status
