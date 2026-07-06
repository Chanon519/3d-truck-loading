"use client";

// การ์ดงานทั่วไป 1 ใบต่อ 1 งาน — แสดงรายละเอียด + ปุ่ม action ตาม workflow ของสถานะ
import {
  ArrowRight,
  Building2,
  CircleCheck,
  ClipboardCheck,
  Clock,
  MapPin,
  Play,
  StickyNote,
  TriangleAlert,
  Truck,
  User,
} from "lucide-react";
import type { Job } from "@/lib/types";
import {
  JOB_PRIORITY_LABEL,
  JOB_PRIORITY_TONE,
  JOB_STATUS_LABEL,
  JOB_STATUS_TONE,
  formatThaiDateTime,
} from "@/lib/labels";
import { vehiclePlate } from "@/lib/mock/vehicles";
import { driverName } from "@/lib/mock/drivers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function GeneralJobCard({
  job,
  onAssignVehicle,
  onAssignDriver,
  onAccept,
  onStart,
  onComplete,
  onReportProblem,
}: {
  job: Job;
  onAssignVehicle: (job: Job) => void;
  onAssignDriver: (job: Job) => void;
  onAccept: (job: Job) => void;
  onStart: (job: Job) => void;
  onComplete: (job: Job) => void;
  onReportProblem: (job: Job) => void;
}) {
  const hasAlert = job.status === "delayed" || job.status === "problem";
  // ข้อความในแถบเตือน: งานมีปัญหาใช้ field problem ก่อน, งานล่าช้าใช้ note
  const alertText =
    job.status === "problem"
      ? (job.problem ?? job.note ?? "งานมีปัญหา รอการแก้ไข")
      : (job.note ?? "งานล่าช้ากว่ากำหนดนัดหมาย");

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* หัวการ์ด: เลขงาน + badge สถานะ/ความเร่งด่วน */}
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
        <span className="font-mono text-sm font-semibold text-slate-900">
          {job.jobNo}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {job.priority !== "normal" && (
            <Badge tone={JOB_PRIORITY_TONE[job.priority]}>
              {JOB_PRIORITY_LABEL[job.priority]}
            </Badge>
          )}
          <Badge tone={JOB_STATUS_TONE[job.status]}>
            {JOB_STATUS_LABEL[job.status]}
          </Badge>
        </div>
      </div>

      {/* แถบเตือนสำหรับงานล่าช้า / มีปัญหา */}
      {hasAlert && (
        <div
          className={`mx-5 mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-xs ${
            job.status === "problem"
              ? "bg-red-50 text-red-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{alertText}</span>
        </div>
      )}

      {/* เนื้อหางาน */}
      <div className="flex-1 space-y-2.5 px-5 py-4">
        <p className="text-sm font-medium leading-snug text-slate-900">
          {job.detail ?? "งานขนส่งสินค้าทั่วไป"}
        </p>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{job.customer}</span>
        </div>

        <div className="flex items-start gap-2 text-sm text-slate-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span className="min-w-0">
            {job.origin}
            <ArrowRight className="mx-1.5 inline h-3.5 w-3.5 text-slate-400" />
            {job.destination}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="h-4 w-4 shrink-0 text-slate-400" />
          <span>{formatThaiDateTime(job.appointmentTime)} น.</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4 shrink-0 text-slate-400" />
            {job.vehicleId ? (
              <span className="text-slate-600">{vehiclePlate(job.vehicleId)}</span>
            ) : (
              <span className="text-slate-400">ยังไม่มอบหมาย</span>
            )}
          </span>
          <span className="flex items-center gap-2">
            <User className="h-4 w-4 shrink-0 text-slate-400" />
            {job.driverId ? (
              <span className="text-slate-600">{driverName(job.driverId)}</span>
            ) : (
              <span className="text-slate-400">ยังไม่มอบหมาย</span>
            )}
          </span>
        </div>

        {/* หมายเหตุ — งานล่าช้า/มีปัญหาแสดงในแถบเตือนด้านบนแล้ว */}
        {job.note && !hasAlert && (
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>{job.note}</span>
          </div>
        )}
      </div>

      {/* ปุ่ม action ตามสถานะ */}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3">
        {job.status === "pending" && (
          <>
            <Button variant="outline" size="sm" onClick={() => onAssignVehicle(job)}>
              <Truck className="h-3.5 w-3.5" />
              มอบหมายรถ
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAssignDriver(job)}>
              <User className="h-3.5 w-3.5" />
              มอบหมายคนขับ
            </Button>
            <Button
              size="sm"
              className="ml-auto"
              disabled={!job.vehicleId || !job.driverId}
              onClick={() => onAccept(job)}
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              รับงาน
            </Button>
          </>
        )}

        {job.status === "assigned" && (
          <Button size="sm" onClick={() => onStart(job)}>
            <Play className="h-3.5 w-3.5" />
            เริ่มงาน
          </Button>
        )}

        {job.status === "in_progress" && (
          <>
            <Button size="sm" onClick={() => onComplete(job)}>
              <CircleCheck className="h-3.5 w-3.5" />
              ปิดงาน
            </Button>
            <Button variant="outline" size="sm" onClick={() => onReportProblem(job)}>
              <TriangleAlert className="h-3.5 w-3.5" />
              รายงานปัญหา
            </Button>
          </>
        )}

        {job.status === "completed" && (
          <div className="flex items-center gap-1.5 py-1 text-sm font-medium text-emerald-600">
            <CircleCheck className="h-4 w-4" />
            งานเสร็จสมบูรณ์
          </div>
        )}

        {hasAlert && (
          <>
            <Button size="sm" onClick={() => onComplete(job)}>
              <CircleCheck className="h-3.5 w-3.5" />
              ปิดงาน
            </Button>
            <Button variant="outline" size="sm" onClick={() => onReportProblem(job)}>
              <TriangleAlert className="h-3.5 w-3.5" />
              รายงานปัญหา
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
