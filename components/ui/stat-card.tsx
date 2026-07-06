import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { BadgeTone } from "@/lib/labels";

// map class เต็มทุกโทน — ห้ามประกอบ class แบบ dynamic string (Tailwind 4)
const ICON_TONE: Record<BadgeTone, string> = {
  blue: "bg-blue-50 text-blue-600",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  slate: "bg-slate-100 text-slate-600",
  violet: "bg-[#e8eef6] text-charcoal-ink", // navy
  orange: "bg-orange-50 text-orange-600",
};

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "blue",
  href,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: LucideIcon;
  tone?: BadgeTone;
  href?: string;
}) {
  const content = (
    <div
      className={`flex h-full items-center gap-4 rounded-cards border border-hairline bg-white p-4 transition-colors ${
        href ? "hover:border-deep-charcoal" : ""
      }`}
    >
      {Icon && (
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-inputs ${ICON_TONE[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-mid">{label}</p>
        <p className="text-2xl font-semibold text-charcoal-ink">{value}</p>
        {sub && <p className="mt-0.5 truncate text-xs text-slate-mid">{sub}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }
  return content;
}
