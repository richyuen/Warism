# PLAN 7.190 (diplomacy 6, critic run 25's 1 and 9): pledges shown, a lapse and a war left logged — the AT run

- The panel (`tests/e2e/guarantees1938.spec.ts`, 3739 day 0): each of the 8 guarantees of the 1938 start in the
  guarantor's "Guarantees" and the target's "Guaranteed by"; red on e4386478 (no such block).
- The rows (`tests/unit/realmWars.test.ts`): the Soviet Union on China, "The Soviet Union's guarantee of China lapsed:
  they are at war", after the declaration; Republican Spain made a puppet, "Republican Spain left its war with French
  West Africa" (the war goes on). Both red on e4386478 (no such kind).
- On 1522–1531 to day 60 (`npx tsx tools/diag/pledgeRows.ts <seed> 60`): every guarantee gone with both nations alive
  has its row, 1 of 1:
```
seed 1522 to day 60: 0 guarantees gone with both alive, 0 with their row
seed 1523 to day 60: 0 guarantees gone with both alive, 0 with their row
seed 1524 to day 60: 0 guarantees gone with both alive, 0 with their row
seed 1525 to day 60: 0 guarantees gone with both alive, 0 with their row
seed 1526 to day 60: 0 guarantees gone with both alive, 0 with their row
seed 1527 to day 60: 0 guarantees gone with both alive, 0 with their row
seed 1528 to day 60: 1 guarantees gone with both alive, 1 with their row
seed 1529 to day 60: 0 guarantees gone with both alive, 0 with their row
seed 1530 to day 60: 0 guarantees gone with both alive, 0 with their row
seed 1531 to day 60: 0 guarantees gone with both alive, 0 with their row
```
