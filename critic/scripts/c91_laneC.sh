#!/bin/bash
# Critic run 91 (copy of run 90's) (copy of run 89's), lane C: God Mode (the rotation) and diplomacy and stability on the page (touched by src/sim): run 85's
# probes on new seeds 89xxx at the supported sizes (2560 x 1305 by VW, VH; the phones where a probe takes W H).
. /c/Git/Warism/critic/scripts/c91_r.sh
export VW=2560 VH=1305
r a_god_nuke 91917
r q_god_tools 91919
r undo2 91211
r fw2_forcewar 91935
r h_god
r h_godtab 393 852 god-world-ai
r h_godtab 393 659 god-world-ai
r h_godtab 852 393 god-world-ai
r peacebtn 91217 GER POL 40 5 852 393
r peacebtn 91217 GER POL 40 5 2560 1305
r manywars 91219 GER POL,CZE,FRA,ENG,SOV,BEL,HOL,DEN,NOR,SWE 393 852
r rg_relations 91929 365 2560 1305 desk '&heroes=on'
r rg_relations 91931 730 393 852 phone ''
r saveload_page 91937 200
r x_continue 91415 40 GER 60
r x_few 89403 3 3
r x_few 91403 3 3
r joinseen 91427 GER 120
r histgrep 91309 FRA 540 joined
r warsof 91309 FRA 540
unset VW VH
r a_god_nuke 91927
r q_god_tools 91923
r undo2 91213
r fw2_forcewar 91939
# The replay's starts rebuilt on HEAD's sim (c91_starts.sh) are needed by these.
until [ -f critic/c91_starts.done ]; do sleep 20; done
r godpeace 1942 JAP 'United States'
r god42 1942 91542 replay
r takescore 1942 GER 240
echo done > /c/Git/Warism/critic/c91_laneC.done
