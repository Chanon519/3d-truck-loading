// ===== Zustand store: ผังช่องจอด/ลานตู้ใน Depot =====
import { create } from "zustand";
import type { DepotSlot } from "@/lib/types";
import { DEPOT_SLOTS } from "@/lib/mock/depot-slots";

export interface MoveResult {
  ok: boolean;
  message: string;
}

export interface DepotStore {
  slots: DepotSlot[];
  // ย้ายรถ/ตู้จากช่องหนึ่งไปอีกช่อง — คืนผลลัพธ์พร้อมข้อความภาษาไทยสำหรับ toast
  moveOccupant: (fromSlotId: string, toSlotId: string) => MoveResult;
}

// ตรวจว่าช่องปลายทางรองรับประเภทของที่ย้ายหรือไม่
function isSlotTypeCompatible(
  occupancyType: DepotSlot["occupancyType"],
  slotType: DepotSlot["slotType"]
): boolean {
  if (occupancyType === "vehicle") return slotType === "vehicle" || slotType === "mixed";
  if (occupancyType === "container") return slotType === "container" || slotType === "mixed";
  return false;
}

export const useDepotStore = create<DepotStore>()((set, get) => ({
  slots: DEPOT_SLOTS,

  moveOccupant: (fromSlotId, toSlotId) => {
    const slots = get().slots;
    const from = slots.find((s) => s.id === fromSlotId);
    const to = slots.find((s) => s.id === toSlotId);

    if (!from || !to) {
      return { ok: false, message: "ไม่พบช่องที่เลือก กรุณาลองใหม่อีกครั้ง" };
    }
    if (from.id === to.id) {
      return { ok: false, message: "ช่องต้นทางและปลายทางเป็นช่องเดียวกัน" };
    }
    if (from.occupancyType === "none") {
      return { ok: false, message: `ช่อง ${from.slotCode} ไม่มีรถหรือตู้ให้ย้าย` };
    }
    if (to.status !== "empty") {
      const reason =
        to.status === "occupied"
          ? to.occupancyType === "vehicle"
            ? `ช่อง ${to.slotCode} มีรถจอดอยู่แล้ว ไม่สามารถย้ายได้`
            : `ช่อง ${to.slotCode} มีตู้อยู่แล้ว ไม่สามารถย้ายได้`
          : to.status === "reserved"
            ? `ช่อง ${to.slotCode} ถูกจองไว้ ไม่สามารถย้ายได้`
            : to.status === "blocked"
              ? `ช่อง ${to.slotCode} ปิดใช้งานอยู่ ไม่สามารถย้ายได้`
              : `ช่อง ${to.slotCode} มีปัญหา ไม่สามารถใช้งานได้`;
      return { ok: false, message: reason };
    }
    if (!isSlotTypeCompatible(from.occupancyType, to.slotType)) {
      const reason =
        from.occupancyType === "vehicle"
          ? `ช่อง ${to.slotCode} รองรับเฉพาะตู้ Container ไม่สามารถนำรถไปจอดได้`
          : `ช่อง ${to.slotCode} รองรับเฉพาะรถ ไม่สามารถนำตู้ไปวางได้`;
      return { ok: false, message: reason };
    }

    set((state) => ({
      slots: state.slots.map((slot) => {
        if (slot.id === from.id) {
          // ช่องต้นทางกลับเป็นว่าง
          return {
            ...slot,
            occupancyType: "none" as const,
            vehicleId: undefined,
            containerId: undefined,
            status: "empty" as const,
            note: undefined,
          };
        }
        if (slot.id === to.id) {
          // ช่องปลายทางรับของ (พร้อม note เดิมของสิ่งที่ย้าย ถ้ามี)
          return {
            ...slot,
            occupancyType: from.occupancyType,
            vehicleId: from.vehicleId,
            containerId: from.containerId,
            status: "occupied" as const,
            note: from.note,
          };
        }
        return slot;
      }),
    }));

    return { ok: true, message: `ย้ายเรียบร้อย: ${from.slotCode} → ${to.slotCode}` };
  },
}));
