# Critic run 29: fills the report's last placeholders with the tail's figures.
p = 'critic/CRITIC_REPORT.md'
s = open(p, encoding='utf-8').read()
rep = {
 'AL_RESULT': '**Unchanged** (identical to run 28): every pair, 4 of 10,148 live buttons refused at day 30 (Poland, Switzerland, Belgium, Luxembourg > Spanish Republic), 1 of 10,178 at day 120 (Portugal > Brazil); none greyed but acceptable.',
 'HL8209': '8209 232 war-years (194), 35 bursts (19), 118 revolts (120), 5 risings (0), 97 → 75 living',
 'LW_RESULT': 'Heroes off: **59.9–60 fps every year, longest frame gap 83 ms, none over 500 ms, no page error** (run 28: 59.8–60, 83 ms); another world (the sim changed): 70 nations at year 10 as run 28. Heroes on, same seed: 59.8–60 fps, 83 ms, no error. And 4111 off / on: 59.9 / 59.8 fps lowest, 83 ms, no error.',
 'PF_RESULT': '**Not measured**: HEAD\'s 7019 year-20 world has no formation engaged at the saved hour, so the probe finds no fight to frame (`fatal` in the JSON). Not compared.',
 'LW_PERF': 'Four ten-year page watches (6151 and 4111, heroes off and on): 59.8–60 fps every year, longest frame gap 83 ms, none over 500 ms; heroes on cost nothing measurable. PF not measured this run (no fight in HEAD\'s 7019 year-20 save).',
 'AL_N': 'live "Propose alliance" refused by the sim (AL identical).',
}
for k, v in rep.items():
    assert k in s, k
    s = s.replace(k, v)
open(p, 'w', encoding='utf-8', newline='').write(s)
import re
print(re.findall(r'[A-Z]{2,}_[A-Z]{2,}', s)[:10])
