"use client";

// ตารางรายการงานตู้ + แถวเสริมแสดงปัญหา (สีแดง) ใต้แถวงานที่มี problem
import { Fragment } from "react";
import { AlertTriangle, ArrowRight, Container } from "lucide-react";
import type { Job } from "@/lib/types";
import {
  CONTAINER_JOB_TYPE_LABEL,
  JOB_STATUS_LABEL,
  JOB_STATUS_TONE,
  formatThaiDateTime,
} from "@/lib/labels";
import { depotName } from "@/lib/mock/depots";
import { vehiclePlate } from "@/lib/mock/vehicles";
import { driverName } from "@/lib/mock/drivers";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { JobActionMenu, type JobAction } from "./job-action-menu";

export function ContainerJobsTable({
  jobs,
  onAction,
}: {
  jobs: Job[];
  onAction: (job: Job, action: JobAction) => void;
}) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={Container}
        title="ไม่พบงานตู้ที่ตรงกับเงื่อนไข"
        subtitle="ลองปรับตัวกรองประเภทงาน ขนาดตู้ สถานะ หรือคำค้นหา"
      />
    );
  }

  return (
    <Table>
      <THead>
        <TR>
          <TH>เลขงาน</TH>
          <TH>เลข Container</TH>
          <TH>ขนาดตู้</TH>
          <TH>ประเภทงานตู้</TH>
          <TH>ลูกค้า</TH>
          <TH>จุดรับตู้ → จุดส่งตู้</TH>
          <TH>Depot</TH>
          <TH>เวลานัดหมาย</TH>
          <TH>รถ / คนขับ</TH>
          <TH>สถานะ</TH>
          <TH align="right">จัดการ</TH>
        </TR>
      </THead>
      <TBody>
        {jobs.map((job) => {
          const hasProblem = Boolean(job.problem);
          return (
            <Fragment key={job.id}>
              <TR className={hasProblem ? "border-b-0!" : undefined}>
                <TD className="whitespace-nowrap font-medium text-slate-900">
                  {job.jobNo}
                </TD>
                <TD>
                  <span className="whitespace-nowrap font-mono text-sm font-bold text-slate-900">
                    {job.containerNo ?? "-"}
                  </span>
                </TD>
                <TD>
                  {job.containerSize ? (
                    <Badge tone="slate">{job.containerSize}</Badge>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TD>
                <TD>
                  {job.containerJobType ? (
                    <Badge tone="blue">
                      {CONTAINER_JOB_TYPE_LABEL[job.containerJobType]}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TD>
                <TD className="whitespace-nowrap text-slate-700">
                  {job.customer}
                </TD>
                <TD>
                  <div className="min-w-48">
                    <p className="text-sm text-slate-700">
                      {job.pickupLocation ?? job.origin}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      {job.deliveryLocation ?? job.destination}
                    </p>
                  </div>
                </TD>
                <TD className="whitespace-nowrap text-slate-700">
                  {depotName(job.originDepotId)}
                  <span className="mx-1 text-slate-400">→</span>
                  {depotName(job.destDepotId)}
                </TD>
                <TD className="whitespace-nowrap text-slate-700">
                  {formatThaiDateTime(job.appointmentTime)}
                </TD>
                <TD>
                  <p className="whitespace-nowrap text-sm text-slate-900">
                    {vehiclePlate(job.vehicleId)}
                  </p>
                  <p className="mt-0.5 whitespace-nowrap text-xs text-slate-500">
                    {driverName(job.driverId)}
                  </p>
                </TD>
                <TD>
                  <Badge tone={JOB_STATUS_TONE[job.status]}>
                    {JOB_STATUS_LABEL[job.status]}
                  </Badge>
                </TD>
                <TD align="right">
                  <JobActionMenu onAction={(action) => onAction(job, action)} />
                </TD>
              </TR>

              {/* แถวเสริม: แถบปัญหาสีแดงใต้แถวงาน */}
              {hasProblem && (
                <TR>
                  <TD colSpan={11} className="pt-0!">
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{job.problem}</span>
                    </div>
                  </TD>
                </TR>
              )}
            </Fragment>
          );
        })}
      </TBody>
    </Table>
  );
}
