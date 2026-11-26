import { chipShape } from "./design";

function toolChipClass(tool: string, index: number) {
  if (tool === "TypeScript") return "-rotate-2 rounded-full border-ink bg-ink text-cream";
  if (tool === "MongoDB") return "rotate-2 rounded-full border-terra bg-terra text-cream";
  return chipShape[index % chipShape.length];
}

export function ToolRow({ list, reverse }: { list: string[]; reverse?: boolean }) {
  return (
    <div dir="ltr" className="min-w-0 overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <ul className={`${reverse ? "marquee-rev" : "marquee"} flex w-max gap-3 sm:gap-4`}>
        {list.map((tool, i) => (
          <li
            key={i}
            className={`whitespace-nowrap border px-4 py-2 text-xs font-bold transition-transform duration-300 hover:-translate-y-1 hover:rotate-0 sm:px-6 sm:py-3 sm:text-sm ${toolChipClass(tool, i)}`}
          >
            {tool}
          </li>
        ))}
      </ul>
    </div>
  );
}