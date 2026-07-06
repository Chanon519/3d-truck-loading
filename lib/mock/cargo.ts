// ===== Compatibility shim: aggregate ข้อมูลจากออเดอร์ทั้งหมด (lib/mock/packing-orders.ts) =====
// ใช้โดยหน้าที่ต้องการภาพรวม "สินค้าทั้งหมดที่รอบรรจุ" เช่น การ์ดสรุปในหน้าวางแผน
// หน้าจัดของเข้าตู้ 3D เองใช้ store's activeGroups/activeItems (เฉพาะออเดอร์ที่เลือก) ไม่ใช่ไฟล์นี้
import type { CargoGroup, CargoItem } from "@/lib/types";
import {
  DEMO_CONTAINER_NO as _DEMO_CONTAINER_NO,
  PACKING_ORDERS,
} from "@/lib/mock/packing-orders";

export const CARGO_GROUPS: CargoGroup[] = PACKING_ORDERS.map((o) => ({
  id: o.id,
  name: o.customer,
  destination: o.destination,
  color: o.color,
  unloadOrder: o.unloadOrder,
}));

export const CARGO_ITEMS: CargoItem[] = PACKING_ORDERS.flatMap((o) => o.items);

export const DEMO_CONTAINER_NO = _DEMO_CONTAINER_NO;
