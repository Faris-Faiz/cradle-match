"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Building2,
  GraduationCap,
  Handshake,
  ClipboardList,
  Maximize2,
  RotateCw,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Public graph shapes (built server-side by /network) ──────────────────────

export type NodeKind = "company" | "mentor" | "programme" | "partner";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  sublabel: string;
  href?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  active: boolean;
  scoreLabel?: string;
}

// ── Visual vocabulary ────────────────────────────────────────────────────────

const KIND_META: Record<
  NodeKind,
  { label: string; plural: string; color: string; icon: LucideIcon }
> = {
  company: { label: "Company", plural: "Companies", color: "#0f172a", icon: Building2 },
  mentor: { label: "Mentor", plural: "Mentors", color: "#059669", icon: GraduationCap },
  programme: { label: "Programme", plural: "Programmes", color: "#4f46e5", icon: ClipboardList },
  partner: { label: "Partner", plural: "Partners", color: "#d97706", icon: Handshake },
};

// ── Force simulation ─────────────────────────────────────────────────────────
// A compact spring-and-repulsion layout. Positions live in a ref so the
// animation loop never thrashes React state shape; a frame counter triggers
// re-renders. `alpha` cools the system so it settles, then stops.

interface Vec {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const REPULSION = 5200;
const SPRING_LENGTH = 150;
const SPRING_K = 0.045;
const CENTER_K = 0.014;
const DAMPING = 0.82;

function stepSimulation(
  pos: Map<string, Vec>,
  nodes: GraphNode[],
  edges: GraphEdge[],
  cx: number,
  cy: number,
  alpha: number,
  pinned: string | null,
) {
  // Pairwise repulsion — every node pushes every other apart.
  for (let i = 0; i < nodes.length; i++) {
    const a = pos.get(nodes[i].id)!;
    for (let j = i + 1; j < nodes.length; j++) {
      const b = pos.get(nodes[j].id)!;
      let dx = a.x - b.x;
      let dy = a.y - b.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      if (dist < 1) {
        dx = Math.random() - 0.5;
        dy = Math.random() - 0.5;
        dist = 1;
      }
      const force = (REPULSION / (dist * dist)) * alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }
  }

  // Springs pull related entities toward an ideal separation.
  for (const e of edges) {
    const a = pos.get(e.source);
    const b = pos.get(e.target);
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
    const force = (dist - SPRING_LENGTH) * SPRING_K * alpha;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    a.vx += fx;
    a.vy += fy;
    b.vx -= fx;
    b.vy -= fy;
  }

  // Gentle gravity toward the canvas centre keeps the graph composed.
  for (const n of nodes) {
    const p = pos.get(n.id)!;
    p.vx += (cx - p.x) * CENTER_K * alpha;
    p.vy += (cy - p.y) * CENTER_K * alpha;
    if (n.id === pinned) continue;
    p.vx *= DAMPING;
    p.vy *= DAMPING;
    p.x += p.vx;
    p.y += p.vy;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

const HEIGHT = 600;

export default function NetworkGraph({
  nodes,
  edges,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(900);
  // Mirrors `width` for the animation loop, which must read it without
  // re-creating its closure every resize.
  const widthRef = useRef(900);

  // Render snapshot — the simulation mutates refs for speed; `commit` copies
  // the live positions and view transform into state to trigger a repaint.
  const [frame, setFrame] = useState<{
    pos: Map<string, Vec>;
    view: { tx: number; ty: number; k: number };
  }>(() => ({ pos: new Map(), view: { tx: 0, ty: 0, k: 1 } }));

  const posRef = useRef<Map<string, Vec>>(new Map());
  const alphaRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const dragRef = useRef<{ id: string | null; panning: boolean; px: number; py: number }>(
    { id: null, panning: false, px: 0, py: 0 },
  );
  const viewRef = useRef({ tx: 0, ty: 0, k: 1 });

  const commit = useCallback(() => {
    setFrame({ pos: new Map(posRef.current), view: { ...viewRef.current } });
  }, []);

  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [shownKinds, setShownKinds] = useState<Record<NodeKind, boolean>>({
    company: true,
    mentor: true,
    programme: true,
    partner: true,
  });
  const [showClosed, setShowClosed] = useState(true);

  const nodeById = useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes],
  );

  // Adjacency — used for highlighting and the inspector's connection list.
  const adjacency = useMemo(() => {
    const map = new Map<string, GraphEdge[]>();
    const list = (id: string) => {
      let l = map.get(id);
      if (!l) {
        l = [];
        map.set(id, l);
      }
      return l;
    };
    for (const e of edges) {
      list(e.source).push(e);
      list(e.target).push(e);
    }
    return map;
  }, [edges]);

  // Seed positions on a ring (companies inner, supports outer) so the very
  // first frame already reads as a graph rather than a pile.
  useEffect(() => {
    const pos = posRef.current;
    const cx = widthRef.current / 2;
    const cy = HEIGHT / 2;
    const companies = nodes.filter((n) => n.kind === "company");
    const supports = nodes.filter((n) => n.kind !== "company");
    const place = (list: GraphNode[], radius: number) => {
      list.forEach((n, i) => {
        if (pos.has(n.id)) return;
        const angle = (i / Math.max(list.length, 1)) * Math.PI * 2;
        pos.set(n.id, {
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
        });
      });
    };
    place(companies, 130);
    place(supports, 250);
    // Pre-warm the layout so it appears settled on first paint.
    for (let i = 0; i < 120; i++) {
      stepSimulation(pos, nodes, edges, cx, cy, alphaRef.current, null);
      alphaRef.current *= 0.985;
    }
    alphaRef.current = 0.12;
    commit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  // Track container width so the canvas is responsive.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sync = () => {
      widthRef.current = el.clientWidth;
      setWidth(el.clientWidth);
    };
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, []);

  // Animation loop — runs only while the system still has energy.
  const ensureRunning = useCallback(() => {
    if (rafRef.current != null) return;
    const loop = () => {
      const dragging = dragRef.current.id !== null;
      const cx = widthRef.current / 2;
      const cy = HEIGHT / 2;
      for (let i = 0; i < 2; i++) {
        stepSimulation(
          posRef.current,
          nodes,
          edges,
          cx,
          cy,
          alphaRef.current,
          dragRef.current.id,
        );
      }
      if (!dragging) alphaRef.current *= 0.98;
      commit();
      if (alphaRef.current > 0.01 || dragging) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [nodes, edges, commit]);

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, []);

  const reheat = useCallback(
    (value = 0.6) => {
      alphaRef.current = value;
      ensureRunning();
    },
    [ensureRunning],
  );

  // Convert a pointer event to world (pre-transform) coordinates.
  const toWorld = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const { tx, ty, k } = viewRef.current;
    return {
      x: (clientX - rect.left - tx) / k,
      y: (clientY - rect.top - ty) / k,
    };
  };

  const onNodePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { id, panning: false, px: e.clientX, py: e.clientY };
    reheat(0.35);
  };

  const onBgPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { id: null, panning: true, px: e.clientX, py: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (drag.id) {
      const w = toWorld(e.clientX, e.clientY);
      const p = posRef.current.get(drag.id);
      if (p) {
        p.x = w.x;
        p.y = w.y;
        p.vx = 0;
        p.vy = 0;
      }
      reheat(0.3);
    } else if (drag.panning) {
      viewRef.current.tx += e.clientX - drag.px;
      viewRef.current.ty += e.clientY - drag.py;
      drag.px = e.clientX;
      drag.py = e.clientY;
      commit();
    }
  };

  const onPointerUp = () => {
    dragRef.current = { id: null, panning: false, px: 0, py: 0 };
  };

  const onWheel = (e: React.WheelEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const v = viewRef.current;
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const k = Math.min(2.4, Math.max(0.4, v.k * factor));
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    // Keep the point under the cursor stationary while zooming.
    v.tx = mx - ((mx - v.tx) / v.k) * k;
    v.ty = my - ((my - v.ty) / v.k) * k;
    v.k = k;
    commit();
  };

  const resetView = () => {
    viewRef.current = { tx: 0, ty: 0, k: 1 };
    commit();
  };

  // ── Derived render data ────────────────────────────────────────────────────

  const focusId = hovered ?? selected;
  const neighbours = useMemo(() => {
    if (!focusId) return null;
    const set = new Set<string>([focusId]);
    for (const e of adjacency.get(focusId) ?? []) {
      set.add(e.source);
      set.add(e.target);
    }
    return set;
  }, [focusId, adjacency]);

  const isHidden = (n: GraphNode) => !shownKinds[n.kind];
  const edgeHidden = (e: GraphEdge) =>
    (!e.active && !showClosed) ||
    isHidden(nodeById.get(e.source)!) ||
    isHidden(nodeById.get(e.target)!);

  const { tx, ty, k } = frame.view;
  const selectedNode = selected ? nodeById.get(selected) : null;
  const selectedEdges = selected ? adjacency.get(selected) ?? [] : [];

  const visibleCount = nodes.filter((n) => !isHidden(n)).length;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
      {/* Canvas */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(KIND_META) as NodeKind[]).map((kind) => {
              const meta = KIND_META[kind];
              const on = shownKinds[kind];
              return (
                <button
                  key={kind}
                  onClick={() =>
                    setShownKinds((s) => ({ ...s, [kind]: !s[kind] }))
                  }
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                    on
                      ? "border-border bg-card text-foreground"
                      : "border-transparent bg-muted text-muted-foreground/60",
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: on ? meta.color : "#cbd5e1" }}
                  />
                  {meta.plural}
                </button>
              );
            })}
            <button
              onClick={() => setShowClosed((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                showClosed
                  ? "border-border bg-card text-foreground"
                  : "border-transparent bg-muted text-muted-foreground/60",
              )}
            >
              <span className="h-0 w-3.5 border-t-2 border-dashed border-current" />
              Past relationships
            </button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => reheat()}>
              <RotateCw /> Re-arrange
            </Button>
            <Button variant="ghost" size="sm" onClick={resetView}>
              <Maximize2 /> Reset view
            </Button>
          </div>
        </div>

        <div ref={containerRef} className="dot-grid">
          <svg
            ref={svgRef}
            width={width}
            height={HEIGHT}
            className="block touch-none select-none"
            onPointerDown={onBgPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onWheel={onWheel}
            onClick={() => setSelected(null)}
          >
            <g transform={`translate(${tx},${ty}) scale(${k})`}>
              {/* Edges */}
              {edges.map((e) => {
                if (edgeHidden(e)) return null;
                const a = frame.pos.get(e.source);
                const b = frame.pos.get(e.target);
                if (!a || !b) return null;
                const lit =
                  !neighbours ||
                  (neighbours.has(e.source) && neighbours.has(e.target));
                return (
                  <line
                    key={e.id}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={e.active ? "#10b981" : "#94a3b8"}
                    strokeWidth={lit ? (e.active ? 2 : 1.5) : 1}
                    strokeDasharray={e.active ? undefined : "4 4"}
                    strokeOpacity={lit ? 0.7 : 0.12}
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map((n) => {
                if (isHidden(n)) return null;
                const p = frame.pos.get(n.id);
                if (!p) return null;
                const meta = KIND_META[n.kind];
                const degree = (adjacency.get(n.id) ?? []).length;
                const r =
                  (n.kind === "company" ? 20 : 14) +
                  Math.min(degree, 5) * 1.6;
                const dim = neighbours ? !neighbours.has(n.id) : false;
                const isFocus = focusId === n.id;
                return (
                  <g
                    key={n.id}
                    transform={`translate(${p.x},${p.y})`}
                    opacity={dim ? 0.2 : 1}
                    className="cursor-pointer"
                    onPointerDown={(ev) => onNodePointerDown(ev, n.id)}
                    onPointerEnter={() => setHovered(n.id)}
                    onPointerLeave={() => setHovered(null)}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setSelected(n.id);
                    }}
                  >
                    {isFocus && (
                      <circle r={r + 6} fill="none" stroke={meta.color} strokeWidth={1.5} strokeOpacity={0.4} />
                    )}
                    <circle
                      r={r}
                      fill={meta.color}
                      stroke="#ffffff"
                      strokeWidth={2.5}
                    />
                    <text
                      y={r + 13}
                      textAnchor="middle"
                      className="pointer-events-none fill-foreground font-sans"
                      style={{ fontSize: 11, fontWeight: 600 }}
                    >
                      {n.label.length > 22 ? `${n.label.slice(0, 21)}…` : n.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <span>
            Showing {visibleCount} of {nodes.length} items · {edges.length}{" "}
            connections
          </span>
          <span>Drag a dot to move it · scroll to zoom · drag the canvas to pan</span>
        </div>
      </div>

      {/* Inspector */}
      <div className="rounded-xl border border-border bg-card">
        {selectedNode ? (
          <div>
            <div className="flex items-start justify-between gap-2 border-b border-border p-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-md text-white"
                  style={{ background: KIND_META[selectedNode.kind].color }}
                >
                  {(() => {
                    const Icon = KIND_META[selectedNode.kind].icon;
                    return <Icon className="h-4.5 w-4.5" />;
                  })()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight text-foreground">
                    {selectedNode.label}
                  </p>
                  <p className="entity-id">{selectedNode.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <Badge variant="secondary">
                  {KIND_META[selectedNode.kind].label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedNode.sublabel}
              </p>
              <div>
                <p className="section-label mb-1.5">
                  Connections ({selectedEdges.length})
                </p>
                <div className="space-y-1">
                  {selectedEdges.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No relationships yet.
                    </p>
                  )}
                  {selectedEdges.map((e) => {
                    const otherId =
                      e.source === selectedNode.id ? e.target : e.source;
                    const other = nodeById.get(otherId);
                    if (!other) return null;
                    return (
                      <Link
                        key={e.id}
                        href={`/relationships/${e.id}`}
                        className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 transition-colors hover:bg-muted"
                      >
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: KIND_META[other.kind].color }}
                        />
                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                          {other.label}
                        </span>
                        {e.scoreLabel && (
                          <span className="entity-id">{e.scoreLabel}</span>
                        )}
                        <span
                          className={cn(
                            "text-[10px] font-medium",
                            e.active ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {e.active ? "Active" : "Past"}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
              {selectedNode.href && (
                <Link
                  href={selectedNode.href}
                  className={cn(buttonVariants({ size: "sm" }), "w-full")}
                >
                  Open company file
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <p className="section-label mb-2">How to read this map</p>
            <p className="text-sm text-muted-foreground">
              Every dot is something you manage. Lines show who is working with
              whom. Click any dot to inspect it.
            </p>
            <div className="mt-4 space-y-2">
              {(Object.keys(KIND_META) as NodeKind[]).map((kind) => (
                <div key={kind} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: KIND_META[kind].color }}
                  />
                  <span className="text-xs text-foreground">
                    {KIND_META[kind].plural}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <span className="h-0.5 w-6 rounded bg-primary" />
                <span className="text-xs text-foreground">
                  Active relationship
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-0 w-6 border-t-2 border-dashed"
                  style={{ borderColor: "#94a3b8" }}
                />
                <span className="text-xs text-foreground">
                  Past relationship
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
