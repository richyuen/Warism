import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { NationStat, WarStat } from '../shared/protocol';
import { t, type MessageKey } from './i18n';
import { displayName } from './NationPanel';
import { buildRelationGraph, EDGE_KINDS, nationKey, type EdgeKind, type GraphEdge, type RelationGraph } from './relationGraph';
import { layoutGraph, type Pos } from './relationLayout';
import { placeLabels, type LabelItem } from './relationLabels';

/** The drawing's own size (the SVG scales it to the panel). */
const W = 640;
const H = 440;

/** Each kind's colour; a war's two sides apart. */
export const EDGE_COLOR: Record<EdgeKind, string> = { war: '#c0392b', alliance: '#2e9e5b', guarantee: '#3498db', puppet: '#9b59b6', truce: '#b4b4ac' };
const DEFENDER_COLOR = '#e67e22';

export interface RelationsPanelProps {
  nations: NationStat[];
  wars: WarStat[];
  /** The selected nation (0 = none): ringed in the graph. */
  selected: number;
  onSelect: (id: number) => void;
  flagUrlOf: (id: number) => string | null;
  onClose: () => void;
}

/** How far the graph zooms in (ROADMAP R11: on a phone the whole world's graph is too small to read). */
const MAX_ZOOM = 6;
/** From this zoom every nation is named. */
const NAME_ALL_ZOOM = 2;

/** The part of the drawing in view: its middle and zoom (1: all of it). */
interface Zoom {
  z: number;
  cx: number;
  cy: number;
}
const WHOLE: Zoom = { z: 1, cx: W / 2, cy: H / 2 };

/** `zoom` kept inside the drawing: never further out than all of it, never past its edges. */
function clampZoom(zoom: Zoom): Zoom {
  const z = Math.max(1, Math.min(MAX_ZOOM, zoom.z));
  const hw = W / z / 2;
  const hh = H / z / 2;
  return { z, cx: Math.max(hw, Math.min(W - hw, zoom.cx)), cy: Math.max(hh, Math.min(H - hh, zoom.cy)) };
}

/** A label's size on the screen, whatever the zoom (ROADMAP R34a: at 10 drawing units it was 6 px on a phone). */
const LABEL_PX = 11;
/** The space between labels, and from a label to its node, in screen px. */
const LABEL_GAP_PX = 2;

let measurer: CanvasRenderingContext2D | null = null;
const widths = new Map<string, number>();
/** The width of `text` at LABEL_PX in the page's font, in px (an estimate where there is no canvas). */
function textPx(text: string): number {
  let w = widths.get(text);
  if (w !== undefined) return w;
  if (!measurer && typeof document !== 'undefined') {
    measurer = document.createElement('canvas').getContext('2d');
    if (measurer) measurer.font = `${LABEL_PX}px ${getComputedStyle(document.body).fontFamily}`;
  }
  w = measurer ? measurer.measureText(text).width : text.length * LABEL_PX * 0.6;
  widths.set(text, w);
  return w;
}

const nodeRadius = (landShare: number): number => Math.min(22, 7 + 60 * Math.sqrt(landShare) * 0.5);
const idOf = (key: string): number => Number(key.slice(1));

/**
 * The relations graph (ROADMAP R1, ADR-806): every war, alliance, guarantee, puppet bond and truce
 * of the world at once. The layout is made over every kind, so switching a kind off hides its lines
 * and leaves the rest where they were.
 */
