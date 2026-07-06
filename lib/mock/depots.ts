// ===== Mock data: Depot 3 แห่ง =====
import type { Depot } from "@/lib/types";

export const DEPOTS: Depot[] = [
  {
    id: "DEP-LKB",
    name: "ICD ลาดกระบัง",
    shortName: "ลาดกระบัง",
    province: "กรุงเทพฯ",
    utilization: 78,
  },
  {
    id: "DEP-LCB",
    name: "Depot แหลมฉบัง",
    shortName: "แหลมฉบัง",
    province: "ชลบุรี",
    utilization: 64,
  },
  {
    id: "DEP-BNA",
    name: "Depot บางนา",
    shortName: "บางนา",
    province: "สมุทรปราการ",
    utilization: 52,
  },
];

// คืนชื่อย่อ depot จาก id — คืน "-" ถ้าไม่พบ
export function depotName(id?: string): string {
  if (!id) return "-";
  const depot = DEPOTS.find((d) => d.id === id);
  return depot ? depot.shortName : "-";
}
