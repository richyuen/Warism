#!/bin/bash
# Critic run 91 (copy of run 90's), lane D: editorScenarios and statsHistory (touched: style.css, App.tsx, i18n): run 88's lane C editor,
# scenario, time-lapse and History probes on new seeds 90xxx, at the probes' own size, at 2560 x 1305 and on the phones.
. /c/Git/Warism/critic/scripts/c91_r.sh
r g_editor 91921
r x_editor 91443
r os2_scen critic/c26_critic_standoff.warsim-scenario c91
r timeLapse 91941 400 head 2560 1305
r timeLapse 91945 400 head 393 852
r timeLapse 91945 400 head 734 343
r tlMonths 91947
r histPlace 91961 300 2560 1305
r histPlace 91961 300 393 659
export VW=2560 VH=1305 TAGL=qhd_
r g_editor 91925
r x_editor 91445
echo done > /c/Git/Warism/critic/c91_laneD.done
