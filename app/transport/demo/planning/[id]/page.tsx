"use client";

// หน้า Plan Workspace — จัดของ + จัดรถ ต่อหน่วย มี pipeline สถานะ แล้ว "นำแผนไปใช้"
import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  Package,
  PackageCheck,
  Pencil,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  AssignModal,
  type AssignOption,
} from "@/components/general-jobs/assign-modal";
import { PlanUnitCard } from "@/components/planning/plan-unit-card";
import { usePlansStore } from "@/lib/store/plans-store";
import { useJobsStore } from "@/lib/store/jobs-store";
import {
  derivePlanState,
  planProgress,
  truckPoolForUnit,
  unitReadiness,
} from "@/lib/plan-helpers";
import { VEHICLES } from "@/lib/mock/vehicles";
import { DRIVERS } from "@/lib/mock/drivers";
import { depotName } from "@/lib/mock/depots";
import {
  DRIVER_STATUS_LABEL,
  DRIVER_STATUS_TONE,
  PLAN_STATE_LABEL,
  PLAN_STATE_TONE,
  VEHICLE_STATUS_LABEL,
  VEHICLE_STATUS_TONE,
  VEHICLE_TYPE_LABEL,
  formatNumber,
} from "@/lib/labels";
import type { PlanUnit } from "@/lib/types";

