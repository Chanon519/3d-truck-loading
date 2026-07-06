"use client";

// ===== Modal สำหรับ action ของงานทอยตู้: มอบหมายรถ / มอบหมายคนขับ / รายงานปัญหา =====
import { useState } from "react";
import { Truck, Users } from "lucide-react";
import type { Job } from "@/lib/types";
import {
  DRIVER_STATUS_LABEL,
  DRIVER_STATUS_TONE,
  JOB_STATUS_LABEL,
  VEHICLE_STATUS_LABEL,
  VEHICLE_STATUS_TONE,
  VEHICLE_TYPE_LABEL,
} from "@/lib/labels";
import { VEHICLES } from "@/lib/mock/vehicles";
import { DRIVERS } from "@/lib/mock/drivers";
import { depotName } from "@/lib/mock/depots";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { ShuttleRoute } from "@/components/shuttle-jobs/shuttle-route";

// สรุปงานสั้น ๆ ที่หัว modal ให้รู้ว่ากำลังจัดการงานไหน
function JobSummary({ job }: { job: Job }) {
  return (
    <div className="mb-4 rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="font-medium text-slate-900">{job.jobNo}</span>
        {job.containerNo && (
          <span className="font-mono text-xs text-slate-600">{job.containerNo}</span>
        )}
        {job.containerSize && <Badge tone="slate">{job.containerSize}</Badge>}
      </div>
      <div className="mt-1.5 text-xs">
        <ShuttleRoute job={job} />
      </div>
    </div>
  );
}

// ---------- มอบหมายรถ (เฉพาะรถสถานะพร้อมใช้งานเท่านั้น) ----------
export function AssignVehicleModal({
  job,
  onClose,
  onConfirm,
}: {
  job: Job;
  onClose: () => void;
  onConfirm: (vehicleId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const availableVehicles = VEHICLES.filter((v) => v.status === "available");

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
          <Button
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
          >
            ยืนยันมอบหมายรถ
          </Button>
        </>
      }
    >
      <JobSummary job={job} />
      <p className="mb-3 text-sm text-slate-500">
        แสดงเฉพาะรถที่พร้อมใช้งานเท่านั้น ({availableVehicles.length} คัน)
      </p>
      {availableVehicles.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="ไม่มีรถพร้อมใช้งาน"
          subtitle="รถทุกคันติดภารกิจหรืออยู่ระหว่างซ่อมบำรุง"
        />
      ) : (
        <div className="space-y-2">
          {availableVehicles.map((v) => {
            const active = selected === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelected(v.id)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  active
                    ? "border-charcoal-ink bg-bone"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-900">
                      {v.plate}
                    </span>
                    <Badge tone={VEHICLE_STATUS_TONE[v.status]}>
                      {VEHICLE_STATUS_LABEL[v.status]}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">คะแนน {v.score}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {VEHICLE_TYPE_LABEL[v.type]} · Depot {depotName(v.depotId)} ·
                  ตรงเวลา {v.onTimeRate}%
                </p>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

// ---------- มอบหมายคนขับ (เฉพาะคนขับสถานะพร้อมรับงาน) ----------
export function AssignDriverModal({
  job,
  onClose,
  onConfirm,
}: {
  job: Job;
  onClose: () => void;
  onConfirm: (driverId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const readyDrivers = DRIVERS.filter((d) => d.status === "ready");

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
          <Button
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
          >
            ยืนยันมอบหมายคนขับ
          </Button>
        </>
      }
    >
      <JobSummary job={job} />
      <p className="mb-3 text-sm text-slate-500">
        แสดงเฉพาะคนขับที่พร้อมรับงานเท่านั้น ({readyDrivers.length} คน)
      </p>
      {readyDrivers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="ไม่มีคนขับพร้อมรับงาน"
          subtitle="คนขับทุกคนติดงานหรืออยู่นอกเวลางาน"
        />
      ) : (
        <div className="space-y-2">
          {readyDrivers.map((d) => {
            const active = selected === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelected(d.id)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  active
                    ? "border-charcoal-ink bg-bone"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{d.name}</span>
                    <Badge tone={DRIVER_STATUS_TONE[d.status]}>
                      {DRIVER_STATUS_LABEL[d.status]}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">คะแนน {d.score}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {d.code} · Depot {depotName(d.depotId)} · ตรงเวลา {d.onTimeRate}%
                  · ความปลอดภัย {d.safetyScore}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

// ---------- รายงานปัญหา (textarea → สถานะ problem) ----------
export function ReportProblemModal({
  job,
  onClose,
  onConfirm,
}: {
  job: Job;
  onClose: () => void;
  onConfirm: (problem: string) => void;
}) {
  const [text, setText] = useState("");
  const trimmed = text.trim();

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
          <Button
            variant="danger"
            disabled={trimmed.length === 0}
            onClick={() => trimmed && onConfirm(trimmed)}
          >
            รายงานปัญหา
          </Button>
        </>
      }
    >
      <JobSummary job={job} />
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-500">
          รายละเอียดปัญหา
        </span>
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="อธิบายปัญหาที่พบ เช่น ตู้เสียหาย ช่องจอดปลายทางถูกใช้งาน รถยกตู้ขัดข้อง..."
          className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </label>
      <p className="mt-2 text-xs text-slate-400">
        เมื่อรายงานแล้ว สถานะงานจะเปลี่ยนเป็น &quot;{JOB_STATUS_LABEL.problem}&quot;
        เพื่อให้ทีมปฏิบัติการเข้าตรวจสอบ
      </p>
    </Modal>
  );
}
