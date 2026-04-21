import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type InfoHintProps = {
  label: string;
  className?: string;
};

export function InfoHint({ label, className }: InfoHintProps) {
  return (
    <span className="group relative inline-flex">
      <span
        tabIndex={0}
        aria-label={label}
        className={cn(
          "inline-flex size-4 items-center justify-center rounded-full text-slate-400 opacity-80 transition outline-none hover:opacity-100 focus:opacity-100",
          className,
        )}
      >
        <Info className="size-3.5" />
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full left-1/2 z-20 mt-2 hidden w-56 -translate-x-1/2 rounded-xl bg-slate-950 px-3 py-2 text-left text-xs leading-5 text-white shadow-lg group-focus-within:block group-hover:block"
      >
        {label}
      </span>
    </span>
  );
}
