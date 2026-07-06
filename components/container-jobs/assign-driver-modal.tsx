"use client";

// Modal มอบหมายคนขับ — แสดงเฉพาะคนขับที่พร้อมรับงาน (ready)
import { useState } from "react";
import { UserRound } from "lucide-react";
import type { Job } from "@/lib/types";
import {
  DRIVER_STATUS_LABEL,
  DRIVER_STATUS_TONE,
  formatNumber,
} from "@/lib/labels";
import { DRIVERS, driverName } from "@/lib/mock/drivers";
import { depotName } from "@/lib/mock/depots";
import { useJobsStore } from "@/lib/store/jobs-store";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";

export function AssignDriverModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const assignDriver = useJobsStore((s) => s.assignDriver);
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // เฉพาะคนขับที่พร้อมรับงานเท่านั้น
  const readyDrivers = DRIVERS.filter((d) => d.status === "ready");

  function confirm() {
    if (!selectedId) return;
    assignDriver(job.id, selectedId);
    toast(
      `มอบหมายคนขับ ${driverName(selectedId)} ให้งาน ${job.jobNo} แล้ว`,
      "success"
    );
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`มอบหมายคนขับ — ${job.jobNo}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={confirm} disabled={!selectedId}>
            มอบหมายคนขับ
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-slate-500">
        แสดงเฉพาะคนขับที่พร้อมรับงาน
        {job.driverId && (
          <span className="ml-1">
            (คนขับปัจจุบัน: {driverName(job.driverId)})
          </span>
        )}
      </p>

      {readyDrivers.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="ไม่มีคนขับที่พร้อมรับงาน"
          subtitle="คนขับทั้งหมดกำลังทำงาน นอกเวลางาน หรือลาหยุด"
        />
      ) : (
        <div className="space-y-2">
          {readyDrivers.map((d) => {
            const selected = d.id === selectedId;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedId(d.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  selected
                    ? "border-charcoal-ink bg-bone ring-2 ring-charcoal-ink/15"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{d.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {d.code} · Depot {depotName(d.depotId)} · คะแนน{" "}
                      {formatNumber(d.score)}
                    </p>
                  </div>
                </div>
                <Badge tone={DRIVER_STATUS_TONE[d.status]}>
                  {DRIVER_STATUS_LABEL[d.status]}
                </Badge>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
