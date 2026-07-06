// ===== อัลกอริทึม demo: จับคู่ตู้คอนเทนเนอร์กับหัวลาก (Best Fit อย่างง่าย) =====
// แนวคิด: เรียงตู้ตามเวลานัด (ด่วนก่อน) แล้วจับกับหัวลากที่ "พร้อมทันที" ก่อน
// ตามด้วยหัวลากคะแนนสูง โดยตรวจไม่ให้น้ำหนักตู้เกินพิกัดหัวลาก
// ผลลัพธ์ให้คะแนนความเหมาะสม + เหตุผล/คำเตือนแบบภาษาคน สำหรับนำเสนอลูกค้า

import type { AwaitingContainer, TruckAssignment, Vehicle } from "@/lib/types";
import { DEPOTS, depotName } from "@/lib/mock/depots";
import {
  VEHICLE_TYPE_LABEL,
  formatNumber,
  formatThaiTime,
} from "@/lib/labels";

// พิกัดน้ำหนักตู้บรรทุกสูงสุดของหัวลาก (กก.) — ใช้ตรวจไม่ให้เกิน
export const TRACTOR_MAX_LOAD_KG = 26000;

export interface TruckAssignmentResult {
  assignments: TruckAssignment[];
  unassignedContainers: { container: AwaitingContainer; reason: string }[];
  idleTrucks: Vehicle[];
  avgScore: number;
}

// หัวลากที่มอบหมายได้ = ประเภทหัวลาก และไม่อยู่ระหว่างซ่อม/ปิดใช้งาน
export function assignableTractors(vehicles: Vehicle[]): Vehicle[] {
  return vehicles.filter(
    (v) =>
      v.type === "tractor" &&
      v.status !== "maintenance" &&
      v.status !== "inactive"
  );
}

// depot ของรถอยู่ใกล้ปลายทางตู้ไหม (heuristic: จับคู่จากจังหวัด/ชื่อย่อในข้อความปลายทาง)
function depotNearDestination(depotId: string, destination: string): boolean {
  const depot = DEPOTS.find((d) => d.id === depotId);
  if (!depot) return false;
  return (
    destination.includes(depot.province) ||
    destination.includes(depot.shortName)
  );
}

function buildAssignment(
  truck: Vehicle,
  container: AwaitingContainer
): TruckAssignment {
  const matchScore = Math.round(
    truck.score * 0.55 + truck.onTimeRate * 0.3 + truck.utilization * 0.15
  );

  const reasons: string[] = [];
  reasons.push(
    `หัวลาก ${truck.plate} (${VEHICLE_TYPE_LABEL[truck.type]}) คะแนนรวม ${truck.score} · ตรงเวลาเฉลี่ย ${truck.onTimeRate}%`
  );

  if (depotNearDestination(truck.depotId, container.destination)) {
    reasons.push(
      `ประจำ Depot ${depotName(truck.depotId)} อยู่ใกล้ปลายทาง ${container.destination} ช่วยลดระยะวิ่งเที่ยวเปล่า`
    );
  } else {
    reasons.push(`ประจำ Depot ${depotName(truck.depotId)}`);
  }

  reasons.push(
    `รองรับเวลานัดรับตู้ ${formatThaiTime(container.appointmentTime)} น. ได้`
  );

  if (truck.status === "available") {
    reasons.push("รถพร้อมออกงานได้ทันที");
  } else {
    reasons.push("รับงานต่อหลังเสร็จงานปัจจุบัน (จัดเป็นคิวถัดไป)");
  }

  const warnings: string[] = [];
  const loadPct = (container.weightKg / TRACTOR_MAX_LOAD_KG) * 100;
  if (loadPct > 90) {
    warnings.push(
      `น้ำหนักตู้ ${formatNumber(container.weightKg)} กก. ใกล้พิกัดหัวลาก (${Math.round(loadPct)}%) ควรตรวจใบอนุญาตน้ำหนัก`
    );
  }

  return {
    truckId: truck.id,
    containerIds: [container.id],
    score: Math.min(99, matchScore),
    reasons,
    warnings,
  };
}

export function computeTruckAssignment(
  containers: AwaitingContainer[],
  vehicles: Vehicle[]
): TruckAssignmentResult {
  // เรียงตู้: พร้อมจัด + เวลานัดเร็วสุดก่อน
  const readyContainers = containers
    .filter((c) => c.ready)
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

  // เรียงหัวลาก: พร้อมทันทีก่อน แล้วคะแนนสูงก่อน (ผูก tie ด้วย id ให้ deterministic)
  const trucks = assignableTractors(vehicles).sort((a, b) => {
    const rankA = a.status === "available" ? 0 : 1;
    const rankB = b.status === "available" ? 0 : 1;
    if (rankA !== rankB) return rankA - rankB;
    if (b.score !== a.score) return b.score - a.score;
    return a.id.localeCompare(b.id);
  });

  const assignments: TruckAssignment[] = [];
  const unassignedContainers: TruckAssignmentResult["unassignedContainers"] = [];
  const usedTruckIds = new Set<string>();

  for (const container of readyContainers) {
    // หาหัวลากคันแรกที่ยังว่างและรับน้ำหนักตู้ไหว
    const truck = trucks.find(
      (t) =>
        !usedTruckIds.has(t.id) && container.weightKg <= TRACTOR_MAX_LOAD_KG
    );

    if (!truck) {
      const overweight = container.weightKg > TRACTOR_MAX_LOAD_KG;
      unassignedContainers.push({
        container,
        reason: overweight
          ? "น้ำหนักตู้เกินพิกัดหัวลากที่ว่างในรอบนี้"
          : "หัวลากไม่พอในรอบนี้ — แนะนำจัดในรอบถัดไป",
      });
      continue;
    }

    usedTruckIds.add(truck.id);
    assignments.push(buildAssignment(truck, container));
  }

  // ตู้ที่ยังไม่พร้อมจัดรถ
  for (const container of containers.filter((c) => !c.ready)) {
    unassignedContainers.push({
      container,
      reason: "ตู้ยังไม่พร้อมจัดรถ (รอเอกสาร/ตรวจปล่อยตู้)",
    });
  }

  const idleTrucks = trucks.filter((t) => !usedTruckIds.has(t.id));
  const avgScore =
    assignments.length > 0
      ? Math.round(
          assignments.reduce((s, a) => s + a.score, 0) / assignments.length
        )
      : 0;

  return { assignments, unassignedContainers, idleTrucks, avgScore };
}
