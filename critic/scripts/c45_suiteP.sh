#!/bin/sh
# Critic run 45: run 44's page cases of R44-B1/B2, R43, MK and RC on HEAD (production build on 127.0.0.1:5299), three at a time.
cd /c/Git/Warism
r() { tag=$1; shift; echo "== $tag $* $(date +%T)"; timeout 3600 "$@" > critic/c45_$tag.log 2>&1; echo "   exit $? $tag $(date +%T)"; }
r se_water2 env MODE=water2 node critic/scripts/c45_se_seaedit.mjs 3517 50 water2 &
r se_water env MODE=water node critic/scripts/c45_se_seaedit.mjs 3517 50 water &
r se_tsing env MODE=tsing node critic/scripts/c45_se_seaedit.mjs 3517 50 tsing &
wait
r sp_four node critic/scripts/c45_sp_split.mjs 3517 60 four &
r se_home env MODE=home node critic/scripts/c45_se_seaedit.mjs 3517 50 home &
r se_both env MODE=both node critic/scripts/c45_se_seaedit.mjs 3517 50 both &
wait
r se_one env MODE=one node critic/scripts/c45_se_seaedit.mjs 3517 50 one &
r rc2_d1 env RECALL=24 node critic/scripts/c45_rc2_recall.mjs 3517 40 d1 &
r rc2_d3 env RECALL=72 node critic/scripts/c45_rc2_recall.mjs 3517 40 d3 &
wait
r rc2_d5 env RECALL=120 node critic/scripts/c45_rc2_recall.mjs 3517 40 d5 &
r rc2_h6 env RECALL=6 node critic/scripts/c45_rc2_recall.mjs 3517 40 h6 &
r mk2_freshfirst node critic/scripts/c45_mk2_steal.mjs 3517 60 freshfirst &
wait
r mk2_freshfirst_14003 node critic/scripts/c45_mk2_steal.mjs 14003 60 freshfirst_14003 &
r mk2_freshfirst_14011 node critic/scripts/c45_mk2_steal.mjs 14011 60 freshfirst_14011 &
r mk2_nofresh2 env MODE=nofresh node critic/scripts/c45_mk2_steal.mjs 3517 60 nofresh2 &
wait
r mk2_leaversfirst env MODE=leaversfirst node critic/scripts/c45_mk2_steal.mjs 3517 60 leaversfirst &
r lwt5_four_allsw63 env NPX=-63 NPY=63 node critic/scripts/c45_lwt5.mjs 3517 4 60 24 allnear 1600 900 four_allsw63 &
r mk_mixed_s2 node critic/scripts/c45_mk_mark.mjs 3517 mixed 0 2 40 1600 900 mixed_s2 &
wait
r tm_touch node critic/scripts/c45_tm_touch.mjs &
r hs_desk node critic/scripts/c45_hs_hintsel.mjs 3517 1600 900 desk &
r mk2_recall4 env RECALL=4 node critic/scripts/c45_mk2_steal.mjs 3517 60 recall4 &
wait
r mk4_eng7019_p270 env PICK=270,271 node critic/scripts/c45_mk4_eng.mjs 7019 30 eng7019_p270 &
r mk4_eng15101_sep env PICK=270,271 SEPARATE=1 node critic/scripts/c45_mk4_eng.mjs 15101 30 eng15101_sep &
r mk4_eng15101_p270 env PICK=270,271 node critic/scripts/c45_mk4_eng.mjs 15101 30 eng15101_p270 &
wait
r pn_eng15101 node critic/scripts/c45_pn_panel.mjs 15101 20 eng15101 &
r fs_eng15101 node critic/scripts/c45_fs_strand.mjs 15101 12 eng15101 &
wait
echo SUITEPDONE
