#!/bin/bash
# Critic run 79 (full), lane B: run 75's whole-brief page suite, part 1 (the editor, the title and HUD, the newest UI of
# earlier batches, landings), on new seeds 64xxx. 1938 games with heroes on (EXTRA), as from the title (ADR-1070).
. /c/Git/Warism/critic/scripts/c79_r.sh
export EXTRA='&heroes=on'
rp() { EXTRA_SAVE=$EXTRA; export EXTRA=; r "$@"; export EXTRA=$EXTRA_SAVE; }
M="1095.5,344.5 1106.5,383.5"; J="1818.5,385.5 1715.5,413.5"
rp x_editor 64443
MAINSTART=1 TAGL=main_ rp x_editor 64441
echo "== badfiles"; BASE=$BASE sh critic/scripts/c79_x_badfiles.sh > critic/c79_x_badfiles.log 2>&1; echo "   exit $?"
for wh in "844 390" "390 844" "932 430" "1024 500" "667 375"; do rp x_closeblock 64103 $wh; done
r h_interv 1600 900
r h_interv 390 844
r x_keys 64423
r x_continue 64415 40 GER 60
r h_continue 400 120
r x_buildpause 1600 900 1
rp h_next 1030 96 greece
r h_pauseblank
r h_god
r h_seed
r nvpage 64211 ITA ENG $M 12 360
r nvpage 64213 JAP CHI 1808.9,389.5 1715.0,413.7 10 480
r whotold 64215 ITA ENG $M 6 300
r peacebtn 64217 GER POL 40 5 844 390
r peacebtn 64217 GER POL 40 5 1600 900
r manywars 64219 GER POL,CZE,FRA,ENG,SOV,BEL,HOL,DEN,NOR,SWE 390 844
SHOTAT=30,36,48 r turnback 64901 JAP CHI $J 3 jap_cancel3 26 60
SHOTAT=40,60,90 r lhold 64905 ITA ENG $M 2 ita_malta 200
r lland 64903 GER ENG 1100.5,267.5 1031.5,266.5 3 ger_norwich3 240
r lland 64907 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
STEP=2 r lland 64909 JAP CHI $J 3 jap_sh3 200
r lbar 64221 JAP CHI $J 3 jap_sh3_phone 390 844 12
r lbox 64223 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4 844 390 5
r new mine 64303 1600 900 GER 365
r new mine 64303 390 844 GER 365
r new filter 64305 1600 900
r new filter 64305 390 844
r new corridor 64307 1600 900
CORRM=3000 TAGL=m3000_ r new corridor 64307 390 844
r new build 64301 390 844
r new build 64301 844 390
r rg_relations 64929 365 1600 900 desk '&heroes=on'
r rg_relations 64939 365 1600 900 desk ''
r rg_relations 64931 730 390 844 phone '&diplo=random'
r x_mouse 64421 10 1600 900
r x_title
r x_few 64403 3 3
r x_play rnd_large random large 90
r rw_random 64965 365
r joinseen 64427 GER 120
r h_zoom
r h_blank 120
r x_building b1938 1600 900 '/?scenario=1938&seed=64601' 20
r x_building b1938h 1600 900 '/?scenario=1938h&seed=1938' 20
r x_building b1975 390 844 '/?scenario=1938h&seed=1938&year=1975&mode=free&after=6161' 20
r h_godtab 390 844 god-world-ai
r x_lateworld 1975 free 1977 91 1600 900 6161
r x_lateworld 1965 replay 1977 91 1600 900 4242
r x_stage normandyD 1944 1944-06-05 1020.6 291.6 50
r x_stage stalin 1942 1942-10-22 1277.2 296 12
r x_replaycard 1975 free 390 844
r histgrep 64309 FRA 540 joined
r warsof 64309 FRA 540
r saveload_page 64937 200
echo done > critic/c79_laneB.done
