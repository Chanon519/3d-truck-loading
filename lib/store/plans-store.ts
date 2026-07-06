// ===== Zustand store: แผนงานที่ผู้ใช้สร้างเอง =====
// แผน = ก้อนงานที่เลือกจากหน้าจัดการงาน → จัดของ/จัดรถต่อหน่วย → "นำแผนไปใช้" = เขียนกลับ jobsStore
import { create } from "zustand";
import type {
  Job,
  PackingResult,
  PlanUnit,
  TransportPlan,
  ContainerSize,
} from "@/lib/types";
import { CONTAINER_SPECS } from "@/lib/container-specs";
import { PACKING_ORDERS } from "@/lib/mock/packing-orders";
import { VEHICLES } from "@/lib/mock/vehicles";
import { DRIVERS } from "@/lib/mock/drivers";
import { computePacking } from "@/lib/algorithms/packing";
import {
  derivePlanState,
  truckPoolForUnit,
  unitFromJob,
} from "@/lib/plan-helpers";
import { useJobsStore } from "@/lib/store/jobs-store";

export interface PlansStore {
  plans: TransportPlan[];
  seq: number;

  createPlan: (name: string, jobIds: string[]) => string;
  deletePlan: (planId: string) => void;
  renamePlan: (planId: string, name: string) => void;

  setUnitContainerType: (
    planId: string,
    unitId: string,
    type: ContainerSize
  ) => void;
  setUnitVehicle: (planId: string, unitId: string, vehicleId: string) => void;
  setUnitDriver: (planId: string, unitId: string, driverId: string) => void;
  clearUnitVehicle: (planId: string, unitId: string) => void;

  packUnit: (planId: string, unitId: string, result: PackingResult) => void;
  autoPackUnit: (planId: string, unitId: string) => void;
  unpackUnit: (planId: string, unitId: string) => void;

  autoOptimize: (planId: string) => void;
  applyPlan: (planId: string) => void;
}

// คำนวณผลจัดของของหน่วย จากออเดอร์ที่ผูกไว้ (ใช้ container spec ตามชนิดตู้ที่เลือก)
function computeUnitPacking(unit: PlanUnit): PackingResult | null {
  const orders = PACKING_ORDERS.filter((o) =>
    unit.packingOrderIds?.includes(o.id)
  );
  if (orders.length === 0) return null;
  const groups = orders.map((o) => ({
    id: o.id,
    name: o.customer,
    destination: o.destination,
    color: o.color,
    unloadOrder: o.unloadOrder,
  }));
  const items = orders.flatMap((o) => o.items);
  const spec = CONTAINER_SPECS[unit.containerType ?? "40HQ"];
  return computePacking(items, groups, spec);
}

// sync สถานะแผน (draft/ready) หลังทุกการแก้หน่วย — ยกเว้นแผนที่ applied แล้ว
function withState(plan: TransportPlan): TransportPlan {
  if (plan.state === "applied") return plan;
  const state = derivePlanState(plan);
  return plan.state === state ? plan : { ...plan, state };
}

