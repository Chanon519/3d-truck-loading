"use client";

// ตารางรวมงานขนส่งทุกประเภท — ใช้ในหน้า "จัดการงาน"

import { ArrowRight, SearchX } from "lucide-react";
import type { Job, JobStatus } from "@/lib/types";
import type { BadgeTone } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  JOB_PRIORITY_LABEL,
  JOB_PRIORITY_TONE,
  JOB_STATUS_LABEL,
  JOB_STATUS_TONE,
  JOB_TYPE_LABEL,
  JOB_TYPE_TONE,
  formatThaiDateTime,
} from "@/lib/labels";
import { vehiclePlate } from "@/lib/mock/vehicles";
import { driverName } from "@/lib/mock/drivers";
import { JobActionsMenu } from "@/components/jobs/job-actions-menu";
import type { JobAction } from "@/components/jobs/job-actions-menu";

// แถวงานล่าช้า/มีปัญหา แต้มพื้นจาง ๆ ทั้งแถว (เขียน class เต็ม — ห้ามประกอบ dynamic string)
const ROW_TINT: Partial<Record<JobStatus, string>> = {
  delayed: "bg-amber-50/60",
  problem: "bg-red-50/60",
};

export function JobsTable({
  jobs,
  onAction,
  selectable = false,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  planTag,
}: {
  jobs: Job[];
  onAction: (job: Job, action: JobAction) => void;
  // โหมดเลือกหลายงาน (สำหรับสร้างแผน) — เปิดเมื่อส่ง props เข้ามา
  selectable?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (jobId: string) => void;
  onToggleAll?: () => void;
  // ป้าย "อยู่ในแผน" — คืน null ถ้างานไม่อยู่ในแผนใด
  planTag?: (jobId: string) => { text: string; tone: BadgeTone } | null;
}) {
  const selected = new Set(selectedIds ?? []);
  const allSelected = jobs.length > 0 && jobs.every((j) => selected.has(j.id));
  const colSpan = selectable ? 11 : 10;

  return (
    <Table>
      <THead>
        <TR>
          {selectable && (
            <TH>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onToggleAll?.()}
                aria-label="เลือกงานทั้งหมดที่แสดง"
                className="h-4 w-4 cursor-pointer accent-logo-violet"
              />
            </TH>
          )}
          <TH>เลขงาน</TH>
          <TH>ประเภทงาน</TH>
          <TH>ลูกค้า</TH>
          <TH>ต้นทาง → ปลายทาง</TH>
          <TH>วันที่นัดหมาย</TH>
          <TH>รถ</TH>
          <TH>คนขับ</TH>
          <TH>สถานะ</TH>
          <TH>ความเร่งด่วน</TH>
          <TH align="right">จัดการ</TH>
        </TR>
      </THead>
      <TBody>
        {jobs.length === 0 ? (
          <TR>
            <TD colSpan={colSpan}>
              <EmptyState
                icon={SearchX}
                title="ไม่พบงานตามเงื่อนไขที่เลือก"
                subtitle="ลองปรับตัวกรองหรือเปลี่ยนคำค้นหา"
              />
            </TD>
          </TR>
        ) : (
          jobs.map((job) => (
            <TR
              key={job.id}
              className={`${ROW_TINT[job.status] ?? ""} ${
                selectable && selected.has(job.id) ? "bg-lavender-trace/30" : ""
              }`}
            >
              {selectable && (
                <TD>
                  <input
                    type="checkbox"
                    checked={selected.has(job.id)}
                    onChange={() => onToggleSelect?.(job.id)}
                    aria-label={`เลือกงาน ${job.jobNo}`}
                    className="h-4 w-4 cursor-pointer accent-logo-violet"
                  />
                </TD>
              )}
              <TD className="whitespace-nowrap font-mono font-medium text-slate-900">
                {job.jobNo}
                {(() => {
                  const tag = planTag?.(job.id);
                  return tag ? (
                    <span className="mt-1 block">
                      <Badge tone={tag.tone}>{tag.text}</Badge>
                    </span>
                  ) : null;
                })()}
              </TD>
              <TD>
                <Badge tone={JOB_TYPE_TONE[job.type]}>
                  {JOB_TYPE_LABEL[job.type]}
                </Badge>
              </TD>
              <TD className="text-slate-700">{job.customer}</TD>
              <TD>
                <div className="min-w-[13rem]">
                  <p className="text-slate-700">{job.origin}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{job.destination}</span>
                  </p>
                </div>
              </TD>
              <TD className="whitespace-nowrap text-slate-700">
                {formatThaiDateTime(job.appointmentTime)}
              </TD>
              <TD className="whitespace-nowrap text-slate-700">
                {vehiclePlate(job.vehicleId)}
              </TD>
              <TD className="whitespace-nowrap text-slate-700">
                {driverName(job.driverId)}
              </TD>
              <TD>
                <Badge tone={JOB_STATUS_TONE[job.status]}>
                  {JOB_STATUS_LABEL[job.status]}
                </Badge>
              </TD>
              <TD>
                {job.priority === "normal" ? (
                  <span className="text-slate-400">-</span>
                ) : (
                  <Badge tone={JOB_PRIORITY_TONE[job.priority]}>
                    {JOB_PRIORITY_LABEL[job.priority]}
                  </Badge>
                )}
              </TD>
              <TD align="right">
                <JobActionsMenu onAction={(action) => onAction(job, action)} />
              </TD>
            </TR>
          ))
        )}
      </TBody>
    </Table>
  );
}
