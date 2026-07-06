"use client";

// ===== การ์ดผลการจับคู่ 1 คู่: ตู้คอนเทนเนอร์ ↔ หัวลาก =====
import { CircleCheck, Container, MoveRight, Truck, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AwaitingContainer, TruckAssignment, Vehicle } from "@/lib/types";
import type { BadgeTone } from "@/lib/labels";
import {
  VEHICLE_STATUS_LABEL,
  VEHICLE_STATUS_TONE,
  VEHICLE_TYPE_LABEL,
  formatNumber,
  formatThaiTime,
} from "@/lib/labels";
import { depotName } from "@/lib/mock/depots";
import type { ContainerSize } from "@/lib/types";

const SIZE_TONE: Record<ContainerSize, BadgeTone> = {
  "20FT": "slate",
  "40FT": "sky",
  "40HQ": "violet",
};

function scoreTone(score: number): BadgeTone {
  if (score >= 90) return "emerald";
  if (score >= 80) return "sky";
  return "amber";
}

export function AssignmentCard({
  assignment,
  container,
  truck,
}: {
  assignment: TruckAssignment;
  container: AwaitingContainer;
  truck: Vehicle;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* หัวการ์ด: คะแนนความเหมาะสม */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">
          คู่ที่แนะนำ
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">ความเหมาะสม</span>
          <span
            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-bold ${
              scoreTone(assignment.score) === "emerald"
                ? "bg-emerald-50 text-emerald-700"
                : scoreTone(assignment.score) === "sky"
                  ? "bg-sky-50 text-sky-700"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            {assignment.score}
          </span>
        </div>
      </div>

      {/* ตู้ ↔ รถ */}
      <div className="flex items-stretch gap-2">
        {/* ตู้ */}
        <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
          <div className="flex items-center gap-2">
            <Container className="h-4 w-4 shrink-0 text-blue-600" />
            <span className="truncate font-semibold text-slate-900">
              {container.containerNo}
            </span>
            <Badge tone={SIZE_TONE[container.size]}>{container.size}</Badge>
          </div>
          <dl className="mt-2 space-y-0.5 text-xs text-slate-500">
            <div className="flex justify-between gap-2">
              <dt>ลูกค้า</dt>
              <dd className="truncate text-slate-700">{container.customer}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>ปลายทาง</dt>
              <dd className="truncate text-right text-slate-700">
                {container.destination}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>น้ำหนัก</dt>
              <dd className="text-slate-700">
                {formatNumber(container.weightKg)} กก.
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>นัดรับตู้</dt>
              <dd className="text-slate-700">
                {formatThaiTime(container.appointmentTime)} น.
              </dd>
            </div>
          </dl>
        </div>

        {/* ลูกศรเชื่อม */}
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-charcoal-ink text-white">
            <MoveRight className="h-4 w-4" />
          </div>
        </div>

        {/* รถ */}
        <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 shrink-0 text-violet-600" />
            <span className="truncate font-semibold text-slate-900">
              {truck.plate}
            </span>
          </div>
          <dl className="mt-2 space-y-0.5 text-xs text-slate-500">
            <div className="flex justify-between gap-2">
              <dt>ประเภท</dt>
              <dd className="text-slate-700">{VEHICLE_TYPE_LABEL[truck.type]}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Depot</dt>
              <dd className="truncate text-right text-slate-700">
                {depotName(truck.depotId)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>ตรงเวลา</dt>
              <dd className="text-slate-700">{truck.onTimeRate}%</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>สถานะ</dt>
              <dd>
                <Badge tone={VEHICLE_STATUS_TONE[truck.status]}>
                  {VEHICLE_STATUS_LABEL[truck.status]}
                </Badge>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* เหตุผล */}
      <ul className="mt-3 space-y-1.5">
        {assignment.reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
            <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span>{r}</span>
          </li>
        ))}
      </ul>

      {/* คำเตือน */}
      {assignment.warnings.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {assignment.warnings.map((w, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800"
            >
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
