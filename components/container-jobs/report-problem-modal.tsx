"use client";

// Modal รายงานปัญหา — กรอกข้อความปัญหา แล้วตั้งสถานะงานเป็น "มีปัญหา"
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { Job } from "@/lib/types";
import { useJobsStore } from "@/lib/store/jobs-store";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ReportProblemModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const updateJob = useJobsStore((s) => s.updateJob);
  const { toast } = useToast();
  const [text, setText] = useState(job.problem ?? "");

  function confirm() {
    const problem = text.trim();
    if (!problem) return;
    updateJob(job.id, { status: "problem", problem });
    toast("บันทึกปัญหาแล้ว", "error");
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`รายงานปัญหา — ${job.jobNo}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="danger" onClick={confirm} disabled={!text.trim()}>
            บันทึกปัญหา
          </Button>
        </>
      }
    >
      <div className="mb-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          เมื่อบันทึกแล้ว งานนี้จะถูกเปลี่ยนสถานะเป็น &quot;มีปัญหา&quot; ทันที
        </span>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-500">
          รายละเอียดปัญหา
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          autoFocus
          placeholder="อธิบายปัญหาที่พบ เช่น รถเสียกลางทาง ตู้เสียหาย เอกสารไม่ครบ..."
          className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
        />
      </label>
    </Modal>
  );
}
