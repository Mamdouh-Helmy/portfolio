"use client";

import { createContext, useContext, useEffect, useMemo, useRef, type PointerEvent, type ReactNode } from "react";
import { ElasticEngine, type CordSpec } from "@/lib/elasticEngine";

const EngineContext = createContext<ElasticEngine | null>(null);

function useEngine() {
  const engine = useContext(EngineContext);
  if (!engine) throw new Error("ElasticNode must be rendered inside <ElasticBoard>");
  return engine;
}

type BoardProps = {
  /** Keep this array stable (module constant) so cords are not rebound on every render. */
  links: readonly CordSpec[];
  rtl?: boolean;
  className?: string;
  children: ReactNode;
};

/** A positioned area where `ElasticNode`s are joined by rubber-band cords drawn behind them. */
export function ElasticBoard({ links, rtl = false, className = "", children }: BoardProps) {
  const engine = useMemo(() => new ElasticEngine(), []);
  const boardRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => (boardRef.current ? engine.attach(boardRef.current) : undefined), [engine]);

  useEffect(() => {
    engine.rtl = rtl;
    engine.wake();
  }, [engine, rtl]);

  useEffect(() => {
    engine.setCords(
      links.flatMap((spec, i) => {
        const group = groupRefs.current[i];
        return group ? [{ spec, group }] : [];
      }),
    );
  }, [engine, links]);

  return (
    <EngineContext.Provider value={engine}>
      <div ref={boardRef} className={`relative isolate ${className}`}>
        <svg aria-hidden fill="none" className="pointer-events-none absolute inset-0 -z-10 size-full overflow-visible text-terra">
          {links.map((link, i) => (
            <g
              key={`${link.from}-${link.to}`}
              ref={(el) => {
                groupRefs.current[i] = el;
              }}
              stroke="currentColor"
              strokeLinecap="round"
            >
              <path />
              <circle fill="currentColor" stroke="none" r={0} />
              <circle fill="currentColor" stroke="none" r={0} />
            </g>
          ))}
        </svg>
        {children}
      </div>
    </EngineContext.Provider>
  );
}

type NodeProps = {
  id: string;
  /** Where the cord attaches, as fractions of the box: [start→end, top→bottom]. */
  anchor?: readonly [number, number];
  /** Non-draggable nodes still get pulled along by their cords. */
  draggable?: boolean;
  /** Pass the positioning classes here (absolute / relative, offsets, size). */
  className?: string;
  children: ReactNode;
};

export function ElasticNode({ id, anchor = [0.5, 0.5], draggable = true, className = "", children }: NodeProps) {
  const engine = useEngine();
  const ref = useRef<HTMLDivElement>(null);
  const [ax, ay] = anchor;

  useEffect(() => {
    if (!ref.current) return;
    return engine.register(id, ref.current, { anchor: { x: ax, y: ay }, draggable });
  }, [engine, id, ax, ay, draggable]);

  const dragHandlers = draggable
    ? {
        onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
          if (engine.startDrag(id, e)) e.currentTarget.setPointerCapture(e.pointerId);
        },
        onPointerMove: (e: PointerEvent<HTMLDivElement>) => engine.moveDrag(id, e),
        onPointerUp: () => engine.endDrag(id),
        onPointerCancel: () => engine.endDrag(id),
      }
    : {};

  const dragStyle = draggable ? "cursor-grab touch-pan-y select-none active:cursor-grabbing" : "";

  return (
    <div ref={ref} {...dragHandlers} className={`z-10 ${dragStyle} ${className}`}>
      {children}
    </div>
  );
}