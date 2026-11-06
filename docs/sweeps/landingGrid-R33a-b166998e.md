# Landing grid at HEAD b166998e (R33a baseline)

ROADMAP R33a (`tools/diag/landingGrid.ts`, `tests/helpers/landingGrid.ts`): each order at 6 h, 1, 2, 3, 5 days after the
first boards, 0–3 cells off, for the one aboard, one walking, both. A case is broken when any of its divisions is;
the kinds are counted by case. `idle`: an idle spell aboard over 72 h.

| seed | order | cases | skipped | broken | split | untold | away | mark | idle | home | longest idle aboard (h) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 3517 | cancel | 60 | 0 | 12 | 0 | 0 | 0 | 0 | 12 | 0 | 120 |
| 3517 | recall | 60 | 0 | 40 | 15 | 0 | 0 | 5 | 25 | 0 | 507 |
| 3517 | reclick | 60 | 0 | 60 | 0 | 0 | 0 | 0 | 60 | 0 | 507 |
| 3517 | redirect | 60 | 0 | 28 | 0 | 0 | 0 | 0 | 28 | 0 | 507 |
| 15101 | cancel | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 |
| 15101 | recall | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 |
| 15101 | reclick | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 27 |
| 15101 | redirect | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 27 |
| **all** | | 480 | 0 | **140** | 15 | 0 | 0 | 5 | 125 | 0 | 507 |

## Broken cases

### 3517 cancel (base t4, divisions 364, 365)

- cancel 120 h +0 aboard: **idle** 364 idle aboard 120 h
- cancel 120 h +0 walking: **idle** 364 idle aboard 120 h
- cancel 120 h +0 all: **idle** 364 idle aboard 120 h
- cancel 120 h +1 aboard: **idle** 364 idle aboard 120 h
- cancel 120 h +1 walking: **idle** 364 idle aboard 120 h
- cancel 120 h +1 all: **idle** 364 idle aboard 120 h
- cancel 120 h +2 aboard: **idle** 364 idle aboard 120 h
- cancel 120 h +2 walking: **idle** 364 idle aboard 120 h
- cancel 120 h +2 all: **idle** 364 idle aboard 120 h
- cancel 120 h +3 aboard: **idle** 364 idle aboard 120 h
- cancel 120 h +3 walking: **idle** 364 idle aboard 120 h
- cancel 120 h +3 all: **idle** 364 idle aboard 120 h

### 3517 recall (base t4, divisions 364, 365)

- recall 6 h +0 aboard: **mark** 364 landed at t634 with no mark at its order; **idle** 364 idle aboard 492 h
- recall 6 h +0 walking: **split** 364@128 365@634
- recall 6 h +0 all: **idle** 364 idle aboard 507 h
- recall 6 h +1 walking: **split** 364@128 365@634
- recall 6 h +1 all: **idle** 364 idle aboard 507 h
- recall 6 h +2 walking: **split** 364@128 365@634
- recall 6 h +2 all: **idle** 364 idle aboard 507 h
- recall 6 h +3 all: **idle** 364 idle aboard 507 h
- recall 24 h +0 aboard: **mark** 364 landed at t634 with no mark at its order; **idle** 364 idle aboard 458 h
- recall 24 h +0 walking: **split** 364@128 365@634
- recall 24 h +0 all: **idle** 364 idle aboard 507 h
- recall 24 h +1 walking: **split** 364@128 365@634
- recall 24 h +1 all: **idle** 364 idle aboard 507 h
- recall 24 h +2 walking: **split** 364@128 365@634
- recall 24 h +2 all: **idle** 364 idle aboard 507 h
- recall 24 h +3 all: **idle** 364 idle aboard 507 h
- recall 48 h +0 aboard: **mark** 364 landed at t634 with no mark at its order; **idle** 364 idle aboard 409 h
- recall 48 h +0 walking: **split** 364@128 365@634
- recall 48 h +0 all: **idle** 364 idle aboard 507 h
- recall 48 h +1 walking: **split** 364@128 365@634
- recall 48 h +1 all: **idle** 364 idle aboard 507 h
- recall 48 h +2 walking: **split** 364@128 365@634
- recall 48 h +2 all: **idle** 364 idle aboard 507 h
- recall 48 h +3 all: **idle** 364 idle aboard 507 h
- recall 72 h +0 aboard: **mark** 364 landed at t634 with no mark at its order; **idle** 364 idle aboard 362 h
- recall 72 h +0 walking: **split** 364@128 365@609
- recall 72 h +0 all: **idle** 364 idle aboard 507 h
- recall 72 h +1 walking: **split** 364@128 365@609
- recall 72 h +1 all: **idle** 364 idle aboard 507 h
- recall 72 h +2 walking: **split** 364@128 365@609
- recall 72 h +2 all: **idle** 364 idle aboard 507 h
- recall 72 h +3 all: **idle** 364 idle aboard 507 h
- recall 120 h +0 aboard: **mark** 364 landed at t634 with no mark at its order; **idle** 364 idle aboard 267 h
- recall 120 h +0 walking: **split** 364@128 365@609
- recall 120 h +0 all: **idle** 364 idle aboard 507 h
- recall 120 h +1 walking: **split** 364@128 365@609
- recall 120 h +1 all: **idle** 364 idle aboard 507 h
- recall 120 h +2 walking: **split** 364@128 365@609
- recall 120 h +2 all: **idle** 364 idle aboard 507 h
- recall 120 h +3 all: **idle** 364 idle aboard 507 h

