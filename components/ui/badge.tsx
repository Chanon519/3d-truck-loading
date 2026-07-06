import type { BadgeTone } from "@/lib/labels";

// map class เต็มทุกโทน — ห้ามประกอบ class แบบ dynamic string (Tailwind 4)
const TONE_CLASS: Record<BadgeTone, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-600/25",
  sky: "bg-sky-50 text-sky-700 border-sky-600/25",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-600/25",
  amber: "bg-amber-50 text-amber-700 border-amber-600/25",
  red: "bg-red-50 text-red-700 border-red-600/25",
  slate: "bg-slate-100 text-slate-600 border-slate-400/25",
  violet: "bg-lavender-trace text-navy border-navy/20", // theme chip
  orange: "bg-orange-50 text-orange-700 border-orange-500/30",
};

export function Badge({
  tone,
  children,
  className,
}: {
  tone: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-smallchips border px-2.5 py-0.5 text-xs font-medium ${TONE_CLASS[tone]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
