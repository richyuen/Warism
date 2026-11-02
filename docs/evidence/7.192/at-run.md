# PLAN 7.192 (diplomacy 6, critic run 26's non-blocking 1–3): the AT run

## 1. The ticker tells a war left and a revolt

`WarLeft` and `PuppetRevolt` are in `TICKER_KINDS`. They have cues: a war left the peace cue, a revolt the war cue.
- realmWars, Manchukuo's revolt on seed 5: the ticker's rows include `WarLeft` (out of the Chinese war) and
  `PuppetRevolt`. Red on 33c84306.
- e2e `bondsMenu1938`, seed 1938: playing Manchukuo, Force war on Japan; the ticker reads "Manchukuo left its war
  with …".

## 2. The standing says the bond and the shared war

A bond's standing with a nation fought beside reads both.

| case | 33c84306 | now |
|---|---|---|
| Germany and Italy, in Germany's war on Poland | "Fights beside you" | "Allied · fights beside you" |
| Manchukuo and Japan, at the 1938 start | "Fights beside you" | "Your overlord · fights beside you" |
| Japan and Manchukuo, at the 1938 start | "Fights beside you" | "Your puppet · fights beside you" |

- standing unit tests: red on 33c84306.
- e2e: Japan's menu from Manchukuo, "Force war" live.

## 3. "Propose alliance" greyed where the sim turns it down

`allyWhy` mirrors `proposeAlliance`:
- greyed for one's own overlord ("It is your overlord: you are bound to it already."; the sim now refuses a
  puppet's alliance with its overlord);
- greyed for a puppet;
- greyed for a nation in an alliance.

The unit test compares 72 pairs of 9 nations at the 1938 start with the sim's answer on a copy each. They agree on
every pair. Poland → France is greyed (France is in an alliance). The test is red on 33c84306.

In the e2e, Manchukuo → Japan is disabled, with that reason as its title.

## Runs

- Unit: 2043 of 2044. The one red was `territory.test.ts`'s per-tick timing bar under the full suite's load
  (37 ms against 25; green alone, 16 of 16; not touched).
- e2e: bondsMenu, forceWar, playerActions, touchMenu, ticker, puppets, 19 of 19.
- Seed 99's pin: unchanged.
- The new e2e cannot run on 33c84306's source: the tests import `allyWhy`. Its standing and ticker assertions are
  the ones the unit tests show red there.