### 3517 reclick (base t4, divisions 364, 365)

- reclick 6 h +0 aboard: **idle** 364 idle aboard 507 h
- reclick 6 h +0 walking: **idle** 364 idle aboard 507 h
- reclick 6 h +0 all: **idle** 364 idle aboard 507 h
- reclick 6 h +1 aboard: **idle** 364 idle aboard 507 h
- reclick 6 h +1 walking: **idle** 364 idle aboard 507 h
- reclick 6 h +1 all: **idle** 364 idle aboard 507 h
- reclick 6 h +2 aboard: **idle** 364 idle aboard 507 h
- reclick 6 h +2 walking: **idle** 364 idle aboard 507 h
- reclick 6 h +2 all: **idle** 364 idle aboard 507 h
- reclick 6 h +3 aboard: **idle** 364 idle aboard 507 h
- reclick 6 h +3 walking: **idle** 364 idle aboard 507 h
- reclick 6 h +3 all: **idle** 364 idle aboard 507 h
- reclick 24 h +0 aboard: **idle** 364 idle aboard 507 h
- reclick 24 h +0 walking: **idle** 364 idle aboard 507 h
- reclick 24 h +0 all: **idle** 364 idle aboard 507 h
- reclick 24 h +1 aboard: **idle** 364 idle aboard 507 h
- reclick 24 h +1 walking: **idle** 364 idle aboard 507 h
- reclick 24 h +1 all: **idle** 364 idle aboard 507 h
- reclick 24 h +2 aboard: **idle** 364 idle aboard 507 h
- reclick 24 h +2 walking: **idle** 364 idle aboard 507 h
- reclick 24 h +2 all: **idle** 364 idle aboard 507 h
- reclick 24 h +3 aboard: **idle** 364 idle aboard 507 h
- reclick 24 h +3 walking: **idle** 364 idle aboard 507 h
- reclick 24 h +3 all: **idle** 364 idle aboard 507 h
- reclick 48 h +0 aboard: **idle** 364 idle aboard 507 h
- reclick 48 h +0 walking: **idle** 364 idle aboard 507 h
- reclick 48 h +0 all: **idle** 364 idle aboard 507 h
- reclick 48 h +1 aboard: **idle** 364 idle aboard 507 h
- reclick 48 h +1 walking: **idle** 364 idle aboard 507 h
- reclick 48 h +1 all: **idle** 364 idle aboard 507 h
- reclick 48 h +2 aboard: **idle** 364 idle aboard 507 h
- reclick 48 h +2 walking: **idle** 364 idle aboard 507 h
- reclick 48 h +2 all: **idle** 364 idle aboard 507 h
- reclick 48 h +3 aboard: **idle** 364 idle aboard 507 h
- reclick 48 h +3 walking: **idle** 364 idle aboard 507 h
- reclick 48 h +3 all: **idle** 364 idle aboard 507 h
- reclick 72 h +0 aboard: **idle** 364 idle aboard 507 h
- reclick 72 h +0 walking: **idle** 364 idle aboard 507 h
- reclick 72 h +0 all: **idle** 364 idle aboard 507 h
- reclick 72 h +1 aboard: **idle** 364 idle aboard 507 h
- reclick 72 h +1 walking: **idle** 364 idle aboard 507 h
- reclick 72 h +1 all: **idle** 364 idle aboard 507 h
- reclick 72 h +2 aboard: **idle** 364 idle aboard 507 h
- reclick 72 h +2 walking: **idle** 364 idle aboard 507 h
- reclick 72 h +2 all: **idle** 364 idle aboard 507 h
- reclick 72 h +3 aboard: **idle** 364 idle aboard 507 h
- reclick 72 h +3 walking: **idle** 364 idle aboard 507 h
- reclick 72 h +3 all: **idle** 364 idle aboard 507 h
- reclick 120 h +0 aboard: **idle** 364 idle aboard 507 h
- reclick 120 h +0 walking: **idle** 364 idle aboard 507 h
- reclick 120 h +0 all: **idle** 364 idle aboard 507 h
- reclick 120 h +1 aboard: **idle** 364 idle aboard 507 h
- reclick 120 h +1 walking: **idle** 364 idle aboard 507 h
- reclick 120 h +1 all: **idle** 364 idle aboard 507 h
- reclick 120 h +2 aboard: **idle** 364 idle aboard 507 h
- reclick 120 h +2 walking: **idle** 364 idle aboard 507 h
- reclick 120 h +2 all: **idle** 364 idle aboard 507 h
- reclick 120 h +3 aboard: **idle** 364 idle aboard 507 h
- reclick 120 h +3 walking: **idle** 364 idle aboard 507 h
- reclick 120 h +3 all: **idle** 364 idle aboard 507 h

