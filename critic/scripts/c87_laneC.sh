#!/bin/bash
# Critic run 87: God Mode, the editor and scenarios, History and the time-lapse (touched by App.tsx and style.css), and
# stability (rotation): run 85's probes on new seeds 87xxx, and the page-error monkeys at four sizes.
. /c/Git/Warism/critic/scripts/c87_r.sh
r a_god_nuke 87917
r q_god_tools 87919
r g_editor 87921
r x_editor 87443
r os2_scen critic/c26_critic_standoff.warsim-scenario c87
r fw2_forcewar 87935
r undo2 87211
r godpeace 1942 JAP 'United States'
r timeLapse 87941 400 head
r timeLapse 87945 400 head 390 844
r tlMonths 87947
r histPlace 87961 300
echo done > /c/Git/Warism/critic/c87_laneC.done
