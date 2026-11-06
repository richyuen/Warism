#!/bin/sh
# Critic run 41: run 40's page cases of R40-B1/B2 by real click on HEAD.
cd /c/Git/Warism
r() { tag=$1; shift; echo "== $tag $* $(date +%T)"; timeout 3600 "$@" > critic/c44_$tag.log 2>&1; echo "   exit $?"; }
r mk2_freshfirst node critic/scripts/c44_mk2_steal.mjs 3517 60 freshfirst &
r mk2_freshfirst_14003 node critic/scripts/c44_mk2_steal.mjs 14003 60 freshfirst_14003 &
r mk2_freshfirst_14011 node critic/scripts/c44_mk2_steal.mjs 14011 60 freshfirst_14011 &
wait
r mk2_nofresh2 env MODE=nofresh node critic/scripts/c44_mk2_steal.mjs 3517 60 nofresh2 &
r mk2_leaversfirst env MODE=leaversfirst node critic/scripts/c44_mk2_steal.mjs 3517 60 leaversfirst &
r lwt5_four_allsw63 env NPX=-63 NPY=63 node critic/scripts/c44_lwt5.mjs 3517 4 60 24 allnear 1600 900 four_allsw63 &
wait
r mk_mixed_s2 node critic/scripts/c44_mk_mark.mjs 3517 mixed 0 2 40 1600 900 mixed_s2 &
r tm_touch node critic/scripts/c44_tm_touch.mjs &
r hs_desk node critic/scripts/c44_hs_hintsel.mjs 3517 1600 900 desk &
wait

# Run 42 extras
r mk2_recall4 env RECALL=4 node critic/scripts/c44_mk2_steal.mjs 3517 60 recall4 &
r mk4_eng7019_p270 env PICK=270,271 node critic/scripts/c44_mk4_eng.mjs 7019 30 eng7019_p270 &
r mk4_eng15101_sep env PICK=270,271 SEPARATE=1 node critic/scripts/c44_mk4_eng.mjs 15101 30 eng15101_sep &
wait
echo SUITEMK2DONE
# Run 43: run 42's remaining page cases (R42-N1, R42-N3, R41-B1 by click on 15101)
r mk4_eng15101_p270 env PICK=270,271 node critic/scripts/c44_mk4_eng.mjs 15101 30 eng15101_p270 &
r pn_eng15101 node critic/scripts/c44_pn_panel.mjs 15101 20 eng15101 &
r fs_eng15101 node critic/scripts/c44_fs_strand.mjs 15101 12 eng15101 &
wait
echo SUITEMK3DONE
