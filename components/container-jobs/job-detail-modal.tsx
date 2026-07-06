"use client";

// Modal รายละเอียดงานตู้ — แสดงครบทุก field ของงานตู้
import { AlertTriangle, StickyNote } from "lucide-react";
import type { Job } from "@/lib/types";
import {
  CONTAINER_JOB_TYPE_LABEL,
  JOB_PRIORITY_LABEL,
  JOB_PRIORITY_TONE,
  JOB_STATUS_LABEL,
  JOB_STATUS_TONE,
  JOB_TYPE_LABEL,
  JOB_TYPE_TONE,
  VEHICLE_TYPE_LABEL,
  formatThaiDateTime,
} from "@/lib/labels";
import { depotName } from "@/lib/mock/depots";
import { VEHICLES } from "@/lib/mock/vehicles";
import { DRIVERS } from "@/lib/mock/drivers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

function DetailItem({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
    </div>
  );
}

export function JobDetailModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const vehicle = VEHICLES.find((v) => v.id === job.vehicleId);
  const driver = DRIVERS.find((d) => d.id === job.driverId);

  return (
    <Modal
      open
      onClose={onClose}
      title={`รายละเอียดงานตู้ ${job.jobNo}`}
      wide
      footer={
        <Button variant="outline" onClick={onClose}>
          ปิด
        </Button>
      }
    >
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <DetailItem label="เลขงาน">
          <span className="font-mono font-semibold">{job.jobNo}</span>
        </DetailItem>
        <DetailItem label="สถานะ">
          <Badge tone={JOB_STATUS_TONE[job.status]}>
            {JOB_STATUS_LABEL[job.status]}
          </Badge>
        </DetailItem>
        <DetailItem label="ประเภทงาน">
          <Badge tone={JOB_TYPE_TONE[job.type]}>
            {JOB_TYPE_LABEL[job.type]}
          </Badge>
        </DetailItem>
        <DetailItem label="ความสำคัญ">
          <Badge tone={JOB_PRIORITY_TONE[job.priority]}>
            {JOB_PRIORITY_LABEL[job.priority]}
          </Badge>
        </DetailItem>
        <DetailItem label="เลข Container">
          <span className="font-mono font-bold">{job.containerNo ?? "-"}</span>
        </DetailItem>
        <DetailItem label="ขนาดตู้">
          {job.containerSize ? (
            <Badge tone="slate">{job.containerSize}</Badge>
          ) : (
            "-"
          )}
        </DetailItem>
        <DetailItem label="ประเภทงานตู้" full>
          {job.containerJobType ? (
            <Badge tone="blue">
              {CONTAINER_JOB_TYPE_LABEL[job.containerJobType]}
            </Badge>
          ) : (
            "-"
          )}
        </DetailItem>
        <DetailItem label="ลูกค้า" full>
          {job.customer}
        </DetailItem>
        <DetailItem label="จุดรับตู้">{job.pickupLocation ?? job.origin}</DetailItem>
        <DetailItem label="จุดส่งตู้">
          {job.deliveryLocation ?? job.destination}
        </DetailItem>
        <DetailItem label="Depot ต้นทาง">{depotName(job.originDepotId)}</DetailItem>
        <DetailItem label="Depot ปลายทาง">{depotName(job.destDepotId)}</DetailItem>
        <DetailItem label="เวลานัดหมาย">
          {formatThaiDateTime(job.appointmentTime)} น.
        </DetailItem>
        <DetailItem label="รถ / คนขับ">
          {vehicle ? (
            <span>
              {vehicle.plate}{" "}
              <span className="text-slate-500">
                ({VEHICLE_TYPE_LABEL[vehicle.type]})
              </span>
            </span>
          ) : (
            <span className="text-slate-400">ยังไม่มอบหมายรถ</span>
          )}
          <br />
          {driver ? (
            <span>
              {driver.name}{" "}
              <span className="text-slate-500">({driver.code})</span>
            </span>
          ) : (
            <span className="text-slate-400">ยังไม่มอบหมายคนขับ</span>
          )}
        </DetailItem>

        {job.note && (
          <DetailItem label="หมายเหตุ" full>
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <StickyNote className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{job.note}</span>
            </div>
          </DetailItem>
        )}

        {job.problem && (
          <DetailItem label="ปัญหา / ข้อยกเว้น" full>
            <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{job.problem}</span>
            </div>
          </DetailItem>
        )}
      </dl>
    </Modal>
  );
}
