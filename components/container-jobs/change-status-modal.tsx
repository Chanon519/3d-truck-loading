"use client";

// Modal เปลี่ยนสถานะงาน — เลือกสถานะใหม่จากรายการทั้งหมด
import { useState } from "react";
import { Check } from "lucide-react";
import type { Job, JobStatus } from "@/lib/types";
import { JOB_STATUS_LABEL, JOB_STATUS_TONE } from "@/lib/labels";
import { useJobsStore } from "@/lib/store/jobs-store";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const ALL_STATUSES = Object.keys(JOB_STATUS_LABEL) as JobStatus[];

export function ChangeStatusModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const updateJob = useJobsStore((s) => s.updateJob);
  const { toast } = useToast();
  const [status, setStatus] = useState<JobStatus>(job.status);

  function confirm() {
    // ถ้าย้ายออกจากสถานะ "มีปัญหา" ให้ล้างข้อความปัญหาออกด้วย
    updateJob(job.id, {
      status,
      problem: status === "problem" ? job.problem : undefined,
    });
    toast(
      `เปลี่ยนสถานะงาน ${job.jobNo} เป็น "${JOB_STATUS_LABEL[status]}" แล้ว`,
      "success"
    );
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`เปลี่ยนสถานะ — ${job.jobNo}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={confirm} disabled={status === job.status}>
            บันทึกสถานะ
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-slate-500">
        สถานะปัจจุบัน:{" "}
        <Badge tone={JOB_STATUS_TONE[job.status]}>
          {JOB_STATUS_LABEL[job.status]}
        </Badge>
      </p>

      <div className="space-y-2">
        {ALL_STATUSES.map((s) => {
          const selected = s === status;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left transition-colors ${
                selected
                  ? "border-charcoal-ink bg-bone ring-2 ring-charcoal-ink/15"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <Badge tone={JOB_STATUS_TONE[s]}>{JOB_STATUS_LABEL[s]}</Badge>
              {selected && <Check className="h-4 w-4 shrink-0 text-blue-600" />}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
