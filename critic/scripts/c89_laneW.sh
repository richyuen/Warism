#!/bin/bash
# Critic run 89, lane W: emergentDynamics on the page (touched by src/sim): a 12-year plain watch on a new seed and a
# 12-year watch with heroes at 393 x 852.
. /c/Git/Warism/critic/scripts/c89_r.sh
export EXTRA=
VW=2560 VH=1305 TO=3600 r long_watch2 89943 12 '' plain
echo done > /c/Git/Warism/critic/c89_laneW.done
