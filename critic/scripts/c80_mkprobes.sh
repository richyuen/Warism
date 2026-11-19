#!/bin/sh
# Critic run 80: copy the newest version of each page probe to c80_<name>.mjs, with its output prefixes (c75..c78) and its
# library import renamed c80, so this run's outputs do not overwrite run 78's (the comparison baseline). Inputs named
# c76_/c71_/c6_ are left as they are. c80_lib.mjs defaults to HEAD's build on 5401.
cd /c/Git/Warism/critic/scripts
sed 's/c78_lib/c80_lib/; s/5397/5401/' c78_lib.mjs > c80_lib.mjs
for n in x_editor x_closeblock h_interv x_keys x_continue h_continue x_buildpause h_next h_pauseblank h_god h_seed \
  nvpage whotold peacebtn manywars turnback lhold lland lbar lbox new rg_relations os2_scen sb_seaballs k_breakthrough \
  kwhist c_battle z_zoom seaclick a_god_nuke q_god_tools g_editor kw_breakthrough pl_planes w_wing p_phone u_ui phz \
  fw2_forcewar saveload_page rw_random histgrep warsof an_ainuke long_watch2 x_mouse x_title x_few x_play hero joinseen \
  h_zoom h_blank x_building h_godtab x_lateworld x_stage x_replaycard hist dl_export monkey resize look markerPop heroPop \
  markers bannerRank bannerFlip tlDead timeLapse dirHand trackRows pf_lookfps tm_touch x_indfps tlMore tlMonths histPlace \
  phoneTicker bannerHourly bannerLoad heropanel takescore godpeace god42 undo2 undo2y deathTitle bannerOwn massSeen; do
  f=$(ls c[0-9]*_$n.mjs 2>/dev/null | grep -v '^c80_' | sort -V | tail -1)
  [ -z "$f" ] && { echo "missing $n"; continue; }
  sed 's/c7[5-8]/c80/g' "$f" > "c80_$n.mjs"
  echo "$n <- $f"
done
f=$(ls c[0-9]*_x_badfiles.sh | grep -v '^c80_' | sort -V | tail -1); sed 's/c7[5-8]/c80/g' "$f" > c80_x_badfiles.sh; echo "x_badfiles <- $f"
