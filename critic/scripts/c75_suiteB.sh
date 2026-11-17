#!/bin/sh
# Critic run 72 (full): the whole-brief page suite (run 67-70's suite, suite2 and suiteB) on new seeds 55xxx, one at a
# time, at 5377, the 1938 games opened with heroes on (EXTRA, as a game from the title has them, ADR-1070).
cd /c/Git/Warism
until grep -q PAGESADONE critic/c75_pagesA.log 2>/dev/null; do sleep 20; done
export BASE=http://127.0.0.1:5377
export EXTRA='&heroes=on'
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3000 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,?:' '_______' | cut -c1-80).log 2>&1; echo "   exit $?"; }
rp() { EXTRA_SAVE=$EXTRA; export EXTRA=; r "$@"; export EXTRA=$EXTRA_SAVE; }
M="1095.5,344.5 1106.5,383.5"; J="1818.5,385.5 1715.5,413.5"
rp c75_x_editor 32443
MAINSTART=1 rp c75_x_editor 32441
echo "== badfiles"; sh critic/scripts/c75_x_badfiles.sh > critic/c75_x_badfiles.log 2>&1
for wh in "844 390" "390 844" "932 430" "1024 500" "667 375"; do rp c75_x_closeblock 21103 $wh; done
r c75_h_interv 1600 900
r c75_h_interv 390 844
r c75_x_keys 55423
r c75_x_continue 55415 40 GER 60
r c75_h_continue 400 120
r c75_x_buildpause 1600 900 1
rp c75_h_next 1030 96 greece
r c75_h_pauseblank
r c75_h_god
r c75_h_seed
# The batch's newest UI (R58b-d) on new seeds
r c75_nvpage 55211 ITA ENG $M 12 360
r c75_nvpage 55213 JAP CHI 1808.9,389.5 1715.0,413.7 10 480
r c75_whotold 55215 ITA ENG $M 6 300
r c75_peacebtn 55217 GER POL 40 5 844 390
r c75_peacebtn 55217 GER POL 40 5 1600 900
r c75_manywars 55219 GER POL,CZE,FRA,ENG,SOV,BEL,HOL,DEN,NOR,SWE 390 844
# Landings, new seeds
SHOTAT=30,36,48 r c75_turnback 55901 JAP CHI $J 3 jap_cancel3 26 60
SHOTAT=40,60,90 r c75_lhold 55905 ITA ENG $M 2 ita_malta 200
r c75_lland 55903 GER ENG 1100.5,267.5 1031.5,266.5 3 ger_norwich3 240
r c75_lland 55907 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3 240
STEP=2 r c75_lland 55909 JAP CHI $J 3 jap_sh3 200
r c75_lbar 55221 JAP CHI $J 3 jap_sh3_phone 390 844 12
r c75_lbox 55223 ENG GER 1023.5,275.5 1072.5,259.5 4 eng_br4 844 390 5
# Earlier batches' UI
r c75_new mine 55303 1600 900 GER 365
r c75_new mine 55303 390 844 GER 365
r c75_new filter 55305 1600 900
r c75_new filter 55305 390 844
r c75_new corridor 55307 1600 900
CORRM=3000 r c75_new corridor 55307 390 844
r c75_new build 55301 390 844
r c75_new build 55301 844 390
r c75_rg_relations 55929 365 1600 900 desk '&heroes=on'
r c75_rg_relations 55939 365 1600 900 desk ''
r c75_rg_relations 55931 730 390 844 phone '&diplo=random'
r c75_os2_scen critic/c26_critic_standoff.warsim-scenario c70
rp c75_sb_seaballs 20885 107 1188.17 328.5
r c75_k_breakthrough 55979
r c75_kwhist 55951
rp c75_c_battle 7781
r c75_c_battle 55915
r c75_z_zoom 55911
r c75_seaclick 55913
r c75_a_god_nuke 55917
r c75_q_god_tools 55919
r c75_g_editor 55921
r c75_kw_breakthrough 55923
r c75_pl_planes 55925 GER POL 5377
r c75_w_wing 55927
r c75_p_phone
r c75_u_ui
r c75_phz 55933 40
r c75_fw2_forcewar 55935
r c75_saveload_page 55937 200
r c75_rw_random 55965 365
r c75_histgrep 55309 FRA 540 joined
r c75_warsof 55309 FRA 540
echo SUITEBDONE
until grep -q '^done:' critic/c75_seed7019_save.log 2>/dev/null && grep -q '^done:' critic/c75_seed32019_save.log 2>/dev/null; do sleep 20; done
rp c75_an_ainuke 7019 critic/c75_seed7019_y20.bin 7019y20 2 400
rp c75_an_ainuke 32019 critic/c75_seed32019_y20.bin 32019y20 2 400
r c75_long_watch2 55941 12 '&heroes=on' hon
export EXTRA=; r c75_long_watch2 55943 12 '' plain; export EXTRA='&heroes=on'

# Run 61's own x probes on new seeds
r c75_x_mouse 55421 10 1600 900
r c75_x_keys 55423
r c75_x_continue 55415 40 GER 60
r c75_x_title
r c75_x_few 55403 3 3
r c75_x_play rnd_large random large 90
r c75_hero 55425 300 hon
r c75_joinseen 55427 GER 120
until grep -q '^done:' critic/c75_seed55505_save.log 2>/dev/null; do sleep 20; done
rp c75_an_ainuke 55505 critic/c75_seed55505_y13.bin 55505y13 2 400
until [ -s critic/c75_sb_55061.json ] && grep -q . critic/c75_sb_55061.log; do sleep 20; done
echo "== sbl 55061"; BASE=http://127.0.0.1:5377 npx tsx tools/diag/seaBattlesLook.ts critic/c75_sb_55061.json --out critic/c75_sbl_55061.json > critic/c75_sbl_55061.log 2>&1; echo "  exit $?"
echo SUITEB2DONE
# Run 66's left-outs, owed in a full run, and the batch's own cases (R76d, R77: Normandy's 50-day window, Stalingrad's
# arrivals; R76b free card at phone size).
r c75_h_zoom
r c75_h_blank 120
r c75_x_building b1938 1600 900 '/?scenario=1938&seed=55601' 20
r c75_x_building b1938h 1600 900 '/?scenario=1938h&seed=1938' 20
r c75_x_building b1975 390 844 '/?scenario=1938h&seed=1938&year=1975&mode=free&after=6161' 20
r c75_h_godtab 390 844 god-world-ai
r c75_x_lateworld 1975 free 1977 91 1600 900 6161
r c75_x_lateworld 1965 replay 1977 91 1600 900 4242
r c75_x_stage normandyD 1944 1944-06-05 1020.6 291.6 50
r c75_x_stage stalin 1942 1942-10-22 1277.2 296 12
r c75_x_replaycard 1975 free 390 844
r c75_long_watch2 55945 12 '' plain2
echo SUITEB3DONE
until grep -q '^done:' critic/c75_hero_7019_20.log 2>/dev/null; do sleep 20; done
rp c75_hist 32019 critic/c75_seed32019_y20.bin
rp c75_dl_export 32019 critic/c75_seed32019_y20.bin
r c75_hist 7019 critic/c75_hseed7019_y20.bin
r c75_an_ainuke 7019 critic/c75_hseed7019_y20.bin h7019y20 2 400
r c75_hero 55425 2000 hon2000
r c75_hero 55427 300 hphone 390 844
echo SUITEB4DONE
