"use client";
import { useEffect, useRef, type ReactNode } from "react";

type Point = { x: number; y: number };

/* أقل مسافة بين التذكرة وحافة الشاشة وهي بتتسحب */
const EDGE = 8;

/** قراءة الإزاحة الحالية (translate) للعنصر، حتى لو لسه في نص الارتداد */
const currentShift = (el: HTMLElement): Point => {
  const raw = getComputedStyle(el).translate;
  if (!raw || raw === "none") return { x: 0, y: 0 };
  const [x = "0", y = "0"] = raw.split(" ");
  return { x: parseFloat(x) || 0, y: parseFloat(y) || 0 };
};

/** خيوط بين التذاكر: من فتحة لفتحة جنب بعض، ومن تحت لفوق لما يبقوا فوق بعض */
export function StubChain({ children, className = "" }: { children: ReactNode; className?: string }) {
  const board = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = board.current;
    const layer = svg.current;
    if (!root || !layer) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-stub]"));
    const groups = Array.from(layer.querySelectorAll("g"));

    // النقط دي عناصر جوه التذكرة، فبتتحرك وتلف معاها
    const point = (item: HTMLElement, side: string, origin: DOMRect): Point => {
      const r = item.querySelector(`[data-pin="${side}"]`)!.getBoundingClientRect();
      return { x: r.x - origin.x, y: r.y - origin.y };
    };

    const draw = () => {
      const origin = root.getBoundingClientRect();
      groups.forEach((g, i) => {
        const a = items[i];
        const b = items[i + 1];
        if (!a || !b) return;
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const stacked = Math.abs(ra.x - rb.x) < ra.width / 2;
        const forward = rb.x > ra.x;
        const p = point(a, stacked ? "bottom" : forward ? "right" : "left", origin);
        const q = point(b, stacked ? "top" : forward ? "left" : "right", origin);
        const mx = (p.x + q.x) / 2;
        const my = (p.y + q.y) / 2;
        const bend = i % 2 ? -28 : 28;
        const d = stacked
          ? `M${p.x} ${p.y} Q${mx + bend} ${my} ${q.x} ${q.y}`
          : `M${p.x} ${p.y} C${mx} ${p.y + 22} ${mx} ${q.y + 22} ${q.x} ${q.y}`;
        const [path, start, end] = Array.from(g.children);
        path.setAttribute("d", d);
        start.setAttribute("cx", String(p.x));
        start.setAttribute("cy", String(p.y));
        end.setAttribute("cx", String(q.x));
        end.setAttribute("cy", String(q.y));
      });
    };

    // الرسم شغال بس والقسم ظاهر على الشاشة
    let frame = 0;
    const loop = () => {
      draw();
      frame = requestAnimationFrame(loop);
    };
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting) loop();
    });
    observer.observe(root);

    // سحب التذكرة، ولما تسيبها ترجع بنطة
    const cleanups = items.map((item) => {
      let from: Point | null = null;
      let base: Point = { x: 0, y: 0 }; // الإزاحة وقت اللمس
      let rect0: DOMRect | null = null; // مكان التذكرة وقت اللمس

      const down = (e: PointerEvent) => {
        item.style.transition = "none";
        from = { x: e.clientX, y: e.clientY };
        base = currentShift(item);
        rect0 = item.getBoundingClientRect();
        item.setPointerCapture(e.pointerId);
      };

      const move = (e: PointerEvent) => {
        if (!from || !rect0) return;
        let tx = base.x + (e.clientX - from.x) * 0.6;
        const ty = base.y + (e.clientY - from.y) * 0.6;

        // مكان التذكرة لو طبّقنا الإزاحة دي، ونقصّها عشان متخرجش برّه عرض الشاشة
        const limit = document.documentElement.clientWidth;
        const left = rect0.left + (tx - base.x);
        const right = rect0.right + (tx - base.x);
        if (left < EDGE) tx += EDGE - left;
        else if (right > limit - EDGE) tx -= right - (limit - EDGE);

        item.style.translate = `${tx}px ${ty}px`;
      };

      const up = () => {
        from = null;
        rect0 = null;
        item.style.transition = "translate .7s cubic-bezier(.2, 1.8, .4, 1)";
        item.style.translate = "0px 0px";
      };

      item.addEventListener("pointerdown", down);
      item.addEventListener("pointermove", move);
      item.addEventListener("pointerup", up);
      item.addEventListener("pointercancel", up);
      return () => {
        item.removeEventListener("pointerdown", down);
        item.removeEventListener("pointermove", move);
        item.removeEventListener("pointerup", up);
        item.removeEventListener("pointercancel", up);
      };
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div ref={board} className={`relative isolate ${className}`}>
      <svg ref={svg} aria-hidden className="pointer-events-none absolute inset-0 -z-10 size-full overflow-visible text-terra">
        {[0, 1].map((i) => (
          <g key={i} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path fill="none" />
            <circle r="6" fill="currentColor" stroke="none" />
            <circle r="6" fill="currentColor" stroke="none" />
          </g>
        ))}
      </svg>
      {children}
    </div>
  );
}