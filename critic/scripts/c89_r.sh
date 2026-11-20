# Critic run 89: the page-probe runner, sourced by the lanes (bash). r <probe> <args...>: runs critic/scripts/c89_<probe>.mjs
# if there is one, else c88_, else c85_<probe>.mjs, against HEAD's build (f27f48f5, critic/c89_dist) on 5441 with a
# timeout (TO, default 1500 s), its output to critic/c89_<probe>.<TAGL><args>.log. p <name> <script> <args...>: any script.
cd /c/Git/Warism
export BASE=${BASE:-http://127.0.0.1:5441}
r() {
  name=$1; shift
  L=$(echo "${TAGL:-}$*" | tr ' /&=,?:' '_______' | cut -c1-90)
  S=critic/scripts/c85_$name.mjs; [ -f critic/scripts/c88_$name.mjs ] && S=critic/scripts/c88_$name.mjs; [ -f critic/scripts/c89_$name.mjs ] && S=critic/scripts/c89_$name.mjs
  echo "== $name ${TAGL:-} $* $(date +%T)"
  timeout ${TO:-1500} node $S "$@" > critic/c89_$name.$L.log 2>&1
  echo "   exit $? $(date +%T)"
}
p() { n=$1; s=$2; shift 2; echo "== $n $* $(date +%T)"; TAG=${TAG:-_c89} DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c89_${n}_${TAGL:-}$(echo "$*" | tr ' ,' '__').log 2>&1; echo "   exit $?"; }
waitfile() { until grep -q "${2:-^done:}" "$1" 2>/dev/null; do sleep 20; done; }