export const usePlansStore = create<PlansStore>()((set, get) => {
  // helper แก้แผนเดียวแล้ว sync สถานะ
  const update = (planId: string, fn: (plan: TransportPlan) => TransportPlan) =>
    set((s) => ({
      plans: s.plans.map((p) => (p.id === planId ? withState(fn(p)) : p)),
    }));

  // helper แก้หน่วยเดียวในแผน
  const updateUnit = (
    planId: string,
    unitId: string,
    fn: (unit: PlanUnit) => PlanUnit
  ) =>
    update(planId, (plan) => ({
      ...plan,
      units: plan.units.map((u) => (u.id === unitId ? fn(u) : u)),
    }));

  return {
    plans: [],
    seq: 0,

    createPlan: (name, jobIds) => {
      const jobs = useJobsStore.getState().jobs;
      const selected = jobIds
        .map((id) => jobs.find((j) => j.id === id))
        .filter((j): j is Job => Boolean(j));
      const units = selected.map((job, i) => unitFromJob(job, i));
      const seq = get().seq + 1;
      const id = `PLN-${String(seq).padStart(3, "0")}`;
      const plan: TransportPlan = {
        id,
        name: name.trim() || `แผน ${id}`,
        createdAt: new Date().toISOString(),
        jobIds: selected.map((j) => j.id),
        units,
        state: "draft",
      };
      set((s) => ({ plans: [withState(plan), ...s.plans], seq }));
      return id;
    },

    deletePlan: (planId) =>
      set((s) => ({ plans: s.plans.filter((p) => p.id !== planId) })),

    renamePlan: (planId, name) =>
      update(planId, (plan) => ({ ...plan, name: name.trim() || plan.name })),

    setUnitContainerType: (planId, unitId, type) =>
      updateUnit(planId, unitId, (u) => ({
        ...u,
        containerType: type,
        // เปลี่ยนตู้ = ต้องจัดของใหม่
        packed: !u.needsPacking,
        packingResult: undefined,
      })),

    setUnitVehicle: (planId, unitId, vehicleId) =>
      updateUnit(planId, unitId, (u) => ({ ...u, vehicleId })),

    setUnitDriver: (planId, unitId, driverId) =>
      updateUnit(planId, unitId, (u) => ({ ...u, driverId })),

    clearUnitVehicle: (planId, unitId) =>
      updateUnit(planId, unitId, (u) => ({
        ...u,
        vehicleId: undefined,
        driverId: undefined,
      })),

    packUnit: (planId, unitId, result) =>
      updateUnit(planId, unitId, (u) => ({
        ...u,
        packed: true,
        packingResult: result,
      })),

    autoPackUnit: (planId, unitId) =>
      updateUnit(planId, unitId, (u) => {
        if (!u.needsPacking) return u;
        const result = computeUnitPacking(u);
        return result ? { ...u, packed: true, packingResult: result } : u;
      }),

    unpackUnit: (planId, unitId) =>
      updateUnit(planId, unitId, (u) =>
        u.needsPacking ? { ...u, packed: false, packingResult: undefined } : u
      ),

    // OPTIMIZE อัตโนมัติ: จัดของ (computePacking) + จัดรถ/คนขับ แบบ greedy ให้ทุกหน่วยที่ยังขาด
    autoOptimize: (planId) =>
      update(planId, (plan) => {
        const usedVehicles = new Set(
          plan.units.map((u) => u.vehicleId).filter(Boolean) as string[]
        );
        const usedDrivers = new Set(
          plan.units.map((u) => u.driverId).filter(Boolean) as string[]
        );
        const readyDrivers = DRIVERS.filter((d) => d.status === "ready");

        const units = plan.units.map((u) => {
          const next: PlanUnit = { ...u };

          // มิติจัดของ
          if (next.needsPacking && !next.packed) {
            const result = computeUnitPacking(next);
            if (result) {
              next.packed = true;
              next.packingResult = result;
            }
          }

          // มิติจัดรถ — เลือกรถที่ว่างก่อน แล้วคะแนนสูง (deterministic ด้วย id)
          if (!next.vehicleId) {
            const truck = truckPoolForUnit(next, VEHICLES)
              .filter((v) => !usedVehicles.has(v.id))
              .sort(
                (a, b) =>
                  (a.status === "available" ? 0 : 1) -
                    (b.status === "available" ? 0 : 1) ||
                  b.score - a.score ||
                  a.id.localeCompare(b.id)
              )[0];
            if (truck) {
              next.vehicleId = truck.id;
              usedVehicles.add(truck.id);
            }
          }

          // มิติคนขับ
          if (!next.driverId) {
            const driver = readyDrivers.find((d) => !usedDrivers.has(d.id));
            if (driver) {
              next.driverId = driver.id;
              usedDrivers.add(driver.id);
            }
          }

          return next;
        });

        return { ...plan, units };
      }),

    // นำแผนไปใช้: เขียนรถ/คนขับ/สถานะกลับเข้า jobsStore แล้ว mark applied (ปิด loop)
    applyPlan: (planId) => {
      const plan = get().plans.find((p) => p.id === planId);
      if (!plan) return;
      const js = useJobsStore.getState();

      plan.units.forEach((u) => {
        if (u.vehicleId) js.assignVehicle(u.jobId, u.vehicleId);
        if (u.driverId) js.assignDriver(u.jobId, u.driverId);
      });
      // เลื่อนสถานะเฉพาะงานที่ยัง pending — กันทับงานที่ดำเนินการไปแล้ว
      const jobsNow = useJobsStore.getState().jobs;
      plan.units.forEach((u) => {
        const job = jobsNow.find((j) => j.id === u.jobId);
        if (job && job.status === "pending") js.setStatus(u.jobId, "assigned");
      });

      set((s) => ({
        plans: s.plans.map((p) =>
          p.id === planId ? { ...p, state: "applied" } : p
        ),
      }));
    },
  };
});

// ---------- selector helper (ไม่ใช่ hook) ----------
// หาแผนที่มีงานนี้อยู่ — เลือกแผนที่ applied ก่อน (แสดง badge "อยู่ในแผน" ในหน้าจัดการงาน)
export function findPlanForJob(
  plans: TransportPlan[],
  jobId: string
): TransportPlan | undefined {
  const containing = plans.filter((p) => p.jobIds.includes(jobId));
  return containing.find((p) => p.state === "applied") ?? containing[0];
}
