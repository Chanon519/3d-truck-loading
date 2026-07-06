// ===== Mock data: ผังช่องจอด/ลานตู้ทั้ง 3 Depot (deterministic — ไม่มี random) =====
// โครงสร้าง: สร้างช่องว่างทั้งหมดจากนิยามโซน แล้ว override ช่องที่มีของ/จอง/ปัญหา
// ความสอดคล้องกับ mock อื่น:
// - รถที่จอดในโซน ready/maintenance คือรถที่ "ไม่ได้วิ่งงาน" ใน VEHICLES (vehicleId = ทะเบียน)
// - ตู้ TCLU 482913-7 อยู่ช่อง L-01 ลาดกระบัง (ตู้ demo แผนจัดตู้ / งาน CNT-2607-012)
// - งานทอยตู้ใน JOBS อ้างช่องจริง: Y-11→L-03 (กำลังทอย), S-03→Y-18 (จองปลายทาง) ฯลฯ
import type { DepotSlot, DepotZoneType, SlotStatus } from "@/lib/types";

interface ZoneDef {
  depotId: string;
  depotName: string;
  depotShort: string; // ใช้ประกอบ id เช่น LKB-Y-12
  zone: DepotZoneType;
  rows: number;
  cols: number;
  prefix: string; // ตัวอักษรนำหน้า slotCode เช่น "A", "Y"
  slotType: "vehicle" | "container" | "mixed";
  baseStatus?: SlotStatus; // ใช้กับโซน blocked
  baseNote?: string;
}

const ZONES: ZoneDef[] = [
  // ---------- ICD ลาดกระบัง (depot หลัก) ----------
  { depotId: "DEP-LKB", depotName: "ICD ลาดกระบัง", depotShort: "LKB", zone: "ready", rows: 2, cols: 8, prefix: "A", slotType: "vehicle" },
  { depotId: "DEP-LKB", depotName: "ICD ลาดกระบัง", depotShort: "LKB", zone: "maintenance", rows: 1, cols: 6, prefix: "M", slotType: "vehicle" },
  { depotId: "DEP-LKB", depotName: "ICD ลาดกระบัง", depotShort: "LKB", zone: "container_yard", rows: 3, cols: 10, prefix: "Y", slotType: "container" },
  { depotId: "DEP-LKB", depotName: "ICD ลาดกระบัง", depotShort: "LKB", zone: "loading", rows: 1, cols: 6, prefix: "L", slotType: "mixed" },
  { depotId: "DEP-LKB", depotName: "ICD ลาดกระบัง", depotShort: "LKB", zone: "staging", rows: 1, cols: 8, prefix: "S", slotType: "mixed" },
  { depotId: "DEP-LKB", depotName: "ICD ลาดกระบัง", depotShort: "LKB", zone: "blocked", rows: 1, cols: 4, prefix: "B", slotType: "mixed", baseStatus: "blocked", baseNote: "ปิดโซนเพื่อซ่อมพื้นผิวลานตามแผนงาน" },
  // ---------- Depot แหลมฉบัง ----------
  { depotId: "DEP-LCB", depotName: "Depot แหลมฉบัง", depotShort: "LCB", zone: "ready", rows: 1, cols: 6, prefix: "A", slotType: "vehicle" },
  { depotId: "DEP-LCB", depotName: "Depot แหลมฉบัง", depotShort: "LCB", zone: "container_yard", rows: 2, cols: 8, prefix: "Y", slotType: "container" },
  { depotId: "DEP-LCB", depotName: "Depot แหลมฉบัง", depotShort: "LCB", zone: "loading", rows: 1, cols: 4, prefix: "L", slotType: "mixed" },
  // ---------- Depot บางนา ----------
  { depotId: "DEP-BNA", depotName: "Depot บางนา", depotShort: "BNA", zone: "ready", rows: 1, cols: 5, prefix: "A", slotType: "vehicle" },
  { depotId: "DEP-BNA", depotName: "Depot บางนา", depotShort: "BNA", zone: "container_yard", rows: 1, cols: 8, prefix: "Y", slotType: "container" },
  { depotId: "DEP-BNA", depotName: "Depot บางนา", depotShort: "BNA", zone: "staging", rows: 1, cols: 4, prefix: "S", slotType: "mixed" },
];

