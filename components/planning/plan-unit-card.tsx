"use client";

// การ์ดหน่วยจัดส่ง 1 หน่วยในแผน — จัดของ (3D) + จัดรถ ในการ์ดเดียว ทำก่อน-หลังก็ได้
import {
  Box,
  Boxes,
  Eraser,
  PackageCheck,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";
import type { ContainerSize, Job, PlanUnit } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { CONTAINER_SPECS } from "@/lib/container-specs";
import { usePlansStore } from "@/lib/store/plans-store";
import { unitReadiness } from "@/lib/plan-helpers";
import { vehiclePlate } from "@/lib/mock/vehicles";
import { driverName } from "@/lib/mock/drivers";
import {
  JOB_TYPE_LABEL,
  JOB_TYPE_TONE,
  formatNumber,
} from "@/lib/labels";

const CONTAINER_OPTIONS = (
  Object.keys(CONTAINER_SPECS) as ContainerSize[]
).map((k) => ({ value: k, label: CONTAINER_SPECS[k].label }));

// ป้ายสถานะเล็กในแต่ละมิติ
function DimBadge({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-smallchips border px-2 py-0.5 text-xs font-medium ${
        ok
          ? "border-emerald-600/25 bg-emerald-50 text-emerald-700"
          : "border-amber-600/25 bg-amber-50 text-amber-700"
      }`}
    >
      {children}
    </span>
  );
}

export function PlanUnitCard({
  planId,
  unit,
  job,
  readOnly = false,
  onOpen3D,
  onAssignTruck,
  onAssignDriver,
}: {
  planId: string;
  unit: PlanUnit;
  job: Job | undefined;
  readOnly?: boolean;
  onOpen3D: (unit: PlanUnit) => void;
  onAssignTruck: (unit: PlanUnit) => void;
  onAssignDriver: (unit: PlanUnit) => void;
}) {
  const setContainerType = usePlansStore((s) => s.setUnitContainerType);
  const autoPack = usePlansStore((s) => s.autoPackUnit);
  const unpack = usePlansStore((s) => s.unpackUnit);
  const clearVehicle = usePlansStore((s) => s.clearUnitVehicle);

  const readiness = unitReadiness(unit);
  const boxCount = unit.packingResult?.packed.length ?? 0;

  return (
    <div className="rounded-cards border border-hairline bg-white p-4 shadow-card">
      {/* หัวการ์ด */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium text-charcoal-ink">
              {job?.jobNo ?? unit.jobId}
            </span>
            {job && (
              <Badge tone={JOB_TYPE_TONE[job.type]}>
                {JOB_TYPE_LABEL[job.type]}
              </Badge>
            )}
          </div>
          {job && (
            <p className="mt-1 truncate text-xs text-slate-mid">
              {job.customer} · {job.origin} → {job.destination}
            </p>
          )}
        </div>
        <Badge tone={readiness.tone}>{readiness.label}</Badge>
      </div>

      {/* 2 มิติ: จัดของ + จัดรถ */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* ---------- มิติจัดของ / ตู้ ---------- */}
        <div className="rounded-inputs bg-bone p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-ink">
              <Box className="h-4 w-4 text-slate-mid" />
              การจัดของเข้าตู้
            </span>
            {unit.needsPacking ? (
              <DimBadge ok={unit.packed}>
                {unit.packed ? (
                  <>
                    <PackageCheck className="h-3.5 w-3.5" />
                    จัดแล้ว {formatNumber(boxCount)} กล่อง
                  </>
                ) : (
                  "ยังไม่จัดของ"
                )}
              </DimBadge>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-smallchips border border-slate-400/25 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                <Boxes className="h-3.5 w-3.5" />
                ไม่ต้องใช้ตู้
              </span>
            )}
          </div>

          {unit.needsPacking ? (
            <>
              <SelectField
                value={unit.containerType ?? "40HQ"}
                onChange={(v) =>
                  setContainerType(planId, unit.id, v as ContainerSize)
                }
                options={CONTAINER_OPTIONS}
                className="mb-2"
              />
              {!readOnly && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpen3D(unit)}
                  >
                    <Box className="h-3.5 w-3.5" />
                    จัดของเข้าตู้ 3D
                  </Button>
                  {unit.packed ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => unpack(planId, unit.id)}
                    >
                      <Eraser className="h-3.5 w-3.5" />
                      ล้าง
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => autoPack(planId, unit.id)}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      จัดของอัตโนมัติ
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-mid">
              รถบรรทุกมีตู้ในตัว — ขนของขึ้นรถได้เลย ไม่ต้องจัดตู้แยก
            </p>
          )}
        </div>

        {/* ---------- มิติจัดรถ ---------- */}
        <div className="rounded-inputs bg-bone p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-ink">
              <Truck className="h-4 w-4 text-slate-mid" />
              การจัดรถ
            </span>
            <DimBadge ok={!!unit.vehicleId}>
              {unit.vehicleId ? (
                <>
                  <Truck className="h-3.5 w-3.5" />
                  {vehiclePlate(unit.vehicleId)}
                </>
              ) : (
                "ยังไม่จัดรถ"
              )}
            </DimBadge>
          </div>

          <p className="mb-2 flex items-center gap-1.5 text-xs text-slate-mid">
            <UserRound className="h-3.5 w-3.5" />
            คนขับ: {driverName(unit.driverId)}
          </p>

          {!readOnly && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAssignTruck(unit)}
              >
                <Truck className="h-3.5 w-3.5" />
                {unit.vehicleId ? "เปลี่ยนรถ" : "จัดรถ"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAssignDriver(unit)}
              >
                <UserRound className="h-3.5 w-3.5" />
                {unit.driverId ? "เปลี่ยนคนขับ" : "เลือกคนขับ"}
              </Button>
              {unit.vehicleId && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => clearVehicle(planId, unit.id)}
                >
                  <Eraser className="h-3.5 w-3.5" />
                  ล้าง
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
