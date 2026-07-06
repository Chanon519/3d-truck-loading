"use client";

// ===== แถบสรุปด้านบน (overlay) ของ workspace จัดของเข้าตู้ 3D =====
// แบบกะทัดรัด ลอยอยู่เหนือพื้นที่ 3D — เลข Container, ประเภทตู้, metric สั้น ๆ, สถานะแผน
import { Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePackingStore } from "@/lib/store/packing-store";
import { CONTAINER_SPECS } from "@/lib/container-specs";
import { DEMO_CONTAINER_NO } from "@/lib/mock/packing-orders";
import {
  PLAN_STATUS_LABEL,
  PLAN_STATUS_TONE,
  formatNumber,
} from "@/lib/labels";
import type { BadgeTone } from "@/lib/labels";

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

function Metric({
  label,
  value,
  percent,
  tone,
}: {
  label: string;
  value: string;
  percent?: number;
  tone?: BadgeTone;
}) {
  return (
    <div className="min-w-[86px] rounded-inputs bg-bone px-2.5 py-1.5">
      <p className="text-[10px] leading-none text-slate-mid">{label}</p>
      <p className="mt-0.5 text-xs font-semibold text-charcoal-ink">{value}</p>
      {typeof percent === "number" && (
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-hairline/50">
          <div
            className={`h-full rounded-full ${BAR_TONE[tone ?? "blue"]}`}
            style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function WorkspaceTopBar({ trailing }: { trailing?: React.ReactNode }) {
  const containerType = usePackingStore((s) => s.containerType);
  const planStatus = usePackingStore((s) => s.planStatus);
  const result = usePackingStore((s) => s.result);
  const activeItems = usePackingStore((s) => s.activeItems);

  const spec = CONTAINER_SPECS[containerType];

  const usedWeight = result?.usedWeightKg ?? 0;
  const weightPct = result?.weightPercent ?? 0;
  const usedVolume = result?.usedVolumeM3 ?? 0;
  const volumePct = result?.volumePercent ?? 0;
  const packedBoxes = result?.packed.length ?? 0;
  const totalBoxes = activeItems.reduce((sum, item) => sum + item.qty, 0);

  const weightTone: BadgeTone =
    weightPct > 90 ? "red" : weightPct > 70 ? "amber" : "emerald";

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-x-3 gap-y-2 rounded-cards border border-hairline bg-white/85 px-3 py-2 shadow-card backdrop-blur-md">
      {/* ชื่อหน้า + เลขตู้ */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-inputs bg-charcoal-ink text-white">
          <Box className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight text-charcoal-ink">
            จัดของเข้า Container 3D
          </p>
          <p className="truncate text-xs text-slate-mid">
            {DEMO_CONTAINER_NO} · {spec.label}
          </p>
        </div>
      </div>

      <span className="mx-1 hidden h-9 w-px bg-hairline lg:block" />

      {/* metric สั้น ๆ */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Metric
          label="น้ำหนักใช้แล้ว"
          value={`${formatNumber(Math.round(usedWeight))} กก.`}
          percent={weightPct}
          tone={weightTone}
        />
        <Metric
          label="ปริมาตรใช้แล้ว"
          value={`${usedVolume.toFixed(1)} ลบ.ม.`}
          percent={volumePct}
          tone="sky"
        />
        <Metric
          label="พื้นที่คงเหลือ"
          value={`${Math.max(0, Math.round(100 - volumePct))}%`}
        />
        <Metric
          label="สินค้าที่จัดแล้ว"
          value={`${formatNumber(packedBoxes)}/${formatNumber(totalBoxes)}`}
        />
      </div>

      {/* สถานะ + ตัวเลือกตู้ */}
      <div className="ml-auto flex items-center gap-2">
        <Badge tone={PLAN_STATUS_TONE[planStatus]}>
          {PLAN_STATUS_LABEL[planStatus]}
        </Badge>
        {trailing}
      </div>
    </div>
  );
}