export function RelationsPanel({ nations, wars, selected, onSelect, flagUrlOf, onClose }: RelationsPanelProps) {
  const [kinds, setKinds] = useState<ReadonlySet<EdgeKind>>(new Set(EDGE_KINDS));
  const [focus, setFocus] = useState(0);
  const [said, setSaid] = useState<string | null>(null);
  // Zoom and pan (ROADMAP R11, R29-N8): the wheel, a pinch, a drag, and the buttons for a tap.
  const [zoom, setZoom] = useState<Zoom>(WHOLE);
  const svg = useRef<SVGSVGElement>(null);
  // The drawing's width on the screen (labels keep one size on the screen: R34a).
  const [svgPx, setSvgPx] = useState(0);
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const read = (): void => setSvgPx(el.getBoundingClientRect().width);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const dragged = useRef(false);
  /** Drawing units in a CSS px of the SVG, at the zoom now. */
  const unitsPerPx = (): number => {
    const r = svg.current?.getBoundingClientRect();
    return r && r.width > 0 ? W / zoom.z / r.width : 1;
  };
  /** The drawing's point under a client point, at the zoom now. */
  const pointAt = (clientX: number, clientY: number): { x: number; y: number } => {
    const r = svg.current?.getBoundingClientRect();
    if (!r || r.width <= 0) return { x: zoom.cx, y: zoom.cy };
    const k = unitsPerPx();
    return { x: zoom.cx + (clientX - r.left - r.width / 2) * k, y: zoom.cy + (clientY - r.top - r.height / 2) * k };
  };
  /** Zooms by `f` about the drawing's point `p` (it stays under the pointer). */
  const zoomBy = (f: number, p: { x: number; y: number } = { x: zoom.cx, y: zoom.cy }): void => {
    const z = Math.max(1, Math.min(MAX_ZOOM, zoom.z * f));
    const s = zoom.z / z;
    setZoom(clampZoom({ z, cx: p.x + (zoom.cx - p.x) * s, cy: p.y + (zoom.cy - p.y) * s }));
  };
  const onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 1.25 : 0.8, pointAt(e.clientX, e.clientY));
  };
  const onPointerDown = (e: PointerEvent): void => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) dragged.current = false;
  };
  const onPointerMove = (e: PointerEvent): void => {
    const was = pointers.current.get(e.pointerId);
    if (!was) return;
    const all = [...pointers.current.values()];
    if (pointers.current.size === 2) {
      // A pinch: the zoom by the change of the two fingers' distance, about their middle.
      const other = all.find((q) => q !== was)!;
      const before = Math.hypot(was.x - other.x, was.y - other.y);
      const after = Math.hypot(e.clientX - other.x, e.clientY - other.y);
      if (before > 0 && after > 0) zoomBy(after / before, pointAt((e.clientX + other.x) / 2, (e.clientY + other.y) / 2));
      dragged.current = true;
    } else if (zoom.z > 1) {
      const dx = e.clientX - was.x;
      const dy = e.clientY - was.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragged.current = true;
      if (dragged.current) {
        const k = unitsPerPx();
        setZoom(clampZoom({ ...zoom, cx: zoom.cx - dx * k, cy: zoom.cy - dy * k }));
      }
    }
    if (dragged.current || pointers.current.size === 2) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };
  const onPointerUp = (e: PointerEvent): void => {
    pointers.current.delete(e.pointerId);
  };
  const places = useRef<Map<string, Pos>>(new Map());
  const byId = useMemo(() => new Map(nations.map((n) => [n.id, n])), [nations]);
  const name = (id: number): string => {
    const n = byId.get(id);
    return n ? displayName(n.name) : `#${id}`;
  };
  // Every kind, for the places; the kinds switched on, for what is drawn.
  const all = useMemo(() => buildRelationGraph(nations, wars), [nations, wars]);
  const pos = useMemo(() => {
    const next = layoutGraph(all, places.current, { width: W, height: H, steps: places.current.size === 0 ? 300 : 40 });
    places.current = next;
    return next;
  }, [all]);
  const shown: RelationGraph = useMemo(() => {
    const g = buildRelationGraph(nations, wars, kinds);
    if (focus === 0) return g;
    const me = nationKey(focus);
    const hubs = new Set(g.edges.filter((e) => e.kind === 'war' && e.from === me).map((e) => e.to));
    const edges = g.edges.filter((e) => e.from === me || e.to === me || hubs.has(e.to));
    const keep = new Set(edges.flatMap((e) => [e.from, e.to]));
    return { nodes: g.nodes.filter((n) => keep.has(n.key)), edges, untied: g.untied };
  }, [nations, wars, kinds, focus]);
  const warById = useMemo(() => new Map(wars.map((w) => [w.id, w])), [wars]);
  // A nation's lines: one with many is named whatever its size (an empire's centre, a war's leader).
  const degree = useMemo(() => {
    const d = new Map<string, number>();
    for (const e of shown.edges) for (const k of [e.from, e.to]) d.set(k, (d.get(k) ?? 0) + 1);
    return d;
  }, [shown]);

  const edgeText = (e: GraphEdge): string => {
    const a = idOf(e.from);
    const b = idOf(e.to);
    if (e.kind === 'war') {
      const w = warById.get(b);
      if (!w) return '';
      const [own, other] = e.side === 1 ? [w.defenders, w.attackers] : [w.attackers, w.defenders];
      // Its side's other members (ROADMAP R11, R29-N8): "X is at war beside X" read for one leading it,
      // or alone on it.
      const enemy = name(other[0] ?? 0);
      const beside = own.filter((x) => x !== a);
      if (beside.length === 0) return t('relations.edge.warAlone', { a: name(a), enemy });
      if (own[0] !== a) return t('relations.edge.war', { a: name(a), leader: name(own[0]!), enemy });
      return beside.length === 1 ? t('relations.edge.warLeadsOne', { a: name(a), b: name(beside[0]!), enemy }) : t('relations.edge.warLeads', { a: name(a), b: name(beside[0]!), n: beside.length - 1, enemy });
    }
    if (e.kind === 'truce') {
      const days = byId.get(a)?.truces.find((x) => x.with === b)?.days ?? 0;
      return t('relations.edge.truce', { a: name(a), b: name(b), days });
    }
    return t(`relations.edge.${e.kind}` as MessageKey, { a: name(a), b: name(b) });
  };
  const warText = (id: number): string => {
    const w = warById.get(id);
    return w ? t('relations.war', { att: name(w.attackers[0] ?? 0), def: name(w.defenders[0] ?? 0), na: w.attackers.length, nd: w.defenders.length }) : '';
  };

  const toggle = (k: EdgeKind): void => {
    const next = new Set(kinds);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setKinds(next);
  };
  const sorted = [...nations].sort((x, y) => displayName(x.name).localeCompare(displayName(y.name)));
  const at = (key: string): Pos => pos.get(key) ?? { x: W / 2, y: H / 2 };
  // The labels (R34a): one size on the screen; those that would print over another left out, in order of
  // importance (the one chosen, the focus, then the largest and most tied); zooming in names more.
  const k = W / zoom.z / (svgPx > 0 ? svgPx : W);
  const fontUnits = LABEL_PX * k;
  const labelled = shown.nodes
    .filter((n) => n.kind === 'nation' && (zoom.z >= NAME_ALL_ZOOM || nodeRadius(n.weight) >= 12 || (degree.get(n.key) ?? 0) >= 4 || n.id === selected || n.id === focus))
    .map((n) => ({ n, rank: n.id === selected ? 0 : n.id === focus ? 1 : 2 }))
    .sort((a, b) => a.rank - b.rank || b.n.weight - a.n.weight || (degree.get(b.n.key) ?? 0) - (degree.get(a.n.key) ?? 0) || a.n.key.localeCompare(b.n.key));
  const items: LabelItem[] = labelled.map(({ n }) => ({ key: n.key, ...at(n.key), r: nodeRadius(n.weight), w: textPx(name(n.id)) * k, h: fontUnits }));
  const halfW = W / zoom.z / 2;
  const halfH = H / zoom.z / 2;
  const labels = placeLabels(items, { x0: zoom.cx - halfW, y0: zoom.cy - halfH, x1: zoom.cx + halfW, y1: zoom.cy + halfH }, LABEL_GAP_PX * k);

  return (
    <aside class="history-panel relations-panel" data-testid="relations-panel">
      <header class="ranking-head">
        <span>{t('relations.title')}</span>
        <button type="button" class="panel-close" data-testid="relations-close" aria-label={t('panel.close')} onClick={onClose}>
          ×
        </button>
      </header>
      <div class="god-row relations-filters">
        {EDGE_KINDS.map((k) => (
          <label key={k} class="relations-kind">
            <input type="checkbox" data-testid={`relations-kind-${k}`} checked={kinds.has(k)} onChange={() => toggle(k)} />
            <span class="relations-swatch" style={{ background: EDGE_COLOR[k] }} />
            {t(`relations.kind.${k}` as MessageKey)}
          </label>
        ))}
        <select data-testid="relations-focus" aria-label={t('relations.focus')} title={t('relations.focus')} value={String(focus)} onChange={(e) => setFocus(Number((e.currentTarget as HTMLSelectElement).value))}>
          <option value="0">{t('relations.allNations')}</option>
          {sorted.map((n) => (
            <option key={n.id} value={String(n.id)}>
              {displayName(n.name)}
            </option>
          ))}
        </select>
      </div>
      <div class="relations-zoom">
        <button type="button" class="bar-btn" data-testid="relations-zoom-out" aria-label={t('relations.zoomOut')} title={t('relations.zoomOut')} disabled={zoom.z <= 1} onClick={() => zoomBy(1 / 1.5)}>
          −
        </button>
        <button type="button" class="bar-btn" data-testid="relations-zoom-in" aria-label={t('relations.zoomIn')} title={t('relations.zoomIn')} disabled={zoom.z >= MAX_ZOOM} onClick={() => zoomBy(1.5)}>
          +
        </button>
        <button type="button" class="bar-btn" data-testid="relations-zoom-reset" title={t('relations.zoomReset')} disabled={zoom.z <= 1} onClick={() => setZoom(WHOLE)}>
          {t('relations.zoomReset')}
        </button>
        <span class="relations-zoom-hint">{t('relations.zoomHint')}</span>
      </div>
      <svg
        ref={svg}
        class="relations-graph"
        data-testid="relations-graph"
        data-zoom={zoom.z.toFixed(2)}
        viewBox={`${zoom.cx - W / zoom.z / 2} ${zoom.cy - H / zoom.z / 2} ${W / zoom.z} ${H / zoom.z}`}
        role="img"
        aria-label={t('relations.title')}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => {
          // A drag or a pinch is not a click on what it ended over.
          if (dragged.current) {
            e.stopPropagation();
            dragged.current = false;
          }
        }}
      >
        <defs>
          {(['guarantee', 'puppet'] as const).map((k) => (
            <marker key={k} id={`rg-arrow-${k}`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={EDGE_COLOR[k]} />
            </marker>
          ))}
          {shown.nodes
            .filter((n) => n.kind === 'nation')
            .map((n) => (
              <clipPath key={n.key} id={`rg-clip-${n.id}`}>
                <circle cx={at(n.key).x} cy={at(n.key).y} r={nodeRadius(n.weight)} />
              </clipPath>
            ))}
        </defs>
        <g class="relations-edges">
          {shown.edges.map((e, i) => {
            const p = at(e.from);
            const q = at(e.to);
            // A directed line ends at the rim of its target, where the arrow shows.
            const target = shown.nodes.find((n) => n.key === e.to);
            const r = target?.kind === 'nation' ? nodeRadius(target.weight) + 2 : 8;
            const d = Math.hypot(q.x - p.x, q.y - p.y) || 1;
            const end = { x: q.x - ((q.x - p.x) / d) * r, y: q.y - ((q.y - p.y) / d) * r };
            const color = e.kind === 'war' && e.side === 1 ? DEFENDER_COLOR : EDGE_COLOR[e.kind];
            const directed = e.kind === 'guarantee' || e.kind === 'puppet';
            return (
              <g key={`${e.kind}-${e.from}-${e.to}-${i}`} class="relations-edge" data-kind={e.kind} data-from={e.from} data-to={e.to} onClick={() => setSaid(edgeText(e))}>
                <line x1={p.x} y1={p.y} x2={end.x} y2={end.y} stroke={color} stroke-opacity={e.kind === 'war' ? 0.75 : 1} stroke-width={e.kind === 'alliance' || e.kind === 'puppet' ? 2.5 : 1.8} stroke-dasharray={e.kind === 'truce' ? '5 4' : undefined} marker-end={directed ? `url(#rg-arrow-${e.kind})` : undefined} />
                <line class="relations-hit" x1={p.x} y1={p.y} x2={end.x} y2={end.y} stroke="transparent" stroke-width="10" />
              </g>
            );
          })}
        </g>
        <g class="relations-nodes">
          {shown.nodes.map((n) => {
            const p = at(n.key);
            if (n.kind === 'war') {
              return (
                <g key={n.key} class="relations-war" data-testid={`relations-node-${n.key}`} onClick={() => setSaid(warText(n.id))}>
                  <circle cx={p.x} cy={p.y} r={8} fill="#2a1d1d" stroke={EDGE_COLOR.war} stroke-width="1.5" />
                  <text x={p.x} y={p.y + 4} text-anchor="middle" font-size="10">
                    ⚔
                  </text>
                  <title>{warText(n.id)}</title>
                </g>
              );
            }
            const r = nodeRadius(n.weight);
            const url = flagUrlOf(n.id);
            const nat = byId.get(n.id);
            const fill = nat ? `#${nat.color.toString(16).padStart(6, '0')}` : '#888';
            return (
              <g
                key={n.key}
                class={n.id === selected ? 'relations-nation selected' : 'relations-nation'}
                data-testid={`relations-node-${n.key}`}
                onClick={() => {
                  onSelect(n.id);
                  setSaid(name(n.id));
                }}
              >
                <circle cx={p.x} cy={p.y} r={r} fill={fill} />
                {url ? <image href={url} x={p.x - r * 1.5} y={p.y - r} width={r * 3} height={r * 2} preserveAspectRatio="xMidYMid slice" clip-path={`url(#rg-clip-${n.id})`} /> : null}
                <circle cx={p.x} cy={p.y} r={r} fill="none" stroke={n.id === selected ? '#f1c40f' : 'rgba(0,0,0,0.6)'} stroke-width={n.id === selected ? 3 : 1} />
                <title>{name(n.id)}</title>
              </g>
            );
          })}
        </g>
        <g class="relations-labels" style={{ fontSize: `${fontUnits}px`, strokeWidth: `${3 * k}px` }}>
          {[...labels].map(([key, l]) => (
            <text key={key} class="relations-label" data-testid={`relations-label-${key}`} x={l.x} y={l.y} text-anchor={l.anchor}>
              {name(idOf(key))}
            </text>
          ))}
        </g>
      </svg>
      <footer class="relations-footer" data-testid="relations-said">
        {said ?? (shown.edges.length === 0 ? t('relations.empty') : t('relations.hint'))}
        {shown.untied > 0 && focus === 0 ? <span class="relations-untied"> · {t('relations.untied', { n: shown.untied })}</span> : null}
      </footer>
    </aside>
  );
}

