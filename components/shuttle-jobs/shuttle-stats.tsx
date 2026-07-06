// ===== StatCard สรุปงานทอยตู้ 4 ใบ =====
import { ArrowLeftRight, CircleCheck, Clock, Forklift } from "lucide-react";
import type { Job } from "@/lib/types";
import { JOB_STATUS_LABEL, formatNumber } from "@/lib/labels";
import { StatCard } from "@/components/ui/stat-card";

// เทียบเฉพาะวันที่ (ตาม timezone เครื่อง) ว่าเป็นวันเดียวกับวันนี้หรือไม่
function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export function ShuttleStats({ jobs }: { jobs: Job[] }) {
  const todayCount = jobs.filter((j) => isToday(j.appointmentTime)).length;
  const pendingCount = jobs.filter((j) => j.status === "pending").length;
  const inProgressCount = jobs.filter((j) => j.status === "in_progress").length;
  const completedCount = jobs.filter((j) => j.status === "completed").length;
  const completedPercent =
    jobs.length > 0 ? Math.round((completedCount / jobs.length) * 100) : 0;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="งานทอยตู้วันนี้"
        value={formatNumber(todayCount)}
        sub={`ทั้งหมด ${formatNumber(jobs.length)} งาน`}
        icon={ArrowLeftRight}
        tone="blue"
      />
      <StatCard
        label={JOB_STATUS_LABEL.pending}
        value={formatNumber(pendingCount)}
        sub="รอมอบหมายรถและยืนยันรับงาน"
        icon={Clock}
        tone="amber"
      />
      <StatCard
        label="กำลังทอย"
        value={formatNumber(inProgressCount)}
        sub="อยู่ระหว่างเคลื่อนย้ายตู้"
        icon={Forklift}
        tone="sky"
      />
      <StatCard
        label={JOB_STATUS_LABEL.completed}
        value={formatNumber(completedCount)}
        sub={`คิดเป็น ${completedPercent}% ของงานทั้งหมด`}
        icon={CircleCheck}
        tone="emerald"
      />
    </div>
  );
}
