#!/bin/sh
# Critic run 60: run 59's Malta 18 (c67_lland, Italy at war with Britain, 2 divisions Rome -> Valletta, 240 h) on the preview at 5367.
cd /c/Git/Warism
for s in 24105 24151 24153 24155 24157 24159 24171 24173 24175 26151 26153 26155 26157 26159 26161 26163 23105 21105; do echo $s; done |
  xargs -P ${P:-3} -I{} sh -c 'node critic/scripts/c67_lland.mjs {} ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 240 > critic/c67_lland_malta_{}.log 2>&1; echo {}'
node critic/scripts/c67_lsum.mjs critic/c67_lland_ita_malta_*.json
echo done:
