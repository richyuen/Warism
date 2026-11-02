# PLAN 7.189 (R25-B1): no nation leaves a war by declaring on its partner — the AT run

Run: `npx tsx tools/diag/partnerExit.ts <seed>` on the working tree (the rule) and on `e4386478` (a worktree).
Germany declares on Poland on day 1; EXIT: Poland forces war on France (its partner) on day 45; COBEL: Germany on Italy
(its partner) on day 61. An hour later: the old war, the cells held both ways (the hour's fighting moves them by 2 at most).

## With the rule: 0 of 6 left
```
seed 7019 EXIT: kept — POL on FRA, day 45: at war with GER true → true, held 439 → 437, at war with the partner false
seed 7019 COBEL: kept — GER on ITA, day 61: at war with POL true → true, held 383 → 383, at war with the partner false
seed 2531 EXIT: kept — POL on FRA, day 45: at war with GER true → true, held 287 → 288, at war with the partner false
seed 2531 COBEL: kept — GER on ITA, day 61: at war with POL true → true, held 456 → 457, at war with the partner false
seed 8467 EXIT: kept — POL on FRA, day 45: at war with GER true → true, held 384 → 384, at war with the partner false
seed 8467 COBEL: kept — GER on ITA, day 61: at war with POL true → true, held 271 → 271, at war with the partner false
```

## e4386478: 6 of 6 left, the land held to 0
```
seed 7019 EXIT: LEFT — POL on FRA, day 45: at war with GER true → false, held 439 → 0, at war with the partner true
seed 7019 COBEL: LEFT — GER on ITA, day 61: at war with POL true → false, held 383 → 0, at war with the partner true
seed 2531 EXIT: LEFT — POL on FRA, day 45: at war with GER true → false, held 287 → 0, at war with the partner true
seed 2531 COBEL: LEFT — GER on ITA, day 61: at war with POL true → false, held 456 → 0, at war with the partner true
seed 8467 EXIT: LEFT — POL on FRA, day 45: at war with GER true → false, held 384 → 0, at war with the partner true
seed 8467 COBEL: LEFT — GER on ITA, day 61: at war with POL true → false, held 271 → 0, at war with the partner true
```
