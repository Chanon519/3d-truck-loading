"use client";

// ===== ตารางงานทอยตู้: แถว expand ดู timeline + dropdown action ต่อแถว =====
import { Fragment, useState } from "react";
import {
  ArrowLeftRight,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  MoreHorizontal,
  Play,
  TriangleAlert,
  Truck,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Job } from "@/lib/types";
import {
  JOB_PRIORITY_LABEL,
  JOB_PRIORITY_TONE,
  JOB_STATUS_LABEL,
  JOB_STATUS_TONE,
  formatNumber,
  formatThaiDateTime,
} from "@/lib/labels";
import { vehiclePlate } from "@/lib/mock/vehicles";
import { driverName } from "@/lib/mock/drivers";
import { depotName } from "@/lib/mock/depots";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ShuttleRoute } from "@/components/shuttle-jobs/shuttle-route";
import { ShuttleTimeline } from "@/components/shuttle-jobs/shuttle-timeline";

export type ShuttleActionType =
  | "assign_vehicle"
  | "assign_driver"
  | "confirm"
  | "start"
  | "complete"
  | "report";

interface MenuAction {
  key: ShuttleActionType;
  label: string;
  icon: LucideIcon;
  danger?: boolean;
}

// action ที่ทำได้ ขึ้นกับสถานะงานปัจจุบัน
function buildActions(job: Job): MenuAction[] {
  const actions: MenuAction[] = [];
  if (job.status === "pending" || job.status === "assigned") {
    actions.push({ key: "assign_vehicle", label: "มอบหมายรถ", icon: Truck });
    actions.push({ key: "assign_driver", label: "มอบหมายคนขับ", icon: UserPlus });
  }
  if (job.status === "pending") {
    actions.push({ key: "confirm", label: "ยืนยันรับงาน", icon: ClipboardCheck });
  }
  if (job.status === "assigned") {
    actions.push({ key: "start", label: "เริ่มงาน", icon: Play });
  }
  if (job.status === "in_progress") {
    actions.push({ key: "complete", label: "เสร็จงาน", icon: CircleCheck });
  }
  if (job.status !== "completed" && job.status !== "problem") {
    actions.push({
      key: "report",
      label: "รายงานปัญหา",
      icon: TriangleAlert,
      danger: true,
    });
  }
  return actions;
}

// ตำแหน่ง depot + ช่องจอด สำหรับ label ใต้จุด timeline
function slotLabel(depotId?: string, slotCode?: string): string {
  const name = depotName(depotId);
  return slotCode ? `${name} ${slotCode}` : name;
}

interface MenuState {
  jobId: string;
  x: number;
  y: number;
}

const COL_COUNT = 11;
const MENU_WIDTH = 208; // w-52

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-400">{label}</p>
      <div className="mt-0.5 text-sm text-slate-700">{children}</div>
    </div>
  );
}

// แผงรายละเอียด + timeline ในแถว expand
function ExpandedPanel({ job }: { job: Job }) {
  const crossDepot = Boolean(
    job.originDepotId && job.destDepotId && job.originDepotId !== job.destDepotId
  );
  return (
    <div className="grid gap-3 py-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">สถานะการทอยตู้</p>
          {crossDepot && <Badge tone="violet">ทอยข้าม Depot</Badge>}
        </div>
        <ShuttleTimeline
          status={job.status}
          fromLabel={slotLabel(job.originDepotId, job.fromSlotCode)}
          toLabel={slotLabel(job.destDepotId, job.toSlotCode)}
        />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-slate-900">รายละเอียดงาน</p>
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          <DetailItem label="ลูกค้า">{job.customer}</DetailItem>
          <DetailItem label="เลข Container">
            <span className="font-mono">{job.containerNo ?? "-"}</span>
            {job.containerSize && (
              <Badge tone="slate" className="ml-2">
                {job.containerSize}
              </Badge>
            )}
          </DetailItem>
          <DetailItem label="จุดรับตู้">{job.origin}</DetailItem>
          <DetailItem label="จุดวางตู้">{job.destination}</DetailItem>
        </div>
        {job.problem && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            ปัญหา: {job.problem}
          </div>
        )}
        {job.note && (
          <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            หมายเหตุ: {job.note}
          </div>
        )}
      </div>
    </div>
  );
}