// override รายช่อง — key คือ id ของช่อง (เช่น "LKB-Y-12")
const OVERRIDES: Record<string, Partial<DepotSlot>> = {
  // ===== ลาดกระบัง: โซนรถพร้อมวิ่ง (รถ available ของ LKB) =====
  "LKB-A-01": { occupancyType: "vehicle", vehicleId: "70-9925", status: "occupied" }, // VEH-05
  "LKB-A-02": { occupancyType: "vehicle", vehicleId: "82-4455", status: "occupied" }, // VEH-09
  "LKB-A-05": { status: "reserved", note: "จองรอ 70-1234 กลับเข้า Depot เย็นนี้" },
  "LKB-A-12": { status: "problem", note: "พื้นชำรุด รอซ่อม" },
  // ===== ลาดกระบัง: โซนรถรอซ่อม =====
  "LKB-M-01": { occupancyType: "vehicle", vehicleId: "70-2210", status: "occupied", note: "รถเสียจากงาน CNT-2607-009 รอเปลี่ยนอะไหล่เกียร์" }, // VEH-07
  "LKB-M-02": { occupancyType: "vehicle", vehicleId: "84-6641", status: "occupied", note: "ซ่อมบำรุงตามรอบ 60,000 กม." }, // VEH-13
  // ===== ลาดกระบัง: ลานตู้ Y-01..Y-30 =====
  "LKB-Y-01": { occupancyType: "container", containerId: "MSCU 445210-9", status: "occupied" },
  // Y-02 ว่าง — ตู้ถูกทอยไป L-02 แล้ว (งาน SHT-2607-001)
  "LKB-Y-03": { occupancyType: "container", containerId: "TCKU 280471-5", status: "occupied" },
  "LKB-Y-04": { occupancyType: "container", containerId: "GLDU 774092-6", status: "occupied" },
  "LKB-Y-05": { occupancyType: "container", containerId: "NYKU 550913-8", status: "occupied" },
  "LKB-Y-06": { occupancyType: "container", containerId: "HJCU 662385-0", status: "occupied" },
  // Y-07 ว่าง — ตู้ถูกทอยไป Depot บางนาแล้ว (งาน SHT-2607-004)
  "LKB-Y-08": { occupancyType: "container", containerId: "UACU 508112-3", status: "occupied" },
  "LKB-Y-09": { occupancyType: "container", containerId: "PONU 331904-7", status: "occupied" },
  "LKB-Y-10": { occupancyType: "container", containerId: "KKFU 776281-4", status: "occupied" },
  "LKB-Y-11": { occupancyType: "container", containerId: "FCIU 887293-1", status: "occupied", note: "กำลังทอยไปโซน Loading (งาน SHT-2607-003)" },
  "LKB-Y-12": { occupancyType: "container", containerId: "SUDU 490215-8", status: "problem", note: "ตู้เสียหาย รอสำรวจ" },
  "LKB-Y-13": { occupancyType: "container", containerId: "MOLU 118762-9", status: "occupied" },
  "LKB-Y-14": { occupancyType: "container", containerId: "MEDU 337945-8", status: "occupied" },
  "LKB-Y-15": { occupancyType: "container", containerId: "COSU 613440-2", status: "occupied" },
  "LKB-Y-16": { occupancyType: "container", containerId: "GATU 118503-6", status: "occupied" },
  "LKB-Y-17": { occupancyType: "container", containerId: "YMLU 884320-1", status: "occupied" },
  "LKB-Y-18": { status: "reserved", note: "จองรอตู้ TLLU 559046-2 จาก Staging S-03" },
  "LKB-Y-19": { occupancyType: "container", containerId: "INBU 274815-6", status: "occupied" },
  "LKB-Y-20": { occupancyType: "container", containerId: "BSIU 902733-4", status: "occupied" },
  "LKB-Y-21": { occupancyType: "container", containerId: "ZCSU 690184-3", status: "occupied" },
  "LKB-Y-22": { occupancyType: "container", containerId: "TEMU 501338-2", status: "occupied", note: "รอทอยไป Staging (งาน SHT-2607-007)" },
  "LKB-Y-23": { occupancyType: "container", containerId: "AMFU 880134-2", status: "occupied" },
  "LKB-Y-24": { occupancyType: "container", containerId: "DFSU 448209-0", status: "occupied" },
  "LKB-Y-25": { occupancyType: "container", containerId: "TRLU 902466-5", status: "occupied" },
  "LKB-Y-26": { occupancyType: "container", containerId: "TCLU 990412-5", status: "occupied" },
  // Y-27 ว่าง — ปลายทางงานทอยตู้พรุ่งนี้ (SHT-2607-008)
  "LKB-Y-28": { occupancyType: "container", containerId: "CAIU 337518-4", status: "occupied" },
  "LKB-Y-29": { occupancyType: "container", containerId: "SEGU 274860-9", status: "occupied" },
  "LKB-Y-30": { occupancyType: "container", containerId: "SLSU 662091-7", status: "occupied" },
  // ===== ลาดกระบัง: โซน Loading =====
  "LKB-L-01": { occupancyType: "container", containerId: "TCLU 482913-7", status: "occupied", note: "กำลังบรรจุสินค้าตามแผนจัดตู้ รอปิดตู้" },
  "LKB-L-02": { occupancyType: "container", containerId: "TCNU 662180-3", status: "occupied", note: "รอโหลดขึ้นรถ" },
  "LKB-L-03": { status: "reserved", note: "จองรับตู้ FCIU 887293-1 จากลาน Y-11" },
  // ===== ลาดกระบัง: โซน Staging =====
  "LKB-S-01": { occupancyType: "container", containerId: "BEAU 407733-1", status: "occupied" },
  "LKB-S-03": { occupancyType: "container", containerId: "TLLU 559046-2", status: "occupied", note: "รอทอยไปลาน Y-18 (งาน SHT-2607-005)" },
  "LKB-S-04": { occupancyType: "container", containerId: "KMTU 508649-2", status: "occupied" },
  "LKB-S-06": { occupancyType: "container", containerId: "SZLU 229840-7", status: "occupied" },

  // ===== แหลมฉบัง: โซนรถพร้อมวิ่ง (รถ available ของ LCB) =====
  "LCB-A-01": { occupancyType: "vehicle", vehicleId: "71-8842", status: "occupied" }, // VEH-02
  "LCB-A-02": { occupancyType: "vehicle", vehicleId: "82-9033", status: "occupied" }, // VEH-11
  "LCB-A-04": { status: "reserved", note: "จองรอ 72-3307 กลับจากงานส่งตู้" },
  // ===== แหลมฉบัง: ลานตู้ Y-01..Y-16 =====
  "LCB-Y-01": { occupancyType: "container", containerId: "HDMU 664209-1", status: "occupied" },
  "LCB-Y-02": { occupancyType: "container", containerId: "TGBU 335077-2", status: "occupied" },
  "LCB-Y-04": { occupancyType: "container", containerId: "OOCU 881546-9", status: "occupied" },
  // Y-05 ว่าง — ตู้ถูกทอยไป L-02 แล้ว (งาน SHT-2607-002)
  "LCB-Y-06": { occupancyType: "container", containerId: "WHLU 220693-5", status: "occupied" },
  "LCB-Y-08": { occupancyType: "container", containerId: "SITU 774830-6", status: "occupied" },
  "LCB-Y-09": { occupancyType: "container", containerId: "TRHU 605194-7", status: "occupied" },
  "LCB-Y-10": { occupancyType: "container", containerId: "MAGU 508294-3", status: "occupied" },
  "LCB-Y-11": { occupancyType: "container", containerId: "MRKU 663108-2", status: "problem", note: "ตู้พบรอยรั่วหลังคา รอลูกค้ายืนยันการเคลม" },
  "LCB-Y-12": { occupancyType: "container", containerId: "APLU 733920-6", status: "occupied", note: "รอทอยไปโซน Loading พรุ่งนี้ (งาน SHT-2607-006)" },
  "LCB-Y-14": { occupancyType: "container", containerId: "CCLU 490817-3", status: "occupied" },
  "LCB-Y-15": { occupancyType: "container", containerId: "NYKU 331276-0", status: "occupied" },
  // ===== แหลมฉบัง: โซน Loading =====
  "LCB-L-02": { occupancyType: "container", containerId: "BMOU 274401-8", status: "occupied", note: "รอโหลดสินค้าขึ้นตู้" },

  // ===== บางนา: โซนรถพร้อมวิ่ง =====
  "BNA-A-01": { occupancyType: "vehicle", vehicleId: "85-2277", status: "occupied" }, // VEH-12
  "BNA-A-02": { occupancyType: "vehicle", vehicleId: "1ฒค-4592", status: "occupied", note: "จอดพักรอต่อภาษีประจำปี" }, // VEH-14
  // ===== บางนา: ลานตู้ Y-01..Y-08 =====
  "BNA-Y-01": { occupancyType: "container", containerId: "EITU 158027-4", status: "occupied" },
  "BNA-Y-03": { occupancyType: "container", containerId: "GESU 401177-5", status: "occupied", note: "รับทอยมาจาก ICD ลาดกระบังเช้านี้" },
  "BNA-Y-04": { occupancyType: "container", containerId: "TSSU 902247-1", status: "occupied" },
  "BNA-Y-06": { occupancyType: "container", containerId: "CMAU 902613-0", status: "occupied", note: "รอทอยไป ICD ลาดกระบังพรุ่งนี้ (งาน SHT-2607-008)" },
  "BNA-Y-07": { occupancyType: "container", containerId: "IPXU 447261-8", status: "occupied" },
  // ===== บางนา: โซน Staging =====
  "BNA-S-01": { occupancyType: "container", containerId: "PCIU 883620-5", status: "occupied" },
};

function buildSlots(): DepotSlot[] {
  const slots: DepotSlot[] = [];
  for (const zone of ZONES) {
    for (let r = 0; r < zone.rows; r++) {
      for (let c = 0; c < zone.cols; c++) {
        const num = r * zone.cols + c + 1;
        const slotCode = `${zone.prefix}-${String(num).padStart(2, "0")}`;
        const id = `${zone.depotShort}-${slotCode}`;
        const base: DepotSlot = {
          id,
          depotId: zone.depotId,
          depotName: zone.depotName,
          zone: zone.zone,
          row: r + 1,
          slot: c + 1,
          slotCode,
          slotType: zone.slotType,
          occupancyType: "none",
          status: zone.baseStatus ?? "empty",
          ...(zone.baseNote ? { note: zone.baseNote } : {}),
        };
        const override = OVERRIDES[id];
        slots.push(override ? { ...base, ...override } : base);
      }
    }
  }
  return slots;
}

export const DEPOT_SLOTS: DepotSlot[] = buildSlots();
