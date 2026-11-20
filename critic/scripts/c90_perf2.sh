#!/bin/sh
# Critic run 90: after the chain. HEAD's own 7019 year-20 save has no formation engaged at load (c85_pf_lookfps's plain
# arm found no battle spot), so the plain arm at 2560 x 1305 is run on run 89's 7019 year-20 save loaded on HEAD (the
# world before R217); and the heroes arm again (one sample of 52.1 fps in the chain's run). Alone, on 5451.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5451
TAG=_c90w89 VW=2560 VH=1305 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c89_seed7019_y20.bin > critic/c90_pf_lookfps_w89save.log 2>&1; echo "pf plain (run 89's save) $?"
TAG=_c90wh2 VW=2560 VH=1305 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c79_hseed7019_y20.bin > critic/c90_pf_lookfps_wh2.log 2>&1; echo "pf heroes again $?"