export function ShuttleTable({
  jobs,
  onAction,
}: {
  jobs: Job[];
  onAction: (action: ShuttleActionType, job: Job) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);

  const menuJob = menu ? (jobs.find((j) => j.id === menu.jobId) ?? null) : null;
  const menuActions = menuJob ? buildActions(menuJob) : [];

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, job: Job) => {
    e.stopPropagation();
    if (menu?.jobId === job.id) {
      setMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const estimatedHeight = buildActions(job).length * 38 + 12;
    const openUp = rect.bottom + estimatedHeight + 8 > window.innerHeight;
    setMenu({
      jobId: job.id,
      x: Math.max(8, rect.right - MENU_WIDTH),
      y: openUp ? Math.max(8, rect.top - estimatedHeight - 4) : rect.bottom + 4,
    });
  };

  return (
    <Card>
      <CardHeader
        title="รายการงานทอยตู้"
        subtitle={`ตามเงื่อนไขที่กรอง ${formatNumber(jobs.length)} งาน — คลิกแถวเพื่อดู timeline`}
      />
      <Table>
        <THead>
          <tr>
            <TH>เลขงาน</TH>
            <TH>Container</TH>
            <TH>ขนาดตู้</TH>
            <TH>เส้นทาง</TH>
            <TH>เวลานัดหมาย</TH>
            <TH>รถที่ใช้</TH>
            <TH>คนขับ</TH>
            <TH>ความเร่งด่วน</TH>
            <TH>สถานะ</TH>
            <TH>หมายเหตุ</TH>
            <TH align="center">จัดการ</TH>
          </tr>
        </THead>
        <TBody>
          {jobs.length === 0 && (
            <tr>
              <TD colSpan={COL_COUNT}>
                <EmptyState
                  icon={ArrowLeftRight}
                  title="ไม่พบงานทอยตู้"
                  subtitle="ลองปรับตัวกรองหรือเปลี่ยนคำค้นหา"
                />
              </TD>
            </tr>
          )}
          {jobs.map((job) => {
            const expanded = expandedId === job.id;
            const plate = vehiclePlate(job.vehicleId);
            const driver = driverName(job.driverId);
            const actions = buildActions(job);
            const remark = job.problem ?? job.note;
            return (
              <Fragment key={job.id}>
                <TR onClick={() => setExpandedId(expanded ? null : job.id)}>
                  <TD>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                          expanded ? "rotate-90" : ""
                        }`}
                      />
                      <span className="font-medium text-slate-900">
                        {job.jobNo}
                      </span>
                    </div>
                  </TD>
                  <TD>
                    <span className="whitespace-nowrap font-mono text-xs text-slate-700">
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
                    <ShuttleRoute job={job} />
                  </TD>
                  <TD>
                    <span className="whitespace-nowrap text-slate-600">
                      {formatThaiDateTime(job.appointmentTime)}
                    </span>
                  </TD>
                  <TD>
                    <span
                      className={`whitespace-nowrap font-mono ${
                        plate === "-" ? "text-slate-400" : "text-slate-700"
                      }`}
                    >
                      {plate}
                    </span>
                  </TD>
                  <TD>
                    <span
                      className={`whitespace-nowrap ${
                        driver === "-" ? "text-slate-400" : "text-slate-700"
                      }`}
                    >
                      {driver}
                    </span>
                  </TD>
                  <TD>
                    <Badge tone={JOB_PRIORITY_TONE[job.priority]}>
                      {JOB_PRIORITY_LABEL[job.priority]}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge tone={JOB_STATUS_TONE[job.status]}>
                      {JOB_STATUS_LABEL[job.status]}
                    </Badge>
                  </TD>
                  <TD>
                    {remark ? (
                      <span
                        className={`block max-w-[180px] truncate ${
                          job.problem ? "text-red-600" : "text-slate-500"
                        }`}
                        title={remark}
                      >
                        {remark}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TD>
                  <TD align="center">
                    {actions.length > 0 ? (
                      <button
                        type="button"
                        onClick={(e) => openMenu(e, job)}
                        aria-label={`จัดการงาน ${job.jobNo}`}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </TD>
                </TR>
                {expanded && (
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <TD colSpan={COL_COUNT}>
                      <ExpandedPanel job={job} />
                    </TD>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </TBody>
      </Table>

      {/* dropdown เมนู action — วางแบบ fixed เพื่อไม่ให้โดน overflow ของตารางตัด */}
      {menu && menuJob && menuActions.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenu(null)}
            aria-hidden="true"
          />
          <div
            className="fixed z-50 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg"
            style={{ left: menu.x, top: menu.y }}
          >
            {menuActions.map((action) => (
              <button
                key={action.key}
                type="button"
                onClick={() => {
                  setMenu(null);
                  onAction(action.key, menuJob);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  action.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <action.icon className="h-4 w-4 shrink-0" />
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
