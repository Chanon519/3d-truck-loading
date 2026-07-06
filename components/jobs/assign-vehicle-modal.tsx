"use client";

// Modal มอบหมายรถให้งาน — เลือกได้เฉพาะรถสถานะ "พร้อมใช้งาน"

import { useState } from "react";
import type { Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/select-field";
import { useToast } from "@/components/ui/toast";
import { useJobsStore } from "@/lib/store/jobs-store";
import { VEHICLES, vehiclePlate } from "@/lib/mock/vehicles";
import { VEHICLE_TYPE_LABEL } from "@/lib/labels";

const AVAILABLE_VEHICLES = VEHICLES.filter((v) => v.status === "available");

const VEHICLE_OPTIONS = AVAILABLE_VEHICLES.map((v) => ({
  value: v.id,
  label: `${v.plate} — ${VEHICLE_TYPE_LABEL[v.type]}`,
}));

export function AssignVehicleModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const assignVehicle = useJobsStore((s) => s.assignVehicle);
  const { toast } = useToast();
  const [vehicleId, setVehicleId] = useState(AVAILABLE_VEHICLES[0]?.id ?? "");

  const confirm = () => {
    if (!vehicleId) return;
    assignVehicle(job.id, vehicleId);
    toast(
      `มอบหมายรถ ${vehiclePlate(vehicleId)} ให้งาน ${job.jobNo} เรียบร้อย`,
      "success"
    );
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="มอบหมายรถ"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={confirm} disabled={!vehicleId}>
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
            รถปัจจุบัน: {vehiclePlate(job.vehicleId)}
          </p>
        </div>

        {VEHICLE_OPTIONS.length > 0 ? (
          <SelectField
            label="เลือกรถ (เฉพาะรถสถานะพร้อมใช้งาน)"
            value={vehicleId}
            onChange={setVehicleId}
            options={VEHICLE_OPTIONS}
          />
        ) : (
          <p className="text-sm text-slate-500">
            ไม่มีรถสถานะพร้อมใช้งานในขณะนี้
          </p>
        )}
      </div>
    </Modal>
  );
}
