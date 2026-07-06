// ===== แถบอธิบายสีของ Yard Map =====
import { SLOT_STATUS_LABEL } from "@/lib/labels";

// swatch แต่ละแบบเขียน class เต็ม — ห้ามประกอบ class แบบ dynamic string (Tailwind 4)
const LEGEND_ITEMS: { label: string; swatchClass: string }[] = [
  {
    label: SLOT_STATUS_LABEL.empty,
    swatchClass: "bg-white border-dashed border-slate-300",
  },
  { label: "มีรถจอด", swatchClass: "bg-sky-50 border-sky-400" },
  { label: "มีตู้ Container", swatchClass: "bg-blue-50 border-blue-500" },
  {
    label: SLOT_STATUS_LABEL.reserved,
    swatchClass: "bg-violet-50 border-violet-400",
  },
  {
    label: SLOT_STATUS_LABEL.blocked,
    swatchClass: "bg-slate-100 border-slate-300",
  },
  {
    label: SLOT_STATUS_LABEL.problem,
    swatchClass: "bg-red-50 border-red-400",
  },
];

export function YardLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className={`h-3.5 w-5 shrink-0 rounded border-2 ${item.swatchClass}`}
            aria-hidden="true"
          />
          <span className="text-xs text-slate-mid">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
