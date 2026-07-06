// ===== Logic ใช้ร่วมของ "แผนงาน" — map งาน→หน่วยจัดส่ง, คำนวณความพร้อม, เลือก pool รถ =====
import type {
  Job,
  PlanUnit,
  TransportPlan,
  PlanState,
  Vehicle,
  ContainerSize,
} from "@/lib/types";
import type { BadgeTone } from "@/lib/labels";
import { PACKING_ORDERS } from "@/lib/mock/packing-orders";
import { assignableTractors } from "@/lib/algorithms/truck-assignment";

// งานตู้ที่ไม่ได้ระบุขนาดตู้ → ใช้ค่าเริ่มต้น 40HQ
const DEFAULT_CONTAINER: ContainerSize = "40HQ";

// จำนวนออเดอร์ที่ผูกให้แต่ละหน่วยงานตู้ (สำหรับ demo หน้า 3D)
const ORDERS_PER_UNIT = 2;

// map 1 งาน → 1 หน่วยจัดส่ง
// index ใช้หมุนผูกออเดอร์ให้หน่วยงานตู้ เพื่อให้ตัวเลขสินค้าสมจริงและ deterministic
export function unitFromJob(job: Job, index: number): PlanUnit {
  const isContainer = job.type === "container";
  const isShuttle = job.type === "shuttle";
  const needsContainer = isContainer || isShuttle;
  const needsPacking = isContainer;

  let packingOrderIds: string[] | undefined;
  if (needsPacking && PACKING_ORDERS.length > 0) {
    packingOrderIds = Array.from({ length: ORDERS_PER_UNIT }, (_, k) => {
      const pick = (index * ORDERS_PER_UNIT + k) % PACKING_ORDERS.length;
      return PACKING_ORDERS[pick].id;
    });
    // กันซ้ำเมื่อออเดอร์มีน้อยกว่า ORDERS_PER_UNIT
    packingOrderIds = Array.from(new Set(packingOrderIds));
  }

  return {
    id: `PU-${index + 1}`,
    jobId: job.id,
    needsContainer,
    needsPacking,
    containerType: needsContainer
      ? job.containerSize ?? DEFAULT_CONTAINER
      : undefined,
    packed: !needsPacking, // ไม่ต้องจัดของ = ถือว่าผ่านมิติของแล้ว
    packingOrderIds,
    vehicleId: undefined,
    driverId: undefined,
  };
}

export type ReadinessKey = "ready" | "await_truck" | "await_pack" | "not_started";

export interface Readiness {
  key: ReadinessKey;
  label: string;
  tone: BadgeTone;
}

// สถานะความพร้อมของหน่วยจัดส่ง จาก 2 มิติ: จัดของ (packOk) + จัดรถ (truckOk)
export function unitReadiness(unit: PlanUnit): Readiness {
  const packOk = !unit.needsPacking || unit.packed;
  const truckOk = !!unit.vehicleId;

  if (packOk && truckOk) {
    return { key: "ready", label: "พร้อมออกรถ", tone: "emerald" };
  }
  if (packOk && !truckOk) {
    return {
      key: "await_truck",
      label: unit.needsPacking ? "จัดของแล้ว · รอจัดรถ" : "รอจัดรถ",
      tone: "amber",
    };
  }
  if (!packOk && truckOk) {
    return { key: "await_pack", label: "จัดรถแล้ว · รอจัดของ", tone: "sky" };
  }
  return { key: "not_started", label: "รอดำเนินการ", tone: "slate" };
}

// นับหน่วยที่ "พร้อมออกรถ" เทียบกับทั้งหมด
export function planProgress(plan: TransportPlan): { ready: number; total: number } {
  const total = plan.units.length;
  const ready = plan.units.filter(
    (u) => unitReadiness(u).key === "ready"
  ).length;
  return { ready, total };
}

// สถานะแผนที่แสดงผล: applied คงที่, ที่เหลือ derive จากความพร้อมของหน่วย
export function derivePlanState(plan: TransportPlan): PlanState {
  if (plan.state === "applied") return "applied";
  const { ready, total } = planProgress(plan);
  return total > 0 && ready === total ? "ready" : "draft";
}

// รถที่มอบหมายได้ให้หน่วยนี้: งานมีตู้ → หัวลาก, งานทั่วไป → รถที่มีตู้ในตัว (ไม่ใช่หัวลาก)
export function truckPoolForUnit(
  unit: PlanUnit,
  vehicles: Vehicle[]
): Vehicle[] {
  if (unit.needsContainer) {
    return assignableTractors(vehicles);
  }
  return vehicles.filter(
    (v) =>
      v.type !== "tractor" &&
      v.status !== "maintenance" &&
      v.status !== "inactive"
  );
}
