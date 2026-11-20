#!/bin/bash
# Critic run 88, lane C: God Mode, the editor and scenarios, History, relations (touched by style.css and RelationsPanel):
# run 85's probes on new seeds 88xxx; first as they stand (1600 x 900), then at the supported desk, 2560 x 1305 (ADR-1141;
# VW, VH read by c85_lib's launch), and the phone probes at the iPhone 16's sizes where a probe takes W H.
. /c/Git/Warism/critic/scripts/c88_r.sh
r a_god_nuke 88917
r q_god_tools 88919
r g_editor 88921
r x_editor 88443
r os2_scen critic/c26_critic_standoff.warsim-scenario c88
r fw2_forcewar 88935
r undo2 88211
r godpeace 1942 JAP 'United States'
r timeLapse 88941 400 head 2560 1305
r timeLapse 88945 400 head 393 852
r timeLapse 88945 400 head 734 343
r tlMonths 88947
r histPlace 88961 300 2560 1305
r histPlace 88961 300 393 659
r rg_relations 88929 365 2560 1305 desk '&heroes=on'
r rg_relations 88931 730 393 852 phone ''
r rg_relations 88931 730 852 393 phone ''
r saveload_page 88937 200
r x_continue 88415 40 GER 60
export VW=2560 VH=1305 TAGL=qhd_
r a_god_nuke 88927
r q_god_tools 88923
r g_editor 88925
r x_editor 88445
r fw2_forcewar 88939
r undo2 88213
r h_godtab 393 852 god-world-ai
echo done > /c/Git/Warism/critic/c88_laneC.done
