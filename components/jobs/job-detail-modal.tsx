"use client";

// Modal สรุปรายละเอียดงานทุก field — จัด 2 คอลัมน์ + section เฉพาะงานตู้/งานทอยตู้

import type { Job } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
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
import { VEHICLES } from "@/lib/mock/vehicles";
import { DRIVERS } from "@/lib/mock/drivers";
import { depotName } from "@/lib/mock/depots";

function DetailField({
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
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-1 text-sm text-slate-900">{children}</div>
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
  const vehicle = job.vehicleId
    ? VEHICLES.find((v) => v.id === job.vehicleId)
    : undefined;
  const driver = job.driverId
    ? DRIVERS.find((d) => d.id === job.driverId)
    : undefined;

  const hasContainerInfo = Boolean(
    job.containerNo ||
      job.containerSize ||
      job.containerJobType ||
      job.pickupLocation ||
      job.deliveryLocation ||
      job.originDepotId ||
      job.destDepotId
  );
  const hasSlotInfo = Boolean(job.fromSlotCode || job.toSlotCode);

  return (
    <Modal
      open
      onClose={onClose}
      title={`รายละเอียดงาน ${job.jobNo}`}
      wide
      footer={
        <Button variant="outline" onClick={onClose}>
          ปิด
        </Button>
      }
    >
      <div className="space-y-5">
        {/* ---------- ข้อมูลหลักของงาน ---------- */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            ข้อมูลงาน
          </h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <DetailField label="เลขงาน">
              <span className="font-mono font-medium">{job.jobNo}</span>
            </DetailField>
            <DetailField label="ประเภทงาน">
              <Badge tone={JOB_TYPE_TONE[job.type]}>
                {JOB_TYPE_LABEL[job.type]}
              </Badge>
            </DetailField>
            <DetailField label="สถานะ">
              <Badge tone={JOB_STATUS_TONE[job.status]}>
                {JOB_STATUS_LABEL[job.status]}
              </Badge>
            </DetailField>
            <DetailField label="ความเร่งด่วน">
              <Badge tone={JOB_PRIORITY_TONE[job.priority]}>
                {JOB_PRIORITY_LABEL[job.priority]}
              </Badge>
            </DetailField>
            <DetailField label="ลูกค้า">{job.customer}</DetailField>
            <DetailField label="วันที่นัดหมาย">
              {formatThaiDateTime(job.appointmentTime)}
            </DetailField>
            <DetailField label="ต้นทาง">{job.origin}</DetailField>
            <DetailField label="ปลายทาง">{job.destination}</DetailField>
            <DetailField label="รถ">
              {vehicle
                ? `${vehicle.plate} · ${VEHICLE_TYPE_LABEL[vehicle.type]}`
                : "-"}
            </DetailField>
            <DetailField label="คนขับ">
              {driver ? `${driver.name} (${driver.code})` : "-"}
            </DetailField>
            {job.detail && (
              <DetailField label="รายละเอียดงาน" full>
                {job.detail}
              </DetailField>
            )}
          </div>
        </section>

        {/* ---------- ข้อมูลตู้ (เฉพาะงานตู้ / งานทอยตู้) ---------- */}
        {hasContainerInfo && (
          <section className="border-t border-slate-100 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              ข้อมูลตู้ Container
            </h3>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {job.containerNo && (
                <DetailField label="เลขตู้ Container">
                  <span className="font-mono">{job.containerNo}</span>
                </DetailField>
              )}
              {job.containerSize && (
                <DetailField label="ขนาดตู้">{job.containerSize}</DetailField>
              )}
              {job.containerJobType && (
                <DetailField label="ประเภทงานตู้">
                  {CONTAINER_JOB_TYPE_LABEL[job.containerJobType]}
                </DetailField>
              )}
              {job.pickupLocation && (
                <DetailField label="จุดรับตู้">{job.pickupLocation}</DetailField>
              )}
              {job.deliveryLocation && (
                <DetailField label="จุดส่งตู้">
                  {job.deliveryLocation}
                </DetailField>
              )}
              {job.originDepotId && (
                <DetailField label="Depot ต้นทาง">
                  {depotName(job.originDepotId)}
                </DetailField>
              )}
              {job.destDepotId && (
                <DetailField label="Depot ปลายทาง">
                  {depotName(job.destDepotId)}
                </DetailField>
              )}
            </div>
          </section>
        )}

        {/* ---------- ตำแหน่งในลาน (เฉพาะงานทอยตู้) ---------- */}
        {hasSlotInfo && (
          <section className="border-t border-slate-100 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              ตำแหน่งในลาน
            </h3>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {job.fromSlotCode && (
                <DetailField label="ตำแหน่งเริ่มต้น">
                  <span className="font-mono">{job.fromSlotCode}</span>
                </DetailField>
              )}
              {job.toSlotCode && (
                <DetailField label="ตำแหน่งปลายทาง">
                  <span className="font-mono">{job.toSlotCode}</span>
                </DetailField>
              )}
            </div>
          </section>
        )}

        {/* ---------- ปัญหา / หมายเหตุ ---------- */}
        {job.problem && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-xs font-medium text-red-600">ปัญหา/ข้อยกเว้น</p>
            <p className="mt-1 text-sm text-red-700">{job.problem}</p>
          </div>
        )}
        {job.note && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-medium text-amber-600">หมายเหตุ</p>
            <p className="mt-1 text-sm text-amber-700">{job.note}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