### 3517 redirect (base t4, divisions 364, 365)

- redirect 6 h +0 all: **idle** 364 idle aboard 507 h
- redirect 6 h +1 all: **idle** 364 idle aboard 507 h
- redirect 6 h +2 all: **idle** 364 idle aboard 507 h
- redirect 6 h +3 all: **idle** 364 idle aboard 507 h
- redirect 24 h +0 all: **idle** 364 idle aboard 507 h
- redirect 24 h +1 all: **idle** 364 idle aboard 507 h
- redirect 24 h +2 all: **idle** 364 idle aboard 507 h
- redirect 24 h +3 all: **idle** 364 idle aboard 507 h
- redirect 48 h +0 all: **idle** 364 idle aboard 507 h
- redirect 48 h +1 all: **idle** 364 idle aboard 507 h
- redirect 48 h +2 all: **idle** 364 idle aboard 507 h
- redirect 48 h +3 all: **idle** 364 idle aboard 507 h
- redirect 72 h +0 all: **idle** 364 idle aboard 507 h
- redirect 72 h +1 all: **idle** 364 idle aboard 507 h
- redirect 72 h +2 all: **idle** 364 idle aboard 507 h
- redirect 72 h +3 all: **idle** 364 idle aboard 507 h
- redirect 120 h +0 aboard: **idle** 364 idle aboard 120 h
- redirect 120 h +0 walking: **idle** 364 idle aboard 120 h
- redirect 120 h +0 all: **idle** 364 idle aboard 507 h
- redirect 120 h +1 aboard: **idle** 364 idle aboard 120 h
- redirect 120 h +1 walking: **idle** 364 idle aboard 120 h
- redirect 120 h +1 all: **idle** 364 idle aboard 507 h
- redirect 120 h +2 aboard: **idle** 364 idle aboard 120 h
- redirect 120 h +2 walking: **idle** 364 idle aboard 120 h
- redirect 120 h +2 all: **idle** 364 idle aboard 507 h
- redirect 120 h +3 aboard: **idle** 364 idle aboard 120 h
- redirect 120 h +3 walking: **idle** 364 idle aboard 120 h
- redirect 120 h +3 all: **idle** 364 idle aboard 507 h

### 15101 cancel (base t64, divisions 270, 271)


### 15101 recall (base t64, divisions 270, 271)


### 15101 reclick (base t64, divisions 270, 271)


### 15101 redirect (base t64, divisions 270, 271)

