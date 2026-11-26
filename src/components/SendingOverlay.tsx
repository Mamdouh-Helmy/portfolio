// src/components/SendingOverlay.tsx
const css = `
@keyframes plane-fly { 0%,100% { transform: translate(-14px, 6px) rotate(-8deg) } 50% { transform: translate(14px, -10px) rotate(6deg) } }
@keyframes trail-move { to { stroke-dashoffset: -32 } }
@keyframes dot-hop { 0%,80%,100% { transform: translateY(0); opacity: .35 } 40% { transform: translateY(-8px); opacity: 1 } }
.plane-fly { animation: plane-fly 1.8s ease-in-out infinite }
.trail-move { animation: trail-move .8s linear infinite }
.dot-hop { animation: dot-hop 1.1s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) { .plane-fly, .trail-move, .dot-hop { animation: none } }
`;

export function SendingOverlay({ phase, sendingText, sentText }: { phase: "sending" | "sent"; sendingText: string; sentText: string }) {
  return (
    <div className="modal-fade-in absolute inset-0 z-10 grid place-items-center rounded-2xl bg-cream/95 p-6 text-center backdrop-blur-sm">
      <style href="sending-overlay" precedence="default">{css}</style>

      {phase === "sending" ? (
        <div key="sending" className="swap">
          <div className="relative mx-auto grid size-40 place-items-center">
            <span aria-hidden className="pulse-ring absolute size-24 rounded-full" />
            <span aria-hidden className="sun absolute size-24 rounded-full" />
            <svg aria-hidden viewBox="0 0 160 160" className="absolute inset-0 rtl:-scale-x-100">
              <path className="trail-move" d="M6 128 C 40 150, 50 92, 66 92" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeDasharray="8 8" strokeLinecap="round" />
              <g className="plane-fly" style={{ transformOrigin: "80px 80px" }}>
                <path d="M46 78 L124 46 L98 118 L82 92 Z" fill="var(--color-cream)" stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" />
                <path d="M82 92 L124 46" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
              </g>
            </svg>
          </div>
          <p className="font-display mt-3 text-2xl">{sendingText}</p>
          <div aria-hidden className="mt-3 flex justify-center gap-2">
            {[0, 1, 2].map((i) => <span key={i} className="dot-hop size-2.5 rounded-full bg-terra" style={{ animationDelay: `${i * 0.15}s` }} />)}
          </div>
        </div>
      ) : (
        <div key="sent" className="swap">
          <div className="stamp-in mx-auto grid size-28 place-items-center rounded-full border-4 border-dashed border-terra text-terra">
            <svg aria-hidden viewBox="0 0 24 24" className="size-14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path className="check-path" d="M4 12.5 9.5 18 20 6.5" />
            </svg>
          </div>
          <p className="font-display mt-5 text-2xl">{sentText}</p>
          <span aria-hidden className="squiggle mx-auto mt-3 block w-28" />
        </div>
      )}
    </div>
  );
}