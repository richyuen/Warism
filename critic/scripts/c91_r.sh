# Critic run 91: the page-probe runner, sourced by the lanes (bash). r <probe> <args...>: runs critic/scripts/c91_<probe>.mjs
# if there is one, else c90_, else c88_, else c85_<probe>.mjs, against HEAD's build (4f5c5427, critic/c91_dist) on 5491
# with a timeout (TO, default 1500 s), its output to critic/c91_<probe>.<TAGL><args>.log. p <name> <script> <args...>: any script.
cd /c/Git/Warism
export BASE=${BASE:-http://127.0.0.1:5491}
r() {
  name=$1; shift
  L=$(echo "${TAGL:-}$*" | tr ' /&=,?:' '_______' | cut -c1-90)
  S=critic/scripts/c85_$name.mjs
  for pre in c88 c90 c91; do [ -f critic/scripts/${pre}_$name.mjs ] && S=critic/scripts/${pre}_$name.mjs; done
  echo "== $name ${TAGL:-} $* $(date +%T)"
  timeout ${TO:-1500} node $S "$@" > critic/c91_$name.$L.log 2>&1
  echo "   exit $? $(date +%T)"
}
p() { n=$1; s=$2; shift 2; echo "== $n $* $(date +%T)"; TAG=${TAG:-_c91} DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c91_${n}_${TAGL:-}$(echo "$*" | tr ' ,' '__').log 2>&1; echo "   exit $?"; }
waitfile() { until grep -q "${2:-^done:}" "$1" 2>/dev/null; do sleep 20; done; }
