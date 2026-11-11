#!/bin/sh
# Critic run 62: run 61's slowClick breaks (R61-SC) on HEAD.
cd /c/Git/Warism
npx tsx tools/diag/landingInvariants.ts 32167 3517 120 32167 30,90 2 > critic/c62_li_32167_g2.log 2>&1 &
npx tsx tools/diag/landingInvariants.ts 32167 3517 120 32167 30,90 1 > critic/c62_li_32167_g1.log 2>&1 &
npx tsx tools/diag/landingInvariants.ts 32115 15101 120 32115 30,90 2 > critic/c62_li_32115_15101_g2.log 2>&1 &
wait
