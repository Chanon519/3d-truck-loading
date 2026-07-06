"use client";

// Modal มอบหมายคนขับให้งาน — เลือกได้เฉพาะคนขับสถานะ "พร้อมรับงาน"

import { useState } from "react";
import type { Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/select-field";
import { useToast } from "@/components/ui/toast";
import { useJobsStore } from "@/lib/store/jobs-store";
import { DRIVERS, driverName } from "@/lib/mock/drivers";

const READY_DRIVERS = DRIVERS.filter((d) => d.status === "ready");

const DRIVER_OPTIONS = READY_DRIVERS.map((d) => ({
  value: d.id,
  label: `${d.name} — ${d.code}`,
}));

export function AssignDriverModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const assignDriver = useJobsStore((s) => s.assignDriver);
  const { toast } = useToast();
  const [driverId, setDriverId] = useState(READY_DRIVERS[0]?.id ?? "");

  const confirm = () => {
    if (!driverId) return;
    assignDriver(job.id, driverId);
    toast(
      `มอบหมายคนขับ ${driverName(driverId)} ให้งาน ${job.jobNo} เรียบร้อย`,
      "success"
    );
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="มอบหมายคนขับ"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={confirm} disabled={!driverId}>
            ยืนยันมอบหมาย
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <p className="font-mono text-sm font-medium text-slate-900">
            {job.jobNo}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">{job.customer}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            คนขับปัจจุบัน: {driverName(job.driverId)}
          </p>
        </div>

        {DRIVER_OPTIONS.length > 0 ? (
          <SelectField
            label="เลือกคนขับ (เฉพาะคนขับสถานะพร้อมรับงาน)"
            value={driverId}
            onChange={setDriverId}
            options={DRIVER_OPTIONS}
          />
        ) : (
          <p className="text-sm text-slate-500">
            ไม่มีคนขับสถานะพร้อมรับงานในขณะนี้
          </p>
        )}
      </div>
    </Modal>
  );
}
