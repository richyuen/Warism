#!/bin/sh
# Critic run 28 (full): the headless queue on HEAD, in groups of <= 6 sims.
# HEAD's src is identical to run 27's commit (15b7b08b; the build is byte-identical), so the "before" for every
# re-run case is run 27's own file (c27_*), and no worktree is needed.
cd /c/Git/Warism
T="npx tsx critic/scripts"
# A: the 20-year 7019 world (its y20 save feeds the page's history / export / PF probes), two new seeds x 30 years,
#    OR2 (R27-N2), PR (Manchukuo, Albania).
$T/c31_headless.ts 7019 20 critic/c31_headless_7019.json 20 critic/c31_seed7019_y20.bin > critic/c31_headless_7019.log 2>&1 &
$T/c31_headless.ts 1777 30 critic/c31_headless_1777.json > critic/c31_headless_1777.log 2>&1 &
$T/c31_headless.ts 8209 30 critic/c31_headless_8209.json > critic/c31_headless_8209.log 2>&1 &
$T/c31_or2.ts 7019 300 MON ROM 60 critic/c31_or2_head_7019_MON_ROM.json > critic/c31_or2_head.log 2>&1 &
$T/c31_pr.ts 7019 30 MAN JAP critic/c31_pr_head_7019_MAN.json > critic/c31_pr_head_MAN.log 2>&1 &
$T/c31_pr.ts 7019 30 ALB ITA critic/c31_pr_head_7019_ALB.json > critic/c31_pr_head_ALB.log 2>&1 &
wait
echo ALLDONE > critic/c31_batch.done
# B: EXIT x 3, COBEL, BS x 4 (HEAD only)
for s in 7019 2531 8467; do $T/c31_exit.ts $s 45 critic/c31_exit_head_$s.json > critic/c31_exit_head_$s.log 2>&1 & done
$T/c31_cobel.ts 7019 critic/c31_cobel_head_GER_ITA_POL.json GER ITA POL > critic/c31_cobel_head.log 2>&1 &
for s in 7019 2531; do $T/c31_bs.ts $s 365 critic/c31_bs_head_$s.json > critic/c31_bs_head_$s.log 2>&1 & done
wait
for s in 8467 3739; do $T/c31_bs.ts $s 365 critic/c31_bs_head_$s.json > critic/c31_bs_head_$s.log 2>&1 & done
echo BSDONE > critic/c31_bs.done
# C: PZ x 4
for s in 7019 2207 5113 9241; do $T/c31_pz.ts $s 365 critic/c31_pz_$s.json > critic/c31_pz_$s.log 2>&1 & done
wait
# D: BX x 3, AL, BOTH x 2
$T/c31_bx.ts 7019 POL GER ITA 60 critic/c31_bx_head_7019_GERatk_ITA.json attack > critic/c31_bx_head_a.log 2>&1 &
$T/c31_bx.ts 7019 SOV POL ROM 60 critic/c31_bx_head_7019_POL_ROM.json > critic/c31_bx_head_b.log 2>&1 &
$T/c31_bx.ts 2531 SOV POL ROM 60 critic/c31_bx_head_2531_POL_ROM.json > critic/c31_bx_head_c.log 2>&1 &
$T/c31_al.ts 7019 30,120 critic/c31_al_7019.json > critic/c31_al_7019.log 2>&1 &
for s in 5113 6151; do $T/c31_both.ts $s 730 critic/c31_both_head_$s.json > critic/c31_both_head_$s.log 2>&1 & done
wait
# E: OR on 4 seeds (R27-N2's count) and BOTH on a new seed
for s in 7019 2207 5113 9241; do $T/c31_or.ts $s 30,120,300 critic/c31_or_$s.json 150 > critic/c31_or_$s.log 2>&1 & done
$T/c31_both.ts 9241 730 critic/c31_both_head_9241.json > critic/c31_both_head_9241.log 2>&1 &
wait
echo HQDONE > critic/c31_hq.done
