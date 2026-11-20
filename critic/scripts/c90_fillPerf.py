# Critic run 90: fills the performance section and the late figures into critic/CRITIC_REPORT.md (run once).
import io
p = 'C:/Git/Warism/critic/CRITIC_REPORT.md'
s = io.open(p, encoding='utf-8', newline='').read()
perf = '''- **The run:** `sh critic/scripts/c90_chainPerf.sh`, from 09:46:38 to 10:04:28, with no other job of mine running (the
  bulk set stopped, every lane done; only the preview server). Every stage exits 0 (`critic/c90_pf.status`). Then
  `c90_perf2.sh` and `c90_perfAB.sh`, alone, below. (`CRITIC_PROMPT.md` changed during this run, `97d493a1`, ADR-1147:
  `performance` afresh only by the rotation; with every other dimension touched, the rotation would have chosen it.)
- **The tick of seed 99 over five years:** plain 1.886 ms mean, hash `242be86c` (`critic/c90_tick99.log`; run 89: 1.834
  ms, `ca4700f1`). With heroes 1.786 ms, `95b922e2` (`critic/c90_tick99h.log`; run 89: 1.628 ms, `494ed033`). The worlds
  differ (R217, R218). **Both commits at the same time on separate cores** (`c90_perfAB.sh`, a worktree at `f27f48f5`):
  plain 1.972 ms on HEAD against 1.934 ms (+2 %), heroes 1.849 against 1.759 (+5 %) (`critic/c90_tickab_*.log`).
- **Frames at 2560 × 1305 at 7019's year-20 battle spot, 3,000 to 30 m/px in both looks** (`node critic/scripts/c86_pfsum.mjs`):

  | World | Least mean fps | Highest p95 | Worst frame | Run 89 |
  |---|---|---|---|---|
  | Plain, HEAD's own year-20 save | no formation engaged at load: the probe finds no battle spot (`critic/c90_pf_lookfps_w.log`) | | | 59.7, 18.1, 122 |
  | Plain, run 89's year-20 save loaded on HEAD | 59.7 | 18.0 ms | 123 ms | the same save: 59.7, 18.1, 122 |
  | With heroes (run 79's save) | **56.8 to 57.0** (four runs) | 18.3 ms | 116 to 126 ms | 59.7, 18.2, 117 |

  - **The heroes arm, both builds alone one after the other, swapped** (`critic/c90_pfab_*.log`): at 1,200 m/px in the
    classic look the second 4-second sample is 51.5 to 52.1 fps in 4 of 4 runs on HEAD (the chain's two included:
    `critic/c90_pf_lookfps_wh.log`, `critic/c90_pf_lookfps_wh2.log`); on `f27f48f5` 60.1 to 60.2 in 2 of 2, its least
    sample 58.9 at that tier. The worst frame is the same on both (116 to 129 ms). R90-N3.
- **`lookFps 7019`** on HEAD's year-20 save: forced 58.5 to 60 frames/s at every tier, a draw of 0.9 to 3.4 ms
  (`critic/c90_lookfps.log`; run 89: least 58.8).
- **The individual tier, `x_indfps 64111`:** 59.6 to 60 fps, p95 16.8 ms, up to 10,854 individuals drawn (`critic/c90_xi.log`).
- **Touch (`tm_touch`):** 59.5 fps with 235 ticks/s and nothing selected (`critic/c90_tm_touch.alone.log`; run 89: 59.6
  and 271). Ticks a second are the sim's at Max speed in a world R217 changed; the tick pairs above put HEAD 2 to 5 %
  slower; the rest of the 13 % was not read.
- **A 12-year watch on the page alone at 2560 × 1305** (`long_watch2 90945`, heroes on): 59.8 to 60 fps each year, the
  longest gap between frames 83 ms, `ok []` (`critic/c90_lw_90945_alone.log`). The plain watch under this run's load
  (90943): 59.7 to 59.9.
- **Run 79's 7019 year-20 save** loads and runs a year at 1.886 ms a tick, ending at `916c1563` (runs 81 to 89:
  `07e768a6`; the sim moved). **The time-lapse of 20 years** plays with `errors` [] (`critic/c90_tm_lapse20.log`).
- **Why still 8:** one 4-second sample at 52 fps at one tier of one battle, the worst frame unchanged, every other tier
  and the watches at 59.5 to 60: a regression to fix (R90-N3), not one a player leaves over.
- **Not 9:** the worst single frame at the battle spot is still 116 to 129 ms; R90-N3.'''
s = s.replace('PERF_PENDING', perf)
s = s.replace('''2. **R90-N2 (stats and history)''', '''2. **R90-N3 (performance): with heroes, at 7019's year-20 battle at 1,200 m/px in the classic look, one 4-second sample
   drops to 51.5 to 52.1 fps on HEAD in 4 of 4 runs, against 60.1 on `f27f48f5` beside it** (`critic/c90_pfab_*.log`,
   `sh critic/scripts/c90_perfAB.sh`). The tier's mean 56.8 to 57 (run 89: 59.7). What costs the frames was not read
   (R217's pass over the formations in the worker, or R214's change to the map's shader). **Seen fixed when:** the heroes
   arm (`TAG=x VW=2560 VH=1305 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c79_hseed7019_y20.bin`) has no sample
   under 58.5 fps in two runs.
3. **R90-N2 (stats and history)''')
s = s.replace('3. **Kept:** the heroes\' tags\' jumps', '4. **Kept:** the heroes\' tags\' jumps')
s = s.replace('| Bulk landing sets | 717 runs, as before R209 |', '| Performance chain | tick 1.834 ms `ca4700f1`; 59.7 fps at 2560 × 1305 (plain and heroes) | tick 1.886 ms `242be86c`; plain 59.7 on run 89\'s save; heroes 56.8 to 57 (R90-N3; both builds beside each other) | `critic/c90_pf.status`, `critic/c90_pfab_*.log` |\n| Bulk landing sets | 717 runs, as before R209 |')
s = s.replace('- **At the end:** the preview server on 5451, every browser and every job I started were stopped; no listener is left.', '''- **At the end:** the preview servers on 5451 and 5452 (run 89's build, `critic/c90_olddist`), every browser and every
  job I started were stopped; the worktree `critic/wt` was removed after its `node_modules` link was unlinked; no
  listener is left. My probe `os2_scen` rewrote `critic/c85_critic_standoff.warsim-scenario` (592,870 to 592,012 bytes);
  the critic's guard blocks restoring it with git, so it stands modified in the tree for the builder to restore.''')
s = s.replace('''  - Run 89's old build was not built beside HEAD: no score moves on a case that both builds can run (the one score that
    moves, `diplomacyWarDepth`, moves on R216's peace line, which `f27f48f5` does not have).''', '''  - Run 89's build was run beside HEAD only for the frames and the tick (their figures differ); no score moves on a case
    both builds can run (the one that moves, `diplomacyWarDepth`, moves on R216's peace line, which `f27f48f5` lacks).''')
s = s.replace('- **Time:** 08:34 to about 10:25 by the machine\'s clock.', '- **Time:** 08:34 to about 10:35 by the machine\'s clock.')
io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('PERF_PENDING' in s, s.count('R90-N3'))
