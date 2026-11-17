#!/bin/bash
# Critic run 75 (full): the figures of the run's headless logs in one place (read by the critic, not a case).
cd /c/Git/Warism/critic
sec() { echo; echo "######## $1"; }
sec "progress: non-zero exits"
awk '$1!=0' c75_named.progress c75_starts.progress 2>/dev/null | cut -c1-170
sec "checkers"
for f in c75_diploinv_*.log c75_wi_*.log; do echo "$f: $(grep -E 'broken' $f | tail -1 | cut -c1-200)"; done
for f in c75_free_*_free.log; do echo "$f: $(grep -icE 'broken|BROKEN' $f) lines with broken; $(tail -1 $f | cut -c1-160)"; done
echo "landingFuzz: $(tail -3 c75_landingFuzz.log | tr '\n' ' ' | cut -c1-400)"
echo "landingRows: $(tail -2 c75_lrows_all.log | tr '\n' ' ' | cut -c1-300)"
for f in c75_li_*.log; do echo "$f: $(grep -E 'broken|slowClick' $f | tail -2 | tr '\n' ' ' | cut -c1-300)"; done
for f in c75_wd_*.log; do echo "$f: $(tail -3 $f | tr '\n' ' ' | cut -c1-300)"; done
for f in c75_blocend_54611.log c75_heldfree_1946.log c75_clampend.log c75_heldAtEnd_*.log c75_repulse_*.log; do echo "$f: $(tail -2 $f | tr '\n' ' ' | cut -c1-300)"; done
sec "saves and long runs"
for f in c75_seed7019_save.log c75_seed32019_save.log c75_seed58505_save.log; do echo "$f: $(grep -E '^year 20|^year 13|^done' $f | tr '\n' ' ' | cut -c1-400)"; done
for f in c75_hero_*.log; do echo "$f: $(tail -2 $f | tr '\n' ' ' | cut -c1-400)"; done
sec "few nations"
for f in c75_few*.log; do echo "== $f"; tail -9 $f | cut -c1-200; done
sec "wars"
for f in c75_warOpening*.log; do echo "== $f"; tail -6 $f | cut -c1-300; done
for f in c75_farc_*.log c75_firstdecl*.log c75_piles_*.log c75_pileSides_51.log c75_prague_*.log c75_fa_*.log; do echo "$f: $(tail -2 $f | tr '\n' ' ' | cut -c1-300)"; done
sec "nukes"
for f in c75_nc_*.log c75_nukeIntercepts_53501.log; do echo "$f: $(tail -2 $f | tr '\n' ' ' | cut -c1-300)"; done
sec "naval, tanks, heroes"
for f in c75_sb_*.log; do echo "$f: $(grep -E '^seed' $f | tail -1 | cut -c1-260)"; done
for f in c75_heroBattle_*.log; do echo "$f: $(tail -3 $f | tr '\n' ' ' | cut -c1-300)"; done
echo "heroCeiling: $(grep -hE 'at or above|lives' c75_heroCeiling3_*.log | cut -c1-160 | tr '\n' '|' | cut -c1-1600)"
for f in c75_dday_1938.log c75_census_1938.log c75_tf_*.log c75_track_*.log c75_toparea_*.log; do echo "$f: $(tail -3 $f | tr '\n' ' ' | cut -c1-360)"; done
sec "starts jobs"
for f in c75_capsurvey.log c75_heroPlace_*.log c75_warlong_*.log c75_endleb_999.log c75_freewar_*.log c75_saveload_1942god.log c75_atx_*.log c75_neighbourColours_1938.log c75_oldsave_1975.log c75_landless_*.log c75_successorPurse.log c75_menloss_*.log; do echo "$f: $(tail -2 $f | tr '\n' ' ' | cut -c1-330)"; done
sec "bulk"
cat c75_chainBulk.log 2>/dev/null
for f in c75_liab_named_cmp.txt c75_sr_cmp.txt c75_nv_cmp.txt; do echo "== $f"; head -6 $f 2>/dev/null | cut -c1-400; done
tail -24 c75_malta.log 2>/dev/null | cut -c1-200
sec "perf"
cat c75_pf.status 2>/dev/null
