"use client";

// Modal สร้างแผนจากงานที่เลือกไว้ในหน้าจัดการงาน
import { useMemo, useState } from "react";
import { Boxes, Container, ArrowRightLeft, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Job, JobType } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { JOB_TYPE_LABEL, formatNumber } from "@/lib/labels";

const TYPE_ICON: Record<JobType, LucideIcon> = {
  container: Container,
  general: Boxes,
  shuttle: ArrowRightLeft,
};

// ชื่อแผนเริ่มต้น เช่น "แผน 6 ก.ค. 14:30"
function defaultPlanName(): string {
  const now = new Date();
  const date = now.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
  const time = now.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `แผน ${date} ${time}`;
}

export function CreatePlanModal({
  open,
  jobs,
  onClose,
  onConfirm,
}: {
  open: boolean;
  jobs: Job[]; // งานที่เลือกไว้
  onClose: () => void;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState(() => defaultPlanName());

  const counts = useMemo(() => {
    const byType = (t: JobType) => jobs.filter((j) => j.type === t).length;
    return {
      container: byType("container"),
      general: byType("general"),
      shuttle: byType("shuttle"),
    };
  }, [jobs]);

  const groups = (Object.keys(counts) as JobType[]).filter(
    (t) => counts[t] > 0
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="สร้างแผนใหม่"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            variant="orange"
            disabled={jobs.length === 0}
            onClick={() => onConfirm(name)}
          >
            <Sparkles className="h-4 w-4" />
            สร้างแผน
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="plan-name"
            className="mb-1 block text-xs font-medium text-slate-mid"
          >
            ชื่อแผน
          </label>
          <input
            id="plan-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ตั้งชื่อแผน"
            className="w-full rounded-inputs border border-hairline bg-white px-3 py-2 text-sm text-charcoal-ink outline-none focus:border-deep-charcoal"
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-slate-mid">
            งานที่จะรวมในแผน — {formatNumber(jobs.length)} งาน
          </p>
          <div className="space-y-2">
            {groups.map((t) => {
              const Icon = TYPE_ICON[t];
              return (
                <div
                  key={t}
                  className="flex items-center justify-between rounded-inputs border border-hairline bg-bone px-3 py-2"
                >
                  <span className="flex items-center gap-2 text-sm text-charcoal-ink">
                    <Icon className="h-4 w-4 text-slate-mid" />
                    {JOB_TYPE_LABEL[t]}
                  </span>
                  <span className="text-sm font-semibold text-charcoal-ink">
                    {formatNumber(counts[t])} งาน
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-slate-mid">
          หลังสร้างแผน คุณจะจัดของเข้าตู้และจัดรถให้แต่ละงานได้
          (ก่อนหรือหลังก็ได้) แล้วจึงกด “นำแผนไปใช้”
        </p>
      </div>
    </Modal>
  );
}
