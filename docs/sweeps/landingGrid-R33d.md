# Landing grid after R33d

ROADMAP R33a (`tools/diag/landingGrid.ts`, `tests/helpers/landingGrid.ts`): each order at 6 h, 1, 2, 3, 5 days after the
first boards, 0–3 cells off, for the one aboard, one walking, both. A case is broken when any of its divisions is;
the kinds are counted by case. `idle`: an idle spell aboard over 72 h. `wait` (a figure): the longest a division
stood at its port in a landing not sailed, ashore or aboard (R33b; none in the R33a files).

| seed | order | cases | skipped | broken | split | untold | away | mark | idle | home | longest idle aboard (h) | longest wait at port (h) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 3517 | cancel | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 120 |
| 3517 | recall | 60 | 0 | 6 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 507 |
| 3517 | reclick | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 507 |
| 3517 | redirect | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 507 |
| 15101 | cancel | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 |
| 15101 | recall | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 |
| 15101 | reclick | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 |
| 15101 | redirect | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 |
| **all** | | 480 | 0 | **6** | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 507 |

## Broken cases

### 3517 cancel (base t4, divisions 364, 365)


### 3517 recall (base t4, divisions 364, 365)

- recall 72 h +0 walking: **split** 364@186 365@608
- recall 72 h +1 walking: **split** 364@186 365@608
- recall 72 h +2 walking: **split** 364@186 365@608
- recall 120 h +0 walking: **split** 364@186 365@608
- recall 120 h +1 walking: **split** 364@186 365@608
- recall 120 h +2 walking: **split** 364@186 365@608

### 3517 reclick (base t4, divisions 364, 365)


### 3517 redirect (base t4, divisions 364, 365)


### 15101 cancel (base t64, divisions 270, 271)


### 15101 recall (base t64, divisions 270, 271)


### 15101 reclick (base t64, divisions 270, 271)


### 15101 redirect (base t64, divisions 270, 271)

