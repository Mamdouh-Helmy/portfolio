"use client";
import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 2400) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const run = () => {
      cancelAnimationFrame(raf);
      if (reduce) return setProgress(1);
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        setProgress(1 - Math.pow(1 - p, 4)); // easeOutQuart
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) run();
        else {
          cancelAnimationFrame(raf);
          setProgress(0);
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [duration]);

  return { ref, value: Math.round(target * progress), progress };
}