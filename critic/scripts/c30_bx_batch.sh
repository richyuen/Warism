#!/bin/sh
# Critic run 27: BX cases on HEAD and on run 26's commit.
cd /c/Git/Warism
npx tsx critic/scripts/c30_bx.ts 7019 POL GER ITA 60 critic/c30_bx_head_7019_GERatk_ITA.json attack > critic/c30_bx_head_a.log 2>&1 &
npx tsx critic/scripts/c30_bx.ts 7019 SOV POL ROM 60 critic/c30_bx_head_7019_POL_ROM.json > critic/c30_bx_head_b.log 2>&1 &
npx tsx critic/scripts/c30_bx.ts 2531 SOV POL ROM 60 critic/c30_bx_head_2531_POL_ROM.json > critic/c30_bx_head_c.log 2>&1 &
cd critic/wt
npx tsx critic/scripts/c30_bx.ts 7019 POL GER ITA 60 /c/Git/Warism/critic/c30_bx_c26_7019_GERatk_ITA.json attack > /c/Git/Warism/critic/c30_bx_c26_a.log 2>&1 &
npx tsx critic/scripts/c30_bx.ts 7019 SOV POL ROM 60 /c/Git/Warism/critic/c30_bx_c26_7019_POL_ROM.json > /c/Git/Warism/critic/c30_bx_c26_b.log 2>&1 &
wait
echo BXDONE > /c/Git/Warism/critic/c30_bx.done
