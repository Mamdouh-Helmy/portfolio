"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** أي لينك بيبدأ بـ # يتحرك ليه بسكرول ناعم وبطيء */
function Anchors() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute("href") ?? "";
      if (hash.length < 2) return;
      const el = document.querySelector<HTMLElement>(hash);
      if (!el) return;
      e.preventDefault();
      const top = hash === "#home";
      lenis.scrollTo(top ? 0 : el, { offset: top ? 0 : -88, duration: 1.8, easing: easeInOut });
      history.pushState(null, "", hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis]);
  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const options = useMemo(
    () => ({ lerp: reduced ? 1 : 0.07, wheelMultiplier: 0.8, touchMultiplier: 1.1, smoothWheel: !reduced }),
    [reduced],
  );

  return (
    <ReactLenis root options={options}>
      <Anchors />
      {children}
    </ReactLenis>
  );
}