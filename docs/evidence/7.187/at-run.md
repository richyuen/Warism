# PLAN 7.187 (R24-B1): the AT run

`npx tsx tools/diag/peaceHeld.ts <seed> random 0,30,180` on `82d428c1` + the rule (the scenario's wars end as a
white peace would: land a side holds of the other's back to its owner, in `randomDiplomacy`). A cell counts when
its controller is neither its owner nor at war with it.

Bar: 0 at days 0, 30 and 180 on the critic's 1517, 3739, 8821 and unseen 1501–1510. Without the rule, the unit
test reads 1,345 on 1517 at day 0 (Japan on China; the critic's 8821 the same, to day 900).

```
seed 1501 random day 0: held at peace 0
seed 1501 random day 30: held at peace 0
seed 1501 random day 180: held at peace 0
seed 1502 random day 0: held at peace 0
seed 1502 random day 30: held at peace 0
seed 1502 random day 180: held at peace 0
seed 1503 random day 0: held at peace 0
seed 1503 random day 30: held at peace 0
seed 1503 random day 180: held at peace 0
seed 1504 random day 0: held at peace 0
seed 1504 random day 30: held at peace 0
seed 1504 random day 180: held at peace 0
seed 1505 random day 0: held at peace 0
seed 1505 random day 30: held at peace 0
seed 1505 random day 180: held at peace 0
seed 1506 random day 0: held at peace 0
seed 1506 random day 30: held at peace 0
seed 1506 random day 180: held at peace 0
seed 1507 random day 0: held at peace 0
seed 1507 random day 30: held at peace 0
seed 1507 random day 180: held at peace 0
seed 1508 random day 0: held at peace 0
seed 1508 random day 30: held at peace 0
seed 1508 random day 180: held at peace 0
seed 1509 random day 0: held at peace 0
seed 1509 random day 30: held at peace 0
seed 1509 random day 180: held at peace 0
seed 1510 random day 0: held at peace 0
seed 1510 random day 30: held at peace 0
seed 1510 random day 180: held at peace 0
seed 1517 random day 0: held at peace 0
seed 1517 random day 30: held at peace 0
seed 1517 random day 180: held at peace 0
seed 3739 random day 0: held at peace 0
seed 3739 random day 30: held at peace 0
seed 3739 random day 180: held at peace 0
seed 8821 random day 0: held at peace 0
seed 8821 random day 30: held at peace 0
seed 8821 random day 180: held at peace 0
```

Result: 39 of 39 readings 0. The bar holds.
