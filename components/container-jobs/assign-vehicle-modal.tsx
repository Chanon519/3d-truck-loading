"use client";

// Modal มอบหมายรถ — แสดงเฉพาะหัวลาก (tractor) ที่พร้อมใช้งาน (available)
import { useState } from "react";
import { Truck } from "lucide-react";
import type { Job } from "@/lib/types";
import {
  VEHICLE_STATUS_LABEL,
  VEHICLE_STATUS_TONE,
  VEHICLE_TYPE_LABEL,
  formatNumber,
} from "@/lib/labels";
import { VEHICLES, vehiclePlate } from "@/lib/mock/vehicles";
import { depotName } from "@/lib/mock/depots";
import { useJobsStore } from "@/lib/store/jobs-store";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";

export function AssignVehicleModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const assignVehicle = useJobsStore((s) => s.assignVehicle);
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // เฉพาะหัวลากที่พร้อมใช้งานเท่านั้น
  const tractors = VEHICLES.filter(
    (v) => v.type === "tractor" && v.status === "available"
  );

  function confirm() {
    if (!selectedId) return;
    assignVehicle(job.id, selectedId);
    toast(
      `มอบหมายรถ ${vehiclePlate(selectedId)} ให้งาน ${job.jobNo} แล้ว`,
      "success"
    );
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`มอบหมายรถ — ${job.jobNo}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={confirm} disabled={!selectedId}>
            มอบหมายรถ
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-slate-500">
        แสดงเฉพาะหัวลากที่พร้อมใช้งาน
        {job.vehicleId && (
          <span className="ml-1">
            (รถปัจจุบัน: {vehiclePlate(job.vehicleId)})
          </span>
        )}
      </p>

      {tractors.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="ไม่มีหัวลากที่พร้อมใช้งาน"
          subtitle="รถทั้งหมดกำลังวิ่งงานหรืออยู่ระหว่างซ่อมบำรุง"
        />
      ) : (
        <div className="space-y-2">
          {tractors.map((v) => {
            const selected = v.id === selectedId;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedId(v.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  selected
                    ? "border-charcoal-ink bg-bone ring-2 ring-charcoal-ink/15"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{v.plate}</p>
                    <p className="truncate text-xs text-slate-500">
                      {VEHICLE_TYPE_LABEL[v.type]} · Depot {depotName(v.depotId)} ·
                      คะแนน {formatNumber(v.score)}
                    </p>
                  </div>
                </div>
                <Badge tone={VEHICLE_STATUS_TONE[v.status]}>
                  {VEHICLE_STATUS_LABEL[v.status]}
                </Badge>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
