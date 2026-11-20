#!/bin/bash
# Critic run 90, lane D: editorScenarios and statsHistory (touched: style.css, App.tsx, i18n): run 88's lane C editor,
# scenario, time-lapse and History probes on new seeds 90xxx, at the probes' own size, at 2560 x 1305 and on the phones.
. /c/Git/Warism/critic/scripts/c90_r.sh
r g_editor 90921
r x_editor 90443
r os2_scen critic/c26_critic_standoff.warsim-scenario c90
r timeLapse 90941 400 head 2560 1305
r timeLapse 90945 400 head 393 852
r timeLapse 90945 400 head 734 343
r tlMonths 90947
r histPlace 90961 300 2560 1305
r histPlace 90961 300 393 659
export VW=2560 VH=1305 TAGL=qhd_
r g_editor 90925
r x_editor 90445
echo done > /c/Git/Warism/critic/c90_laneD.done
