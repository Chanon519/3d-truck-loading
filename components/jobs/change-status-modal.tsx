"use client";

// Modal เปลี่ยนสถานะงาน — เลือกสถานะใหม่จาก 6 สถานะมาตรฐาน

import { useState } from "react";
import type { Job, JobStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/select-field";
import { useToast } from "@/components/ui/toast";
import { useJobsStore } from "@/lib/store/jobs-store";
import { JOB_STATUS_LABEL, JOB_STATUS_TONE } from "@/lib/labels";

const STATUS_OPTIONS = (Object.keys(JOB_STATUS_LABEL) as JobStatus[]).map(
  (status) => ({
    value: status,
    label: JOB_STATUS_LABEL[status],
  })
);

export function ChangeStatusModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const setStatus = useJobsStore((s) => s.setStatus);
  const { toast } = useToast();
  const [newStatus, setNewStatus] = useState<JobStatus>(job.status);

  const confirm = () => {
    setStatus(job.id, newStatus);
    toast(
      `เปลี่ยนสถานะงาน ${job.jobNo} เป็น "${JOB_STATUS_LABEL[newStatus]}" เรียบร้อย`,
      "success"
    );
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="เปลี่ยนสถานะงาน"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={confirm}>ยืนยันเปลี่ยนสถานะ</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <p className="font-mono text-sm font-medium text-slate-900">
            {job.jobNo}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">{job.customer}</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            สถานะปัจจุบัน:
            <Badge tone={JOB_STATUS_TONE[job.status]}>
              {JOB_STATUS_LABEL[job.status]}
            </Badge>
          </div>
        </div>

        <SelectField
          label="สถานะใหม่"
          value={newStatus}
          onChange={(v) => setNewStatus(v as JobStatus)}
          options={STATUS_OPTIONS}
        />
      </div>
    </Modal>
  );
}
