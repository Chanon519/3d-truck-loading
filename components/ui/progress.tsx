import type { BadgeTone } from "@/lib/labels";

// map class เต็มทุกโทน — ห้ามประกอบ class แบบ dynamic string (Tailwind 4)
// ใช้เฉด "muted" ให้เข้าธีม editorial ของ Shade แต่ยังแยกสถานะได้ชัดเจน
const BAR_TONE: Record<BadgeTone, string> = {
  blue: "bg-[#5C7CB0]",
  sky: "bg-[#5FA8C7]",
  emerald: "bg-[#4E9C7C]",
  amber: "bg-[#C98A3A]",
  red: "bg-[#C1544F]",
  slate: "bg-[#8A8A8C]",
  violet: "bg-charcoal-ink",
  orange: "bg-orange",
};

export function ProgressBar({
  value,
  tone = "blue",
  className,
}: {
  value: number;
  tone?: BadgeTone;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-bone ${className ?? ""}`}
    >
      <div
        className={`h-full rounded-full ${BAR_TONE[tone]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
