// ===== timeline 3 จุดของงานทอยตู้: รับตู้ → กำลังเคลื่อนย้าย → วางตู้เรียบร้อย =====
// ไฮไลต์จุดตามสถานะงานปัจจุบัน
import { Check } from "lucide-react";
import type { JobStatus } from "@/lib/types";

type ActiveTone = "violet" | "sky" | "amber" | "red";

// สถานะงาน → จำนวนขั้นที่ "เสร็จแล้ว" + โทนสีของขั้นที่กำลังทำอยู่ (null = ไม่มีขั้น active)
const STATUS_STEP: Record<JobStatus, { done: number; active: ActiveTone | null }> = {
  pending: { done: 0, active: null },
  assigned: { done: 0, active: "violet" },
  in_progress: { done: 1, active: "sky" },
  delayed: { done: 1, active: "amber" },
  problem: { done: 1, active: "red" },
  completed: { done: 3, active: null },
};

// map class เต็มทุกโทน — ห้ามประกอบ class แบบ dynamic string (Tailwind 4)
const ACTIVE_DOT: Record<ActiveTone, string> = {
  violet: "bg-violet-500 ring-4 ring-violet-100",
  sky: "bg-sky-500 ring-4 ring-sky-100",
  amber: "bg-amber-500 ring-4 ring-amber-100",
  red: "bg-red-500 ring-4 ring-red-100",
};

const ACTIVE_TEXT: Record<ActiveTone, string> = {
  violet: "text-violet-700",
  sky: "text-sky-700",
  amber: "text-amber-700",
  red: "text-red-700",
};

const ACTIVE_LINE: Record<ActiveTone, string> = {
  violet: "bg-violet-200",
  sky: "bg-sky-200",
  amber: "bg-amber-200",
  red: "bg-red-200",
};

export function ShuttleTimeline({
  status,
  fromLabel,
  toLabel,
}: {
  status: JobStatus;
  fromLabel?: string;
  toLabel?: string;
}) {
  const { done, active } = STATUS_STEP[status];
  const steps: { label: string; sub?: string }[] = [
    { label: "รับตู้", sub: fromLabel },
    { label: "กำลังเคลื่อนย้าย" },
    { label: "วางตู้เรียบร้อย", sub: toLabel },
  ];

  return (
    <div className="flex">
      {steps.map((step, i) => {
        const isDone = i < done;
        const isActive = i === done && active !== null;
        return (
          <div key={step.label} className="relative flex flex-1 flex-col items-center">
            {/* เส้นเชื่อมจากจุดก่อนหน้า */}
            {i > 0 && (
              <div
                className={`absolute right-1/2 top-[13px] h-0.5 w-full ${
                  isDone
                    ? "bg-emerald-400"
                    : isActive && active
                      ? ACTIVE_LINE[active]
                      : "bg-slate-200"
                }`}
              />
            )}
            {/* จุดสถานะ */}
            <div
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${
                isDone
                  ? "bg-emerald-500 text-white"
                  : isActive && active
                    ? ACTIVE_DOT[active]
                    : "border-2 border-slate-200 bg-white"
              }`}
            >
              {isDone ? (
                <Check className="h-4 w-4" />
              ) : isActive ? (
                <span className="h-2 w-2 rounded-full bg-white" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              )}
            </div>
            <p
              className={`mt-2 text-center text-xs ${
                isDone
                  ? "text-slate-600"
                  : isActive && active
                    ? `font-medium ${ACTIVE_TEXT[active]}`
                    : "text-slate-400"
              }`}
            >
              {step.label}
            </p>
            {step.sub && (
              <p className="mt-0.5 text-center font-mono text-[11px] text-slate-400">
                {step.sub}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
