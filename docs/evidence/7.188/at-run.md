# PLAN 7.188 (diplomacy 6, critic run 24's non-blocking 1, 6, 9): the AT run

On `ac449e8d` + the rules (ADR-797).

## (9) A guarantor at war with the nation it guarantees

`npx tsx tools/diag/pledgeWars.ts <seed> 30` (the scenario's diplomacy), each day to day 30. Bar: none, on the
critic's 1517, 3739, 8821 and unseen 1511–1520 (1517 is both; 1521 stands in for it). The critic's read on HEAD:
"guarantor SOV at war with CZS" at day 30 on 3 of 3.

```
seed 1511 to day 30: guarantor at war with its own 0; SOV day 5: SOV,SIN,MON,TAN v ROM,YUG
seed 1512 to day 30: guarantor at war with its own 0; SOV day 12: SOV,SIN,MON,TAN v ROM,YUG
seed 1513 to day 30: guarantor at war with its own 0; SOV at peace
seed 1514 to day 30: guarantor at war with its own 0; SOV at peace
seed 1515 to day 30: guarantor at war with its own 0; SOV day 5: SOV,SIN,MON,TAN v ROM,YUG
seed 1516 to day 30: guarantor at war with its own 0; SOV day 26: SOV,SIN,MON,TAN v ROM,YUG,AUT
seed 1517 to day 30: guarantor at war with its own 0; SOV day 5: SOV,SIN,MON,TAN v ROM,YUG
seed 1518 to day 30: guarantor at war with its own 0; SOV at peace
seed 1519 to day 30: guarantor at war with its own 0; SOV day 12: SOV,SIN,MON,TAN v ROM,YUG
seed 1520 to day 30: guarantor at war with its own 0; SOV at peace
seed 1521 to day 30: guarantor at war with its own 0; SOV day 5: SOV,SIN,MON,TAN v ROM,YUG
seed 3739 to day 30: guarantor at war with its own 0; SOV day 12: SOV,SIN,MON,TAN v ROM,YUG
seed 8821 to day 30: guarantor at war with its own 0; SOV day 5: SOV,SIN,MON,TAN v ROM,YUG
```

Result: 0 on 13 of 13. The Soviet Union still declares on Romania (days 5–26 where it does), Czechoslovakia out.
Unit tests (`tests/unit/realmWars.test.ts`), red on `82d428c1`: Czechoslovakia stays out of the Soviet war on
Romania; a guarantor that declares on the nation it guarantees (the Soviet Union on China) is its guarantor no more.

## (1) The freed puppet on both sides

The critic's case (2207's FW2, case B) as a unit test: Japan forces war on its ally Germany; Albania, Italy's
puppet, forces war on Italy. Albania is free, at war with Italy, and out of the war with Japan; no two nations stand
on one side in one war and on two in another. Red on `82d428c1` (Albania still at war with Japan).

## (6) "Propose alliance" offered to an enemy

The nation menu shows no "Propose alliance" at war (`tests/e2e/playerActions1938.spec.ts`: at war with Lithuania,
the item's count 0; until now it was there, greyed). To an ally it stays, greyed (`forceWar1938.spec.ts`). The
Actions tab's button is greyed at war.

The default world changes: seed 99's pin dc41c283 → a7946f81. `farWait1938.test.ts` re-aimed to seed 4 (its seed
5 has no wait in days 90–210 on this history).
