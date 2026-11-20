# Critic run 90: corrections to critic/CRITIC_REPORT.md after the advisor's read (run once).
import io
p = 'C:/Git/Warism/critic/CRITIC_REPORT.md'
s = io.open(p, encoding='utf-8', newline='').read()
rep = [
 ('# Critic report, run 90 (focused): Batch 57 (R210 to R218), on `fc767d88`',
  '# Critic report, run 90 (focused): R210 to R218 (Batches 56 and 57), on `fc767d88`'),
 ('''     38 seeds of two and three nations, ten years each: of the 33 wars that came after a day the line gave reasons, 16
     came within 30 days of that day, on 11 seeds (`critic/c90_peaceTruth_wars.txt`: seed, war day, days since the last
     reason; e.g. 90414 and 90446 one day, 90438 two, 90434 four, 89401 seven, 90441 eight). Ten of the 16 had "bound"
     (a truce) among the reasons; three "no rival within its reach" for every nation (90415, 90416, 90441).''',
  '''     24 seeds of two and three nations, ten years each (`bash critic/scripts/c90_peaceWars.sh`; the first 14 seeds I ran
     predate the script's last-reason field and are left out of this count): of the 33 wars that came after a day the
     line gave reasons, 16 came within 30 days of that day, on 11 seeds (`critic/c90_peaceTruth_wars.txt`: seed, war
     day, days since the last reason; e.g. 90414 and 90446 one day, 90438 two, 90434 four, 89401 seven, 90441 eight).
     Ten of the 16 had "bound" (a truce) among the reasons; three "no rival within its reach" for every nation (90415,
     90416, 90441). Traced: 89401 (a truce's end) and 90441 (a lift on order); the other 14 not traced (90416 and 90433
     gave `noLift` 18 to 22 days before their war, cause not read).
   - **SPEC §2 (R216's line) says** each realm's reason is given "by the strategic AI's terms at its most restless;
     'for now' when one may yet declare". A realm whose truce ends in two days, or whose transports are being built,
     may yet declare: by SPEC's own words the line should say "for now" in both traced cases.'''),
 ('''   - **Fix:** a realm whose best target is held off only by a truce that ends, or by a lift on order (`landlessPowers`,
     transports building), gives no reason ("for now"), in every branch, not only `noLift`; or the line says the truce's
     days left and names that rival. **Seen fixed when:** the five cases above show "for now" or the coming war's rival
     on every day before it, and `c90_peaceTruth.ts` on those seeds lists no war within 30 days of a day with reasons
     (today 16 of 33).''',
  '''   - **Fix:** a realm whose best target is held off only by a truce that ends, or by a lift on order (`landlessPowers`,
     transports building), gives no reason ("for now"), in every branch, not only `noLift`; or the line says the truce's
     days left and names that rival. **Seen fixed when:** `node critic/scripts/c90_peaceWeek.mjs 90441 2 88 98` and
     `... 89401 3 1595 1604` show "for now" (or the coming war's rival) on every day before the war; and on the same 24
     seeds (`c90_peaceTruth.ts 3 89401 4 10`, `3 90411 6 10`, `3 90431 8 10`, `2 90441 6 10`, then `c90_peaceWars.sh`)
     no war comes within 30 days of a day whose reasons were a truce or "no rival within its reach". The other causes
     (the 14 untraced, `noLift` among them) are to be traced by the builder; a war that a reason cannot foresee (a
     revolt, a new nation) is no defect.'''),
 ('''- **What earns 8 back:** R90-B1's cases (below) read true: `npx tsx critic/scripts/c90_peaceTruth.ts 3 89401 4 10`,
  `... 3 90411 6 10`, `... 3 90431 8 10` and `... 2 90441 6 10` show no war within 30 days of a day the line gave
  reasons;''',
  '''- **What earns 8 back:** R90-B1's "seen fixed when" (below): the two traced cases read true on the page, and on the 24
  seeds no war within 30 days of a truce or "no rival within its reach" reason;'''),
 ('and `node critic/scripts/c90_peaceWeek.mjs 89401 3 1595 1604` and `... 90441 2 88 98` show the line naming the war that\n  comes (or "for now") on every day before it.', ''),
 ('`c77_firstdecl` on five seeds: 71 first declarations, 0 over 6,000 km.', '`c77_firstdecl` on ten seeds: 71 first declarations in 60 days, 0 over 6,000 km.'),
 ('''`c77_massTold` on three seeds: told 52, a war after 45, given up 7, one war "after a massing never told"
  a day old (`critic/c90_massTold.log`).''', '''`c77_massTold` on three seeds: told 52, a war after 45, given up 7; 29 wars "after a massing never told"
  (run 89 on its seeds: 29 by the same count; `critic/c90_massTold.log`).'''),
 ('Run 88\'s lane E (34 cases) re-run, exit 0 (`critic/c90_laneE.out`).', 'Run 88\'s lane E re-run (25 lines of `critic/scripts/c90_laneE.sh`, some loops), every case exit 0 (`critic/c90_laneE.out`).'),
 ('''    worlds, 0 samples with the line during a war, 0 at peace without it. Opened and shut by a click or a tap; 0 boxes
    over it opened or shut, 0 cut, nothing out of the view, no sideways scroll at''', '''    worlds, 0 samples with the line during a war, 0 at peace without it. Opened and shut by a click or a tap; with the
    legend and the ranking folded and no panel or God toolbar open (the opened states not tried), 0 boxes over it
    opened or shut, 0 cut, nothing out of the view, no sideways scroll at'''),
 ('a world read every day ends at the same hash as one never read, on 38 seeds of two and three nations, ten years each',
  'a world read every day ends at the same hash as one never read, on 38 seeds of two and three nations, ten years each'),
 ('''  plain 1.972 ms on HEAD against 1.934 ms (+2 %), heroes 1.849 against 1.759 (+5 %) (`critic/c90_tickab_*.log`).''',
  '''  plain 1.972 ms on HEAD against 1.934 ms (+2 %), heroes 1.849 against 1.759 (+5 %) (`critic/c90_tickab_*.log`); one
  pair each, not swapped (HEAD on cores 0xFF00, the old on 0x00FF), in worlds that differ.'''),
 ('''slower; the rest of the 13 % was not read.''', '''slower (one unswapped pair); the rest of the 13 % was not read.'''),
 ('''- **Not 9:** four of six new two-nation worlds keep the peace ten years (ADR-1069, ADR-1129; now told by the line).''',
  '''- **The late world:** HEAD's 7019 year-20 save had no formation engaged at load, but its last six years flip more land
  than run 89's (cells flipped, years 15 to 20: 8,995, 19,655, 44,200, 38,907, 38,644, 57,413; run 89: 7,295 to 20,781);
  32019 ends quieter (2,775 and 303 in years 19 and 20; run 89: 25,695 and 27,577) (`critic/c90_seed*_save.log`,
  `critic/c89_seed*_save.log`). Two worlds, one each way: not a trend.
- **Not 9:** four of six new two-nation worlds keep the peace ten years (ADR-1069, ADR-1129; now told by the line).'''),
 ('''  - A real background tab (as run 89).''', '''  - A real background tab (as run 89).
  - The peace line with the legend or ranking open, a panel open or the God toolbar shown (R216's audit ran with all
    folded); God Mode's edits while paused against the line's once-a-day cache (`peaceOf`'s key).'''),
]
for a, b in rep:
    if a not in s:
        print('MISSING:', a[:80])
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8', newline='').write(s)