export default function PlanWorkspacePage() {
  const params = useParams<{ id: string }>();
  const planId = params.id;
  const router = useRouter();
  const { toast } = useToast();

  const plan = usePlansStore((s) => s.plans.find((p) => p.id === planId));
  const autoOptimize = usePlansStore((s) => s.autoOptimize);
  const applyPlan = usePlansStore((s) => s.applyPlan);
  const deletePlan = usePlansStore((s) => s.deletePlan);
  const renamePlan = usePlansStore((s) => s.renamePlan);
  const setUnitVehicle = usePlansStore((s) => s.setUnitVehicle);
  const setUnitDriver = usePlansStore((s) => s.setUnitDriver);

  const jobs = useJobsStore((s) => s.jobs);
  const jobMap = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs]);

  // ---------- state โมดัล/แก้ชื่อ ----------
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [truckTarget, setTruckTarget] = useState<PlanUnit | null>(null);
  const [driverTarget, setDriverTarget] = useState<PlanUnit | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);

  // แผนไม่พบ (เช่นถูกลบ หรือรีเฟรชแล้ว state หาย)
  if (!plan) {
    return (
      <Card className="mt-6">
        <EmptyState
          icon={CircleAlert}
          title="ไม่พบแผนนี้"
          subtitle="แผนอาจถูกลบ หรือยังไม่ได้สร้าง"
        />
        <div className="flex justify-center pb-8">
          <Link href="/transport/demo/planning">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              กลับไปหน้าแผนงาน
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  const state = derivePlanState(plan);
  const applied = state === "applied";
  const isReady = state === "ready";
  const { ready, total } = planProgress(plan);

  // สรุปตาม readiness
  const summary = { ready: 0, await_truck: 0, await_pack: 0, not_started: 0 };
  plan.units.forEach((u) => {
    summary[unitReadiness(u).key] += 1;
  });

  // ---------- actions ----------
  const startEditName = () => {
    setNameDraft(plan.name);
    setEditingName(true);
  };
  const saveName = () => {
    renamePlan(plan.id, nameDraft);
    setEditingName(false);
  };

  const handleOptimize = () => {
    autoOptimize(plan.id);
    toast("Optimize แผนอัตโนมัติแล้ว — จัดของและจัดรถให้ทุกหน่วย", "success");
  };

  const handleApply = () => {
    applyPlan(plan.id);
    setApplyOpen(false);
    toast(`นำแผน ${plan.id} ไปใช้แล้ว — มอบหมายงานเรียบร้อย`, "success");
    router.push("/transport/demo/jobs");
  };

  const handleDelete = () => {
    deletePlan(plan.id);
    toast(`ลบแผน ${plan.name} แล้ว`, "info");
    router.push("/transport/demo/planning");
  };

  // ---------- ตัวเลือกใน picker ----------
  const truckOptions: AssignOption[] = truckTarget
    ? truckPoolForUnit(truckTarget, VEHICLES).map((v) => ({
        id: v.id,
        title: v.plate,
        subtitle: `${VEHICLE_TYPE_LABEL[v.type]} · ${depotName(v.depotId)} · คะแนน ${v.score}`,
        badgeLabel: VEHICLE_STATUS_LABEL[v.status],
        badgeTone: VEHICLE_STATUS_TONE[v.status],
      }))
    : [];

  const driverOptions: AssignOption[] = DRIVERS.filter(
    (d) => d.status === "ready"
  ).map((d) => ({
    id: d.id,
    title: d.name,
    subtitle: `${d.code} · ${depotName(d.depotId)}`,
    badgeLabel: DRIVER_STATUS_LABEL[d.status],
    badgeTone: DRIVER_STATUS_TONE[d.status],
  }));

  return (
    <div>
      {/* ---------- แถบบน ---------- */}
      <div className="mb-6">
        <Link
          href="/transport/demo/planning"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-mid transition-colors hover:text-charcoal-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          แผนงานทั้งหมด
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  className="rounded-inputs border border-hairline px-2 py-1 text-lg font-semibold text-charcoal-ink outline-none focus:border-deep-charcoal"
                />
                <Button size="sm" onClick={saveName}>
                  <Check className="h-4 w-4" />
                  บันทึก
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-charcoal-ink lg:text-2xl">
                  {plan.name}
                </h1>
                {!applied && (
                  <button
                    type="button"
                    onClick={startEditName}
                    aria-label="แก้ไขชื่อแผน"
                    className="rounded-inputs p-1 text-slate-mid transition-colors hover:bg-bone hover:text-charcoal-ink"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-mid">
              {plan.id}
              <Badge tone={PLAN_STATE_TONE[state]}>
                {PLAN_STATE_LABEL[state]}
              </Badge>
              <span>
                พร้อมออกรถ {formatNumber(ready)}/{formatNumber(total)}
              </span>
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {!applied && (
              <>
                <Button variant="outline" onClick={handleOptimize}>
                  <Sparkles className="h-4 w-4" />
                  Optimize อัตโนมัติ
                </Button>
                <Button
                  variant="orange"
                  disabled={!isReady}
                  onClick={() => setApplyOpen(true)}
                >
                  <Truck className="h-4 w-4" />
                  นำแผนไปใช้
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={handleDelete}
              aria-label="ลบแผน"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ---------- แถบสรุป pipeline ---------- */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryChip
          label="พร้อมออกรถ"
          value={summary.ready}
          tone="emerald"
        />
        <SummaryChip label="รอจัดรถ" value={summary.await_truck} tone="amber" />
        <SummaryChip label="รอจัดของ" value={summary.await_pack} tone="sky" />
        <SummaryChip
          label="รอดำเนินการ"
          value={summary.not_started}
          tone="slate"
        />
      </div>

      {applied && (
        <Card className="mb-6 border-l-4 border-l-logo-violet p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-charcoal-ink">
            <PackageCheck className="h-4 w-4 text-logo-violet" />
            แผนนี้ถูกนำไปใช้แล้ว — งานทั้งหมดถูกมอบหมายรถและคนขับในหน้าจัดการงานเรียบร้อย
          </p>
        </Card>
      )}

      {/* ---------- รายการหน่วยจัดส่ง ---------- */}
      <div className="space-y-3">
        {plan.units.map((unit) => (
          <PlanUnitCard
            key={unit.id}
            planId={plan.id}
            unit={unit}
            job={jobMap.get(unit.jobId)}
            readOnly={applied}
            onOpen3D={(u) =>
              router.push(
                `/transport/demo/loading-3d?planId=${plan.id}&unitId=${u.id}`
              )
            }
            onAssignTruck={setTruckTarget}
            onAssignDriver={setDriverTarget}
          />
        ))}
      </div>

      {/* ---------- picker รถ ---------- */}
      <AssignModal
        open={truckTarget !== null}
        title={`จัดรถ — ${jobMap.get(truckTarget?.jobId ?? "")?.jobNo ?? ""}`}
        description={
          truckTarget?.needsContainer
            ? "เลือกหัวลากสำหรับลากตู้"
            : "เลือกรถบรรทุก (มีตู้ในตัว) สำหรับงานนี้"
        }
        options={truckOptions}
        emptyTitle="ไม่มีรถที่มอบหมายได้"
        emptySubtitle="รถทุกคันไม่ว่างหรืออยู่ระหว่างซ่อมบำรุง"
        confirmLabel="จัดรถคันนี้"
        onClose={() => setTruckTarget(null)}
        onConfirm={(vehicleId) => {
          if (truckTarget) {
            setUnitVehicle(plan.id, truckTarget.id, vehicleId);
            toast("จัดรถให้หน่วยงานแล้ว", "success");
          }
          setTruckTarget(null);
        }}
      />

      {/* ---------- picker คนขับ ---------- */}
      <AssignModal
        open={driverTarget !== null}
        title={`เลือกคนขับ — ${jobMap.get(driverTarget?.jobId ?? "")?.jobNo ?? ""}`}
        description="เลือกคนขับที่พร้อมรับงาน"
        options={driverOptions}
        emptyTitle="ไม่มีคนขับที่พร้อมรับงาน"
        emptySubtitle="คนขับทุกคนกำลังทำงานหรืออยู่นอกเวลางาน"
        confirmLabel="เลือกคนขับ"
        onClose={() => setDriverTarget(null)}
        onConfirm={(driverId) => {
          if (driverTarget) {
            setUnitDriver(plan.id, driverTarget.id, driverId);
            toast("เลือกคนขับให้หน่วยงานแล้ว", "success");
          }
          setDriverTarget(null);
        }}
      />

      {/* ---------- ยืนยันนำแผนไปใช้ ---------- */}
      <Modal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title="นำแผนไปใช้"
        footer={
          <>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="orange" onClick={handleApply}>
              <Check className="h-4 w-4" />
              ยืนยันนำไปใช้
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-mid">
            ระบบจะมอบหมายรถและคนขับตามแผนนี้ให้งานทั้งหมด
            และเปลี่ยนสถานะงานที่รอดำเนินการเป็น “มอบหมายแล้ว”
          </p>
          <div className="rounded-inputs bg-bone p-3 text-sm">
            <p className="flex items-center gap-2 text-charcoal-ink">
              <Package className="h-4 w-4 text-slate-mid" />
              จำนวนงานในแผน: {formatNumber(plan.units.length)} งาน
            </p>
            <p className="mt-1 flex items-center gap-2 text-charcoal-ink">
              <Truck className="h-4 w-4 text-slate-mid" />
              จัดรถแล้ว:{" "}
              {formatNumber(plan.units.filter((u) => u.vehicleId).length)} หน่วย
            </p>
            <p className="mt-1 flex items-center gap-2 text-emerald-700">
              <PackageCheck className="h-4 w-4" />
              พร้อมออกรถ: {formatNumber(ready)}/{formatNumber(total)} หน่วย
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

type SummaryTone = "emerald" | "amber" | "sky" | "slate";
const SUMMARY_DOT: Record<SummaryTone, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  slate: "bg-slate-400",
};

function SummaryChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: SummaryTone;
}) {
  return (
    <div className="flex items-center gap-3 rounded-cards border border-hairline bg-white p-3">
      <span className={`h-2.5 w-2.5 rounded-full ${SUMMARY_DOT[tone]}`} />
      <div className="min-w-0">
        <p className="text-lg font-semibold text-charcoal-ink">
          {formatNumber(value)}
        </p>
        <p className="truncate text-xs text-slate-mid">{label}</p>
      </div>
    </div>
  );
}
