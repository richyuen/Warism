# PLAN 7.191 (R26-B1): the AT run

## Force war on a bonded partner (`tools/diag/bondExit.ts <seed> 365 30`)

Every 30 days to day 365, on a copy of the day's world:
- every living puppet that fights beside its overlord forces war on it;
- every pair of free allies that fight beside each other forces war;
- each puppet beside its overlord, with autonomy ≥ 10, has its loyalty set under the bar for the month's puppet pass.

| seed | puppet on overlord declared | ally on ally declared | refused for `Beside` | a nation beside its enemy after | revolts rising |
|---|---|---|---|---|---|
| 7019 | 463 of 467 | 436 of 442 | 0 | 0 | 378 of 467 |
| 2207 | 407 of 413 | 456 of 480 | 0 | 0 | 370 of 413 |
| 5113 | 324 of 324 | 338 of 340 | 0 | 0 | 274 of 324 |
| 9241 | 393 of 394 | 282 of 286 | 0 | 0 | 372 of 394 |

On 33c84306 the critic measured these refusals for `Beside` (`critic/c26_pz_*.json`):
- puppet on overlord: 59–78 % of puppet-days;
- ally on ally: 52–68 % of allied-pair days.

On 5113 the pairs not declared were tallied:
- 2 allies, for `Overrun`;
- 31 rebels freed with a truce with the overlord;
- 18 rebels freed with an alliance with it;
- 1 rebel freed and refused for `Beside`.

A revolt's war refused for a truce or an alliance is as before PLAN 7.189: the revolt breaks neither.

## The critic's PR cases (`critic/scripts/c26_pr.ts 7019 30 …`, the working tree)

| case | 33c84306 | now |
|---|---|---|
| Manchukuo forces war on Japan | `WarRejected`; Japan's puppet, beside it | free; `MAN v JAP+MEN+GER+ITA+AUT+ALB+POL` |
| God's revolt of Manchukuo | free, at peace with Japan, beside it in its three wars | `MAN v JAP+MEN`, its old wars left |
| Albania forces war on Italy | `WarRejected` | free; `ALB v ITA+AUT+GER+JAP+MAN+MEN+POL` |
| God's revolt of Albania | free, beside Italy | `ALB v ITA+AUT` |

## Tests

These tests were red on 33c84306 (4 failed with the change stashed):
- realmWars: Albania freed, out of the Japanese war, `WarLeft` before `WarDeclared`.
- realmWars: Germany on Italy, the alliance and the Polish war left.
- realmWars: Manchukuo's revolt rises against Japan, out of the Chinese war.
- standing: Italy from Germany reads `allied`, a bond.

Poland on France stays refused for `Beside`, with the old war on (realmWars, forceWar).

- Unit: 2042 of 2042.
- e2e: forceWar, puppets, playerActions, touchMenu, 13 of 13.
- Seed 99's pin: unchanged.
