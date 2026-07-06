"use client";

// Donut chart สัดส่วนประเภทงานวันนี้ (งานตู้ / งานทั่วไป / งานทอยตู้)
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { JobType } from "@/lib/types";
import { JOB_TYPE_LABEL, formatNumber } from "@/lib/labels";

// สีประจำประเภทงาน — ตรงกับโทน badge ใน lib/labels.ts (container=blue, general=violet, shuttle=sky)
// ใช้เฉด muted ให้เข้าธีม editorial แต่ยังแยกสถานะได้ชัดเจน
const TYPE_COLOR: Record<JobType, string> = {
  container: "#2563EB", // action blue
  general: "#2e6c87", // theme color
  shuttle: "#5FA8C7", // sky muted
};

const JOB_TYPES: JobType[] = ["container", "general", "shuttle"];

interface DonutDatum {
  name: string;
  value: number;
  color: string;
}

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="rounded-cards border border-hairline bg-white px-3 py-2 text-xs shadow-overlay">
      <span className="font-medium text-charcoal-ink">{item.name}</span>{" "}
      <span className="text-slate-mid">
        {formatNumber(Number(item.value ?? 0))} งาน
      </span>
    </div>
  );
}

export function JobTypeDonut({ counts }: { counts: Record<JobType, number> }) {
  const total = JOB_TYPES.reduce((sum, t) => sum + counts[t], 0);
  const data: DonutDatum[] = JOB_TYPES.map((t) => ({
    name: JOB_TYPE_LABEL[t],
    value: counts[t],
    color: TYPE_COLOR[t],
  }));

  return (
    <div>
      <div className="relative h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* ตัวเลขรวมตรงกลาง donut */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-semibold text-charcoal-ink">
            {formatNumber(total)}
          </p>
          <p className="text-xs text-slate-mid">งานวันนี้</p>
        </div>
      </div>

      {/* legend พร้อมจำนวนและสัดส่วน */}
      <ul className="mt-3 space-y-1.5">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="flex-1 text-slate-mid">{d.name}</span>
            <span className="font-medium text-charcoal-ink">
              {formatNumber(d.value)} งาน
            </span>
            <span className="w-10 text-right text-xs text-slate-mid">
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
