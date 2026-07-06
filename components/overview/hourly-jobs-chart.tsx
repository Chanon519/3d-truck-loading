"use client";

// Bar chart จำนวนงานตามช่วงเวลานัดหมายของวันนี้
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/labels";

export interface HourlyBucket {
  label: string; // ป้ายแกน X เช่น "06-09"
  rangeLabel: string; // ป้ายเต็มใน tooltip เช่น "ช่วง 06:00–09:00 น."
  count: number;
}

function BarTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string; payload?: HourlyBucket }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const bucket = payload[0].payload;
  return (
    <div className="rounded-cards border border-hairline bg-white px-3 py-2 text-xs shadow-overlay">
      <p className="font-medium text-charcoal-ink">{bucket?.rangeLabel}</p>
      <p className="mt-0.5 text-slate-mid">
        {formatNumber(Number(payload[0].value ?? 0))} งาน
      </p>
    </div>
  );
}

export function HourlyJobsChart({ data }: { data: HourlyBucket[] }) {
  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#717173" }}
          />
          <YAxis
            allowDecimals={false}
            width={28}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#717173" }}
          />
          <Tooltip content={<BarTip />} cursor={{ fill: "#eef2f6" }} />
          <Bar
            dataKey="count"
            fill="#2e6c87"
            radius={[6, 6, 0, 0]}
            maxBarSize={44}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
