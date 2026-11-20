#!/bin/bash
# Critic run 89, lane C: God Mode (the rotation) and diplomacy and stability on the page (touched by src/sim): run 85's
# probes on new seeds 89xxx at the supported sizes (2560 x 1305 by VW, VH; the phones where a probe takes W H).
. /c/Git/Warism/critic/scripts/c89_r.sh
export VW=2560 VH=1305
r a_god_nuke 89917
r q_god_tools 89919
r undo2 89211
r fw2_forcewar 89935
r h_god
r h_godtab 393 852 god-world-ai
r h_godtab 393 659 god-world-ai
r h_godtab 852 393 god-world-ai
r peacebtn 89217 GER POL 40 5 852 393
r peacebtn 89217 GER POL 40 5 2560 1305
r manywars 89219 GER POL,CZE,FRA,ENG,SOV,BEL,HOL,DEN,NOR,SWE 393 852
r rg_relations 89929 365 2560 1305 desk '&heroes=on'
r rg_relations 89931 730 393 852 phone ''
r saveload_page 89937 200
r x_continue 89415 40 GER 60
r x_few 89403 3 3
r joinseen 89427 GER 120
r histgrep 89309 FRA 540 joined
r warsof 89309 FRA 540
unset VW VH
r a_god_nuke 89927
r q_god_tools 89923
r undo2 89213
r fw2_forcewar 89939
# The replay's starts rebuilt on HEAD's sim (c89_starts.sh) are needed by these.
until [ -f critic/c89_starts.done ]; do sleep 20; done
r godpeace 1942 JAP 'United States'
r god42 1942 89542 replay
r takescore 1942 GER 240
echo done > /c/Git/Warism/critic/c89_laneC.done
